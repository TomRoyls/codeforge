// ─── Interfaces ──────────────────────────────────────────

export interface DawnMeasure {
  warmth: number
  color: 'amber-gold' | 'warm-orange' | 'soft-peach' | 'pale-yellow' | 'cold-blue' | 'darkness'
  hasHighWarmth: boolean
  hasInviting: boolean
  hasWelcoming: boolean
  hasNoHostility: boolean
  hasGentle: boolean
  hasNoHarshness: boolean
  hasApproachable: boolean
  hasNoBarrier: boolean
  hasComfortable: boolean
  hasNoIntimidation: boolean
  hostilityCount: number
  barrierCount: number
}

export interface AwakeningMeasure {
  quality: number
  state: 'graceful-awakening' | 'smooth-startup' | 'gradual-warmup' | 'jarring-alarm' | 'rough-start' | 'failed-boot'
  hasHighQuality: boolean
  hasCleanInit: boolean
  hasProperSetup: boolean
  hasNoCrashOnWake: boolean
  hasLazyInit: boolean
  hasNoBlocking: boolean
  hasProgressive: boolean
  hasNoOverhead: boolean
  hasEfficient: boolean
  hasNoTimeout: boolean
  crashCount: number
  timeoutCount: number
}

export interface GrowthMeasure {
  potential: number
  trajectory: 'exponential' | 'strong-growth' | 'steady-climb' | 'linear' | 'plateau' | 'decline'
  hasHighPotential: boolean
  hasExtensible: boolean
  hasProperAbstraction: boolean
  hasNoRigidity: boolean
  hasModular: boolean
  hasNoCoupling: boolean
  hasPluginReady: boolean
  hasNoHardcoding: boolean
  hasOpenArchitecture: boolean
  hasNoCeiling: boolean
  rigidityCount: number
  couplingCount: number
}

export interface RadiantMeasure {
  level: number
  quality: 'blinding-brilliance' | 'clear-radiance' | 'bright-light' | 'dim-glow' | 'shadow' | 'darkness'
  hasHighLevel: boolean
  hasTransparent: boolean
  hasNoObfuscation: boolean
  hasClearPurpose: boolean
  hasNoAmbiguity: boolean
  hasIlluminated: boolean
  hasNoDarkCorners: boolean
  hasProperExposure: boolean
  hasVisible: boolean
  hasNoHiddenLogic: boolean
  ambiguityCount: number
  hiddenCount: number
}

export interface TransformationMeasure {
  power: number
  capability: 'metamorphic' | 'highly-adaptive' | 'flexible' | 'moderate' | 'rigid' | 'petrified'
  hasHighPower: boolean
  hasPolymorphic: boolean
  hasProperPatterns: boolean
  hasNoFragility: boolean
  hasAdaptive: boolean
  hasNoBreakage: boolean
  hasResilient: boolean
  hasNoBrittleness: boolean
  hasVersionable: boolean
  hasNoLockIn: boolean
  fragilityCount: number
  breakageCount: number
}

export interface GoldenMeasure {
  quality: number
  hour: 'golden-hour' | 'warm-light' | 'clear-day' | 'overcast' | 'gloomy' | 'night'
  hasHighQuality: boolean
  hasMasterful: boolean
  hasNoFlaws: boolean
  hasElegant: boolean
  hasNoWaste: boolean
  hasPurposeful: boolean
  hasNoRedundancy: boolean
  hasComplete: boolean
  hasNoMissing: boolean
  hasRefined: boolean
  flawCount: number
  wasteCount: number
}

export interface Sunbeam {
  file: string
  dawnWarmth: number
  awakeningQuality: number
  growthPotential: number
  radiance: number
  transformationPower: number
  goldenHourQuality: number
  dawn: DawnMeasure
  awakening: AwakeningMeasure
  growth: GrowthMeasure
  radiant: RadiantMeasure
  transformation: TransformationMeasure
  golden: GoldenMeasure
  condition: 'golden-masterpiece' | 'sunlit-excellence' | 'warm-professional' | 'cloudy-adequate' | 'dim-struggling' | 'darkness'
  qualityScore: number
}

export interface Horizon {
  directory: string
  beams: Sunbeam[]
  avgWarmth: number
  avgGrowth: number
  avgGolden: number
  goldenCount: number
  darkCount: number
  warmCount: number
  radiantCount: number
  horizonType: 'golden-horizon' | 'sunlit-landscape' | 'morning-meadow' | 'foggy-valley' | 'shadow-valley' | 'void'
  condition: 'dawn-of-excellence' | 'bright-morning' | 'warming-day' | 'overcast' | 'dusk' | 'midnight'
}

export interface AmberSunriseResult {
  beams: Sunbeam[]
  horizons: Horizon[]
  sky: {
    avgWarmth: number
    avgGrowth: number
    avgGolden: number
    isGolden: boolean
    overallRadiance: number
  }
  stats: {
    totalFiles: number
    totalHorizons: number
    avgDawnWarmth: number
    avgAwakeningQuality: number
    avgGrowthPotential: number
    avgRadiance: number
    avgTransformationPower: number
    avgGoldenHourQuality: number
    goldenMasterpieceCount: number
    sunlitExcellenceCount: number
    warmProfessionalCount: number
    cloudyAdequateCount: number
    dimStrugglingCount: number
    darknessCount: number
    hasHighWarmthCount: number
    hasHighQualityCount: number
    hasHighPotentialCount: number
    hasHighLevelCount: number
    hasHighPowerCount: number
    hasHighGoldenCount: number
    overallRadiance: number
    observerGrade: 'dawn-watcher' | 'sunrise-photographer' | 'light-seeker' | 'observer' | 'sleepyhead' | 'vampire'
    bestBeam: string
    warmest: string
    bestStartup: string
    mostExtensible: string
    clearest: string
    mostAdaptive: string
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

// ─── measureDawn ──────────────────────────────────────────

/** @example measureDawn(content) returns DawnMeasure */
export function measureDawn(content: string): DawnMeasure {
  let score = 0

  const hasInviting = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasWelcoming = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hostilityCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoHostility = hostilityCount === 0
  const hasGentle = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const hasNoHarshness = !NESTED_TERNARY_RE.test(content)
  const hasApproachable = TRY_RE.test(content) && CATCH_RE.test(content)
  const barrierCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoBarrier = barrierCount === 0
  const hasComfortable = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoIntimidation = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasInviting) score += 12
  if (hasWelcoming) score += 10
  if (hasNoHostility) score += 12
  if (hasGentle) score += 10
  if (hasNoHarshness) score += 10
  if (hasApproachable) score += 10
  if (hasNoBarrier) score += 11
  if (hasComfortable) score += 10
  if (hasNoIntimidation) score += 10

  const warmth = Math.min(100, Math.max(0, score))
  const hasHighWarmth = warmth >= 70

  let color: DawnMeasure['color'] = 'darkness'
  if (hasHighWarmth && hasNoHostility && hasInviting && hasComfortable) color = 'amber-gold'
  else if (hasHighWarmth && hasNoHostility) color = 'warm-orange'
  else if (hasHighWarmth) color = 'soft-peach'
  else if (hasInviting && hasWelcoming) color = 'pale-yellow'
  else if (warmth > 30) color = 'cold-blue'

  return {
    warmth, color, hasHighWarmth, hasInviting, hasWelcoming,
    hasNoHostility, hasGentle, hasNoHarshness, hasApproachable,
    hasNoBarrier, hasComfortable, hasNoIntimidation, hostilityCount, barrierCount,
  }
}

// ─── measureAwakening ─────────────────────────────────────

/** @example measureAwakening(content) returns AwakeningMeasure */
export function measureAwakening(content: string): AwakeningMeasure {
  let score = 0

  const hasCleanInit = INTERFACE_RE.test(content) && TYPE_RE.test(content) && CLASS_RE.test(content)
  const hasProperSetup = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const crashCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoCrashOnWake = crashCount === 0
  const hasLazyInit = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoBlocking = !NESTED_TERNARY_RE.test(content)
  const hasProgressive = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoOverhead = (content.match(CONSOLE_RE) || []).length === 0
  const hasEfficient = (content.match(DOC_COMMENT_RE) || []).length > 0
  const timeoutCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoTimeout = timeoutCount === 0

  if (content.length > 0) score += 5
  if (hasCleanInit) score += 12
  if (hasProperSetup) score += 10
  if (hasNoCrashOnWake) score += 12
  if (hasLazyInit) score += 10
  if (hasNoBlocking) score += 10
  if (hasProgressive) score += 11
  if (hasNoOverhead) score += 10
  if (hasEfficient) score += 10
  if (hasNoTimeout) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let state: AwakeningMeasure['state'] = 'failed-boot'
  if (hasHighQuality && hasNoCrashOnWake && hasCleanInit && hasEfficient) state = 'graceful-awakening'
  else if (hasHighQuality && hasNoCrashOnWake) state = 'smooth-startup'
  else if (hasHighQuality) state = 'gradual-warmup'
  else if (hasCleanInit && hasProperSetup) state = 'jarring-alarm'
  else if (quality > 30) state = 'rough-start'

  return {
    quality, state, hasHighQuality, hasCleanInit, hasProperSetup,
    hasNoCrashOnWake, hasLazyInit, hasNoBlocking, hasProgressive,
    hasNoOverhead, hasEfficient, hasNoTimeout, crashCount, timeoutCount,
  }
}

// ─── measureGrowth ────────────────────────────────────────

/** @example measureGrowth(content) returns GrowthMeasure */
export function measureGrowth(content: string): GrowthMeasure {
  let score = 0

  const hasExtensible = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasProperAbstraction = CLASS_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const rigidityCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoRigidity = rigidityCount === 0
  const hasModular = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const couplingCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoCoupling = couplingCount === 0
  const hasPluginReady = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const hasNoHardcoding = !NESTED_TERNARY_RE.test(content)
  const hasOpenArchitecture = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoCeiling = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasExtensible) score += 12
  if (hasProperAbstraction) score += 10
  if (hasNoRigidity) score += 12
  if (hasModular) score += 10
  if (hasNoCoupling) score += 10
  if (hasPluginReady) score += 11
  if (hasNoHardcoding) score += 10
  if (hasOpenArchitecture) score += 10
  if (hasNoCeiling) score += 10

  const potential = Math.min(100, Math.max(0, score))
  const hasHighPotential = potential >= 70

  let trajectory: GrowthMeasure['trajectory'] = 'decline'
  if (hasHighPotential && hasNoRigidity && hasExtensible && hasNoCeiling) trajectory = 'exponential'
  else if (hasHighPotential && hasNoRigidity) trajectory = 'strong-growth'
  else if (hasHighPotential) trajectory = 'steady-climb'
  else if (hasExtensible && hasModular) trajectory = 'linear'
  else if (potential > 30) trajectory = 'plateau'

  return {
    potential, trajectory, hasHighPotential, hasExtensible, hasProperAbstraction,
    hasNoRigidity, hasModular, hasNoCoupling, hasPluginReady, hasNoHardcoding,
    hasOpenArchitecture, hasNoCeiling, rigidityCount, couplingCount,
  }
}

// ─── measureRadiant ───────────────────────────────────────

/** @example measureRadiant(content) returns RadiantMeasure */
export function measureRadiant(content: string): RadiantMeasure {
  let score = 0

  const hasTransparent = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoObfuscation = !NESTED_TERNARY_RE.test(content)
  const hasClearPurpose = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const ambiguityCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoAmbiguity = ambiguityCount === 0
  const hasIlluminated = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoDarkCorners = (content.match(CONSOLE_RE) || []).length === 0
  const hasProperExposure = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const hasVisible = TRY_RE.test(content) && CATCH_RE.test(content)
  const hiddenCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoHiddenLogic = hiddenCount === 0

  if (content.length > 0) score += 5
  if (hasTransparent) score += 10
  if (hasNoObfuscation) score += 10
  if (hasClearPurpose) score += 12
  if (hasNoAmbiguity) score += 12
  if (hasIlluminated) score += 10
  if (hasNoDarkCorners) score += 10
  if (hasProperExposure) score += 11
  if (hasVisible) score += 10
  if (hasNoHiddenLogic) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let quality: RadiantMeasure['quality'] = 'darkness'
  if (hasHighLevel && hasNoAmbiguity && hasTransparent && hasIlluminated) quality = 'blinding-brilliance'
  else if (hasHighLevel && hasNoAmbiguity) quality = 'clear-radiance'
  else if (hasHighLevel) quality = 'bright-light'
  else if (hasIlluminated && hasClearPurpose) quality = 'dim-glow'
  else if (level > 30) quality = 'shadow'

  return {
    level, quality, hasHighLevel, hasTransparent, hasNoObfuscation,
    hasClearPurpose, hasNoAmbiguity, hasIlluminated, hasNoDarkCorners,
    hasProperExposure, hasVisible, hasNoHiddenLogic, ambiguityCount, hiddenCount,
  }
}

// ─── measureTransformation ────────────────────────────────

/** @example measureTransformation(content) returns TransformationMeasure */
export function measureTransformation(content: string): TransformationMeasure {
  let score = 0

  const hasPolymorphic = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const hasProperPatterns = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const fragilityCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoFragility = fragilityCount === 0
  const hasAdaptive = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const breakageCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoBreakage = breakageCount === 0
  const hasResilient = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoBrittleness = !NESTED_TERNARY_RE.test(content)
  const hasVersionable = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoLockIn = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasPolymorphic) score += 12
  if (hasProperPatterns) score += 10
  if (hasNoFragility) score += 12
  if (hasAdaptive) score += 10
  if (hasNoBreakage) score += 10
  if (hasResilient) score += 11
  if (hasNoBrittleness) score += 10
  if (hasVersionable) score += 10
  if (hasNoLockIn) score += 10

  const power = Math.min(100, Math.max(0, score))
  const hasHighPower = power >= 70

  let capability: TransformationMeasure['capability'] = 'petrified'
  if (hasHighPower && hasNoFragility && hasPolymorphic && hasVersionable) capability = 'metamorphic'
  else if (hasHighPower && hasNoFragility) capability = 'highly-adaptive'
  else if (hasHighPower) capability = 'flexible'
  else if (hasPolymorphic && hasResilient) capability = 'moderate'
  else if (power > 30) capability = 'rigid'

  return {
    power, capability, hasHighPower, hasPolymorphic, hasProperPatterns,
    hasNoFragility, hasAdaptive, hasNoBreakage, hasResilient, hasNoBrittleness,
    hasVersionable, hasNoLockIn, fragilityCount, breakageCount,
  }
}

// ─── measureGolden ────────────────────────────────────────

/** @example measureGolden(content) returns GoldenMeasure */
export function measureGolden(content: string): GoldenMeasure {
  let score = 0

  const hasMasterful = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const flawCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoFlaws = flawCount === 0
  const hasElegant = (content.match(DOC_COMMENT_RE) || []).length > 0
  const wasteCount = (content.match(CONSOLE_RE) || []).length + (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoWaste = wasteCount === 0
  const hasPurposeful = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoRedundancy = !NESTED_TERNARY_RE.test(content)
  const hasComplete = RETURN_RE.test(content)
  const hasNoMissing = (content.match(TODO_RE) || []).length === 0 && (content.match(FIXME_RE) || []).length === 0
  const hasRefined = (content.match(HACK_RE) || []).length === 0 && (content.match(DEPRECATED_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasMasterful) score += 10
  if (hasNoFlaws) score += 12
  if (hasElegant) score += 10
  if (hasNoWaste) score += 12
  if (hasPurposeful) score += 10
  if (hasNoRedundancy) score += 10
  if (hasComplete) score += 11
  if (hasNoMissing) score += 10
  if (hasRefined) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let hour: GoldenMeasure['hour'] = 'night'
  if (hasHighQuality && hasNoFlaws && hasElegant && hasNoWaste) hour = 'golden-hour'
  else if (hasHighQuality && hasNoFlaws) hour = 'warm-light'
  else if (hasHighQuality) hour = 'clear-day'
  else if (hasMasterful && hasPurposeful) hour = 'overcast'
  else if (quality > 30) hour = 'gloomy'

  return {
    quality, hour, hasHighQuality, hasMasterful, hasNoFlaws,
    hasElegant, hasNoWaste, hasPurposeful, hasNoRedundancy,
    hasComplete, hasNoMissing, hasRefined, flawCount, wasteCount,
  }
}

// ─── classifyCondition ────────────────────────────────────

/** @example classifyCondition(beam) returns condition */
export function classifyCondition(beam: Sunbeam): Sunbeam['condition'] {
  const { qualityScore } = beam
  if (qualityScore >= 80) return 'golden-masterpiece'
  if (qualityScore >= 65) return 'sunlit-excellence'
  if (qualityScore >= 50) return 'warm-professional'
  if (qualityScore >= 35) return 'cloudy-adequate'
  if (qualityScore >= 20) return 'dim-struggling'
  return 'darkness'
}

// ─── analyzeSunbeam ───────────────────────────────────────

/** @example analyzeSunbeam(content, filePath) returns full beam */
export function analyzeSunbeam(content: string, filePath: string): Sunbeam {
  const dawn = measureDawn(content)
  const awakening = measureAwakening(content)
  const growth = measureGrowth(content)
  const radiant = measureRadiant(content)
  const transformation = measureTransformation(content)
  const golden = measureGolden(content)

  const dawnWarmth = dawn.warmth
  const awakeningQuality = awakening.quality
  const growthPotential = growth.potential
  const radiance = radiant.level
  const transformationPower = transformation.power
  const goldenHourQuality = golden.quality

  const qualityScore = Math.round(
    dawnWarmth * 0.15 +
    awakeningQuality * 0.15 +
    growthPotential * 0.15 +
    radiance * 0.2 +
    transformationPower * 0.15 +
    goldenHourQuality * 0.2,
  )

  const result: Sunbeam = {
    file: filePath,
    dawnWarmth, awakeningQuality, growthPotential,
    radiance, transformationPower, goldenHourQuality,
    dawn, awakening, growth, radiant, transformation, golden,
    qualityScore,
    condition: 'darkness',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── classifyHorizonType ──────────────────────────────────

/** @example classifyHorizonType(beams) returns horizon type */
export function classifyHorizonType(beams: Sunbeam[]): Horizon['horizonType'] {
  if (beams.length === 0) return 'void'
  const avgScore = beams.reduce((s, b) => s + b.qualityScore, 0) / beams.length
  const goldenCnt = beams.filter((b) => b.condition === 'golden-masterpiece').length
  if (avgScore >= 75 && goldenCnt >= Math.ceil(beams.length * 0.3)) return 'golden-horizon'
  if (avgScore >= 60) return 'sunlit-landscape'
  if (avgScore >= 45) return 'morning-meadow'
  if (avgScore >= 30) return 'foggy-valley'
  if (avgScore >= 15) return 'shadow-valley'
  return 'void'
}

// ─── analyzeHorizon ───────────────────────────────────────

/** @example analyzeHorizon(beams, dirPath) returns Horizon */
export function analyzeHorizon(beams: Sunbeam[], dirPath: string): Horizon {
  if (beams.length === 0) {
    return {
      directory: dirPath, beams: [], avgWarmth: 0, avgGrowth: 0,
      avgGolden: 0, goldenCount: 0, darkCount: 0, warmCount: 0,
      radiantCount: 0, horizonType: 'void', condition: 'midnight',
    }
  }

  const avgWarmth = Math.round(beams.reduce((s, b) => s + b.dawnWarmth, 0) / beams.length)
  const avgGrowth = Math.round(beams.reduce((s, b) => s + b.growthPotential, 0) / beams.length)
  const avgGolden = Math.round(beams.reduce((s, b) => s + b.goldenHourQuality, 0) / beams.length)
  const goldenCount = beams.filter((b) => b.condition === 'golden-masterpiece').length
  const darkCount = beams.filter((b) => b.condition === 'darkness').length
  const warmCount = beams.filter((b) => b.dawn.hasHighWarmth).length
  const radiantCount = beams.filter((b) => b.radiant.hasHighLevel).length

  const horizonType = classifyHorizonType(beams)
  const avgScore = beams.reduce((s, b) => s + b.qualityScore, 0) / beams.length
  let condition: Horizon['condition'] = 'midnight'
  if (avgScore >= 75) condition = 'dawn-of-excellence'
  else if (avgScore >= 60) condition = 'bright-morning'
  else if (avgScore >= 45) condition = 'warming-day'
  else if (avgScore >= 30) condition = 'overcast'
  else if (avgScore >= 15) condition = 'dusk'

  return {
    directory: dirPath, beams, avgWarmth, avgGrowth, avgGolden,
    goldenCount, darkCount, warmCount, radiantCount,
    horizonType, condition,
  }
}

// ─── classifyObserverGrade ────────────────────────────────

/** @example classifyObserverGrade(avgRadiance) returns grade */
export function classifyObserverGrade(avgRadiance: number): AmberSunriseResult['stats']['observerGrade'] {
  if (avgRadiance >= 80) return 'dawn-watcher'
  if (avgRadiance >= 65) return 'sunrise-photographer'
  if (avgRadiance >= 50) return 'light-seeker'
  if (avgRadiance >= 35) return 'observer'
  if (avgRadiance >= 20) return 'sleepyhead'
  return 'vampire'
}

// ─── generateRecommendations ──────────────────────────────

/** @example generateRecommendations(beams, horizons, sky, stats) returns string[] */
export function generateRecommendations(
  beams: Sunbeam[],
  horizons: Horizon[],
  sky: AmberSunriseResult['sky'],
  stats: AmberSunriseResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgDawnWarmth < 50) recs.push('Increase dawn warmth — add interfaces and types for inviting code')
  if (stats.avgAwakeningQuality < 50) recs.push('Improve awakening quality — organize imports/exports for clean startup')
  if (stats.avgGrowthPotential < 50) recs.push('Boost growth potential — add abstractions and reduce rigidity')
  if (stats.avgRadiance < 50) recs.push('Enhance radiance — add documentation and reduce ambiguity')
  if (stats.avgTransformationPower < 50) recs.push('Strengthen transformation power — add error handling for resilient code')
  if (stats.avgGoldenHourQuality < 50) recs.push('Improve golden hour quality — reduce flaws and waste for excellence')
  if (stats.darknessCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of beams are in darkness — consider major refactoring')
  if (stats.dimStrugglingCount > 0) recs.push('Warning: dim struggling beams detected — these files need illumination')
  if (sky.overallRadiance < 40) recs.push('Overall radiance is critically low — establish a sunrise recovery plan')
  if (horizons.length > 0 && horizons.every((h) => h.condition === 'midnight')) recs.push('All horizons are at midnight — your codebase needs fundamental dawn activation')

  if (beams.length > 0) {
    const highHostility = beams.filter((b) => b.dawn.hostilityCount > 2)
    if (highHostility.length > beams.length * 0.5) recs.push('Over 50% of beams have high hostility — reduce any/eval usage')
  }

  return recs
}

// ─── buildAmberSunriseResult ──────────────────────────────

/** @example buildAmberSunriseResult(files, contents) returns full result */
export function buildAmberSunriseResult(files: string[], contents: string[]): AmberSunriseResult {
  const beams = files.map((file, i) => analyzeSunbeam(contents[i] ?? '', file))

  const horizonMap = new Map<string, Sunbeam[]>()
  beams.forEach((beam) => {
    const parts = beam.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = horizonMap.get(dir)
    if (existing) existing.push(beam)
    else horizonMap.set(dir, [beam])
  })

  const horizons = Array.from(horizonMap.entries()).map(([dir, bs]) => analyzeHorizon(bs, dir))

  const avgDawnWarmth = beams.length > 0 ? Math.round(beams.reduce((s, b) => s + b.dawnWarmth, 0) / beams.length) : 0
  const avgAwakeningQuality = beams.length > 0 ? Math.round(beams.reduce((s, b) => s + b.awakeningQuality, 0) / beams.length) : 0
  const avgGrowthPotential = beams.length > 0 ? Math.round(beams.reduce((s, b) => s + b.growthPotential, 0) / beams.length) : 0
  const avgRadiance = beams.length > 0 ? Math.round(beams.reduce((s, b) => s + b.radiance, 0) / beams.length) : 0
  const avgTransformationPower = beams.length > 0 ? Math.round(beams.reduce((s, b) => s + b.transformationPower, 0) / beams.length) : 0
  const avgGoldenHourQuality = beams.length > 0 ? Math.round(beams.reduce((s, b) => s + b.goldenHourQuality, 0) / beams.length) : 0

  const overallRadiance = Math.round(
    avgDawnWarmth * 0.15 +
    avgAwakeningQuality * 0.15 +
    avgGrowthPotential * 0.15 +
    avgRadiance * 0.2 +
    avgTransformationPower * 0.15 +
    avgGoldenHourQuality * 0.2,
  )

  const sky = {
    avgWarmth: avgDawnWarmth,
    avgGrowth: avgGrowthPotential,
    avgGolden: avgGoldenHourQuality,
    isGolden: overallRadiance >= 60,
    overallRadiance,
  }

  const stats = {
    totalFiles: files.length,
    totalHorizons: horizons.length,
    avgDawnWarmth,
    avgAwakeningQuality,
    avgGrowthPotential,
    avgRadiance,
    avgTransformationPower,
    avgGoldenHourQuality,
    goldenMasterpieceCount: beams.filter((b) => b.condition === 'golden-masterpiece').length,
    sunlitExcellenceCount: beams.filter((b) => b.condition === 'sunlit-excellence').length,
    warmProfessionalCount: beams.filter((b) => b.condition === 'warm-professional').length,
    cloudyAdequateCount: beams.filter((b) => b.condition === 'cloudy-adequate').length,
    dimStrugglingCount: beams.filter((b) => b.condition === 'dim-struggling').length,
    darknessCount: beams.filter((b) => b.condition === 'darkness').length,
    hasHighWarmthCount: beams.filter((b) => b.dawn.hasHighWarmth).length,
    hasHighQualityCount: beams.filter((b) => b.awakening.hasHighQuality).length,
    hasHighPotentialCount: beams.filter((b) => b.growth.hasHighPotential).length,
    hasHighLevelCount: beams.filter((b) => b.radiant.hasHighLevel).length,
    hasHighPowerCount: beams.filter((b) => b.transformation.hasHighPower).length,
    hasHighGoldenCount: beams.filter((b) => b.golden.hasHighQuality).length,
    overallRadiance,
    observerGrade: classifyObserverGrade(overallRadiance),
    bestBeam: '',
    warmest: '',
    bestStartup: '',
    mostExtensible: '',
    clearest: '',
    mostAdaptive: '',
  }

  if (beams.length > 0) {
    stats.bestBeam = beams.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.warmest = beams.reduce((a, b) => a.dawnWarmth >= b.dawnWarmth ? a : b).file
    stats.bestStartup = beams.reduce((a, b) => a.awakeningQuality >= b.awakeningQuality ? a : b).file
    stats.mostExtensible = beams.reduce((a, b) => a.growthPotential >= b.growthPotential ? a : b).file
    stats.clearest = beams.reduce((a, b) => a.radiance >= b.radiance ? a : b).file
    stats.mostAdaptive = beams.reduce((a, b) => a.transformationPower >= b.transformationPower ? a : b).file
  }

  const recommendations = generateRecommendations(beams, horizons, sky, stats)

  return { beams, horizons, sky, stats, recommendations }
}
