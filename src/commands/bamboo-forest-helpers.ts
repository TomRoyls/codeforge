// ─── Interfaces ──────────────────────────────────────────────

export interface CulmMeasure {
  strength: number
  grade: 'iron-bamboo' | 'moso' | 'golden' | 'green' | 'tender' | 'wilted'
  hasHighStrength: boolean
  hasProperWall: boolean
  hasNoCracks: boolean
  hasFiberStrength: boolean
  hasNoSplitting: boolean
  hasDense: boolean
  hasNoRot: boolean
  hasProperNodes: boolean
  hasLignin: boolean
  hasNoInfestation: boolean
  crackCount: number
  rotCount: number
}

export interface JointMeasure {
  quality: number
  seal: 'perfect-seal' | 'tight' | 'snug' | 'loose' | 'gaping' | 'broken'
  hasHighQuality: boolean
  hasCleanConnection: boolean
  hasProperMembrane: boolean
  hasNoLeakage: boolean
  hasStrongBond: boolean
  hasNoWeakPoint: boolean
  hasFlexible: boolean
  hasNoRigidity: boolean
  hasProperAlignment: boolean
  hasNoMisalignment: boolean
  leakageCount: number
  weakPointCount: number
}

export interface GrowthMeasure {
  rate: number
  speed: 'explosive' | 'rapid' | 'steady' | 'slow' | 'dormant' | 'dying'
  hasHighRate: boolean
  hasNewShoots: boolean
  hasProperSpacing: boolean
  hasNoStunting: boolean
  hasRhizome: boolean
  hasNoCongestion: boolean
  hasSeasonalGrowth: boolean
  hasNoPremature: boolean
  hasBranching: boolean
  hasNoOvergrowth: boolean
  stuntingCount: number
  congestionCount: number
}

export interface RootMeasure {
  depth: number
  system: 'deep-taproot' | 'extensive' | 'moderate' | 'shallow' | 'surface' | 'floating'
  hasHighDepth: boolean
  hasStrongAnchor: boolean
  hasProperSpread: boolean
  hasNoRootRot: boolean
  hasMycorrhiza: boolean
  hasNoCompetition: boolean
  hasWaterAccess: boolean
  hasNoGirdling: boolean
  hasNutrientCycling: boolean
  hasNoDepletion: boolean
  rootRotCount: number
  girdlingCount: number
}

export interface HollowMeasure {
  efficiency: number
  design: 'optimal' | 'efficient' | 'balanced' | 'wasteful' | 'bloated' | 'solid-waste'
  hasHighEfficiency: boolean
  hasProperDiameter: boolean
  hasNoExcess: boolean
  hasLightweight: boolean
  hasNoOverfill: boolean
  hasStructural: boolean
  hasNoRedundancy: boolean
  hasAirFlow: boolean
  hasNoBlockage: boolean
  hasDiaphragm: boolean
  excessCount: number
  redundancyCount: number
}

export interface WindMeasure {
  resistance: number
  flex: 'hurricane-proof' | 'storm-resistant' | 'flexible' | 'stiff' | 'brittle' | 'snapping'
  hasHighResistance: boolean
  hasElasticity: boolean
  hasProperSway: boolean
  hasNoRigidity: boolean
  hasRecovery: boolean
  hasNoSnapping: boolean
  hasDamping: boolean
  hasNoResonance: boolean
  hasAdaptive: boolean
  hasNoFatigue: boolean
  snappingCount: number
  fatigueCount: number
}

export interface BambooCulm {
  file: string
  culmStrength: number
  jointQuality: number
  growthRate: number
  rootDepth: number
  hollowEfficiency: number
  windResistance: number
  culm: CulmMeasure
  joint: JointMeasure
  growth: GrowthMeasure
  root: RootMeasure
  hollow: HollowMeasure
  wind: WindMeasure
  condition: 'ancient-giant' | 'mature-culm' | 'growing-shoot' | 'tender-sprout' | 'damaged' | 'dead-cane'
  qualityScore: number
}

export interface ForestGrove {
  directory: string
  culms: BambooCulm[]
  avgStrength: number
  avgGrowth: number
  avgWind: number
  ancientCount: number
  deadCount: number
  strongCount: number
  efficientCount: number
  groveType: 'ancient-forest' | 'mature-grove' | 'growing-stand' | 'plantation' | 'clearing' | 'barren'
  condition: 'sacred-grove' | 'thriving-forest' | 'healthy-stand' | 'struggling' | 'withered' | 'desolate'
}

export interface BambooForestResult {
  culms: BambooCulm[]
  groves: ForestGrove[]
  forest: {
    avgStrength: number
    avgGrowth: number
    avgWind: number
    isResilient: boolean
    overallResilience: number
  }
  stats: {
    totalFiles: number
    totalGroves: number
    avgCulmStrength: number
    avgJointQuality: number
    avgGrowthRate: number
    avgRootDepth: number
    avgHollowEfficiency: number
    avgWindResistance: number
    ancientGiantCount: number
    matureCulmCount: number
    growingShootCount: number
    tenderSproutCount: number
    damagedCount: number
    deadCaneCount: number
    hasHighStrengthCount: number
    hasHighQualityCount: number
    hasHighRateCount: number
    hasHighDepthCount: number
    hasHighEfficiencyCount: number
    hasHighResistanceCount: number
    overallResilience: number
    gardenerGrade: 'master-gardener' | 'forester' | 'gardener' | 'tender' | 'observer' | 'lumberjack'
    bestCulm: string
    strongest: string
    bestJoints: string
    fastestGrowing: string
    deepestRoots: string
    mostEfficient: string
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
const RETURN_TYPE_RE = /\)\s*:\s*[A-Z]\w*/
const ENUM_RE = /\benum\b/
const OPTIONAL_RE = /\?\s*:/
const DEFAULT_RE = /\bdefault\b/
const DESCRIBE_RE = /\bdescribe\s*\(/
const TEST_RE = /\b(it|test)\s*\(/
const CONSOLE_RE = /\bconsole\.\w+/g
const ANY_RE = /:\s*any\b/g
const EVAL_RE = /\beval\s*\(/g
const TODO_RE = /\bTODO\b/gi
const HACK_RE = /\bHACK\b/gi
const FIXME_RE = /\bFIXME\b/gi
const DEPRECATED_RE = /@deprecated/g
const NESTED_TERNARY_RE = /\?.*:.*\?.*:/
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g
const EXCESSIVE_COMMENT_RE = /\/\*[\s\S]*?\*\//g

// ─── measureCulm ────────────────────────────────────────────

/** @example measureCulm(content) returns CulmMeasure */
export function measureCulm(content: string): CulmMeasure {
  let score = 0

  const hasProperWall = INTERFACE_RE.test(content) || CLASS_RE.test(content) || TYPE_RE.test(content)
  const crackCount = (content.match(TODO_RE) || []).length + (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoCracks = crackCount === 0
  const hasFiberStrength = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const emptyCatchCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoSplitting = emptyCatchCount === 0
  const hasDense = FUNCTION_RE.test(content) && (CLASS_RE.test(content) || INTERFACE_RE.test(content))
  const rotCount = (content.match(EVAL_RE) || []).length + (content.match(ANY_RE) || []).length
  const hasNoRot = rotCount === 0
  const hasProperNodes = FUNCTION_RE.test(content) || CLASS_RE.test(content)
  const hasLignin = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoInfestation = (content.match(CONSOLE_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperWall) score += 12
  if (hasNoCracks) score += 10
  if (hasFiberStrength) score += 12
  if (hasNoSplitting) score += 10
  if (hasDense) score += 10
  if (hasNoRot) score += 10
  if (hasProperNodes) score += 10
  if (hasLignin) score += 11
  if (hasNoInfestation) score += 10

  const strength = Math.min(100, Math.max(0, score))
  const hasHighStrength = strength >= 70

  let grade: CulmMeasure['grade'] = 'wilted'
  if (hasHighStrength && hasNoCracks && hasNoRot && hasLignin) grade = 'iron-bamboo'
  else if (hasHighStrength && hasNoCracks) grade = 'moso'
  else if (hasHighStrength) grade = 'golden'
  else if (hasProperWall && hasProperNodes) grade = 'green'
  else if (strength > 30) grade = 'tender'

  return {
    strength, grade, hasHighStrength, hasProperWall, hasNoCracks,
    hasFiberStrength, hasNoSplitting, hasDense, hasNoRot,
    hasProperNodes, hasLignin, hasNoInfestation, crackCount, rotCount,
  }
}

// ─── measureJoint ───────────────────────────────────────────

/** @example measureJoint(content) returns JointMeasure */
export function measureJoint(content: string): JointMeasure {
  let score = 0

  const importCount = (content.match(/\bimport\b/g) || []).length
  const hasCleanConnection = importCount > 0 && importCount <= 15
  const hasProperMembrane = TYPE_RE.test(content) || INTERFACE_RE.test(content)
  const leakageCount = (content.match(ANY_RE) || []).length
  const hasNoLeakage = leakageCount === 0
  const hasStrongBond = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const weakPointCount = (content.match(DEPRECATED_RE) || []).length
  const hasNoWeakPoint = weakPointCount === 0
  const hasFlexible = OPTIONAL_RE.test(content)
  const hasNoRigidity = !NESTED_TERNARY_RE.test(content)
  const hasProperAlignment = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const hasNoMisalignment = !EVAL_RE.test(content)

  if (content.length > 0) score += 5
  if (hasCleanConnection) score += 12
  if (hasProperMembrane) score += 12
  if (hasNoLeakage) score += 10
  if (hasStrongBond) score += 10
  if (hasNoWeakPoint) score += 10
  if (hasFlexible) score += 10
  if (hasNoRigidity) score += 10
  if (hasProperAlignment) score += 11
  if (hasNoMisalignment) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let seal: JointMeasure['seal'] = 'broken'
  if (hasHighQuality && hasNoLeakage && hasNoWeakPoint && hasStrongBond) seal = 'perfect-seal'
  else if (hasHighQuality && hasNoLeakage) seal = 'tight'
  else if (hasHighQuality) seal = 'snug'
  else if (hasProperMembrane && hasNoMisalignment) seal = 'loose'
  else if (quality > 30) seal = 'gaping'

  return {
    quality, seal, hasHighQuality, hasCleanConnection, hasProperMembrane,
    hasNoLeakage, hasStrongBond, hasNoWeakPoint, hasFlexible,
    hasNoRigidity, hasProperAlignment, hasNoMisalignment,
    leakageCount, weakPointCount,
  }
}

// ─── measureGrowth ──────────────────────────────────────────

/** @example measureGrowth(content) returns GrowthMeasure */
export function measureGrowth(content: string): GrowthMeasure {
  let score = 0

  const hasNewShoots = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const lines = content.split('\n')
  const hasProperSpacing = lines.every((l) => l.length < 300)
  const stuntingCount = lines.filter((l) => l.length > 200).length
  const hasNoStunting = stuntingCount === 0
  const hasRhizome = INTERFACE_RE.test(content) || TYPE_RE.test(content)
  const congestionCount = lines.filter((l) => l.length > 150).length
  const hasNoCongestion = congestionCount === 0
  const hasSeasonalGrowth = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoPremature = !EMPTY_CATCH_RE.test(content)
  const hasBranching = TRY_RE.test(content) || content.includes('if ') || content.includes('switch')
  const hasNoOvergrowth = lines.filter((l) => l.length > 250).length <= 3

  if (content.length > 0) score += 5
  if (hasNewShoots) score += 12
  if (hasProperSpacing) score += 10
  if (hasNoStunting) score += 10
  if (hasRhizome) score += 12
  if (hasNoCongestion) score += 10
  if (hasSeasonalGrowth) score += 10
  if (hasNoPremature) score += 10
  if (hasBranching) score += 11
  if (hasNoOvergrowth) score += 10

  const rate = Math.min(100, Math.max(0, score))
  const hasHighRate = rate >= 70

  let speed: GrowthMeasure['speed'] = 'dying'
  if (hasHighRate && hasNewShoots && hasSeasonalGrowth && hasRhizome) speed = 'explosive'
  else if (hasHighRate && hasNewShoots) speed = 'rapid'
  else if (hasHighRate) speed = 'steady'
  else if (hasNewShoots && hasBranching) speed = 'slow'
  else if (rate > 30) speed = 'dormant'

  return {
    rate, speed, hasHighRate, hasNewShoots, hasProperSpacing,
    hasNoStunting, hasRhizome, hasNoCongestion, hasSeasonalGrowth,
    hasNoPremature, hasBranching, hasNoOvergrowth,
    stuntingCount, congestionCount,
  }
}

// ─── measureRoot ────────────────────────────────────────────

/** @example measureRoot(content) returns RootMeasure */
export function measureRoot(content: string): RootMeasure {
  let score = 0

  const hasStrongAnchor = TYPE_RE.test(content) || INTERFACE_RE.test(content) || CLASS_RE.test(content)
  const importCount = (content.match(/\bimport\b/g) || []).length
  const hasProperSpread = importCount > 0 && importCount <= 15
  const rootRotCount = (content.match(ANY_RE) || []).length
  const hasNoRootRot = rootRotCount === 0
  const hasMycorrhiza = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const hasNoCompetition = importCount <= 20
  const hasWaterAccess = TRY_RE.test(content) && CATCH_RE.test(content)
  const girdlingCount = (content.match(EVAL_RE) || []).length
  const hasNoGirdling = girdlingCount === 0
  const hasNutrientCycling = EXPORT_RE.test(content)
  const hasNoDepletion = (content.match(ANY_RE) || []).length <= 3

  if (content.length > 0) score += 5
  if (hasStrongAnchor) score += 12
  if (hasProperSpread) score += 12
  if (hasNoRootRot) score += 10
  if (hasMycorrhiza) score += 10
  if (hasNoCompetition) score += 10
  if (hasWaterAccess) score += 10
  if (hasNoGirdling) score += 10
  if (hasNutrientCycling) score += 11
  if (hasNoDepletion) score += 10

  const depth = Math.min(100, Math.max(0, score))
  const hasHighDepth = depth >= 70

  let system: RootMeasure['system'] = 'floating'
  if (hasHighDepth && hasNoRootRot && hasNoGirdling && hasMycorrhiza) system = 'deep-taproot'
  else if (hasHighDepth && hasNoRootRot) system = 'extensive'
  else if (hasHighDepth) system = 'moderate'
  else if (hasStrongAnchor && hasProperSpread) system = 'shallow'
  else if (depth > 30) system = 'surface'

  return {
    depth, system, hasHighDepth, hasStrongAnchor, hasProperSpread,
    hasNoRootRot, hasMycorrhiza, hasNoCompetition, hasWaterAccess,
    hasNoGirdling, hasNutrientCycling, hasNoDepletion,
    rootRotCount, girdlingCount,
  }
}

// ─── measureHollow ──────────────────────────────────────────

/** @example measureHollow(content) returns HollowMeasure */
export function measureHollow(content: string): HollowMeasure {
  let score = 0

  const lines = content.split('\n')
  const avgLineLen = lines.length > 0 ? lines.reduce((s, l) => s + l.length, 0) / lines.length : 0
  const hasProperDiameter = avgLineLen < 80
  const excessCount = lines.filter((l) => l.length > 120).length
  const hasNoExcess = excessCount === 0
  const commentBlockCount = (content.match(EXCESSIVE_COMMENT_RE) || []).length
  const hasLightweight = commentBlockCount <= 3
  const hasNoOverfill = lines.filter((l) => l.length > 150).length <= 2
  const hasStructural = INTERFACE_RE.test(content) || CLASS_RE.test(content) || TYPE_RE.test(content)
  const redundancyCount = lines.filter((l) => l.trim().length > 0 && l.trim() === l.trim()).length > lines.length * 0.8 ? 1 : 0
  const hasNoRedundancy = redundancyCount === 0
  const hasAirFlow = content.includes('\n\n') || content.length === 0
  const hasNoBlockage = !NESTED_TERNARY_RE.test(content)
  const hasDiaphragm = EXPORT_RE.test(content)

  if (content.length > 0) score += 5
  if (hasProperDiameter) score += 12
  if (hasNoExcess) score += 12
  if (hasLightweight) score += 10
  if (hasNoOverfill) score += 10
  if (hasStructural) score += 10
  if (hasNoRedundancy) score += 10
  if (hasAirFlow) score += 11
  if (hasNoBlockage) score += 10
  if (hasDiaphragm) score += 10

  const efficiency = Math.min(100, Math.max(0, score))
  const hasHighEfficiency = efficiency >= 70

  let design: HollowMeasure['design'] = 'solid-waste'
  if (hasHighEfficiency && hasNoExcess && hasNoRedundancy && hasLightweight) design = 'optimal'
  else if (hasHighEfficiency && hasNoExcess) design = 'efficient'
  else if (hasHighEfficiency) design = 'balanced'
  else if (hasProperDiameter && hasStructural) design = 'wasteful'
  else if (efficiency > 30) design = 'bloated'

  return {
    efficiency, design, hasHighEfficiency, hasProperDiameter,
    hasNoExcess, hasLightweight, hasNoOverfill, hasStructural,
    hasNoRedundancy, hasAirFlow, hasNoBlockage, hasDiaphragm,
    excessCount, redundancyCount,
  }
}

// ─── measureWind ────────────────────────────────────────────

/** @example measureWind(content) returns WindMeasure */
export function measureWind(content: string): WindMeasure {
  let score = 0

  const hasElasticity = OPTIONAL_RE.test(content)
  const hasProperSway = ASYNC_RE.test(content)
  const hasNoRigidity = !NESTED_TERNARY_RE.test(content)
  const hasRecovery = TRY_RE.test(content) && CATCH_RE.test(content)
  const snappingCount = (content.match(/\?.*:.*\?.*:/g) || []).length
  const hasNoSnapping = snappingCount === 0
  const hasDamping = TYPE_RE.test(content) || INTERFACE_RE.test(content)
  const hasNoResonance = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasAdaptive = GENERIC_RE.test(content)
  const fatigueCount = content.split('\n').filter((l) => l.length > 200).length
  const hasNoFatigue = fatigueCount === 0

  if (content.length > 0) score += 5
  if (hasElasticity) score += 12
  if (hasProperSway) score += 10
  if (hasNoRigidity) score += 10
  if (hasRecovery) score += 12
  if (hasNoSnapping) score += 10
  if (hasDamping) score += 10
  if (hasNoResonance) score += 10
  if (hasAdaptive) score += 11
  if (hasNoFatigue) score += 10

  const resistance = Math.min(100, Math.max(0, score))
  const hasHighResistance = resistance >= 70

  let flex: WindMeasure['flex'] = 'snapping'
  if (hasHighResistance && hasRecovery && hasElasticity && hasAdaptive) flex = 'hurricane-proof'
  else if (hasHighResistance && hasRecovery) flex = 'storm-resistant'
  else if (hasHighResistance) flex = 'flexible'
  else if (hasDamping && hasRecovery) flex = 'stiff'
  else if (resistance > 30) flex = 'brittle'

  return {
    resistance, flex, hasHighResistance, hasElasticity, hasProperSway,
    hasNoRigidity, hasRecovery, hasNoSnapping, hasDamping,
    hasNoResonance, hasAdaptive, hasNoFatigue,
    snappingCount, fatigueCount,
  }
}

// ─── classifyCondition ──────────────────────────────────────

/** @example classifyCondition(culm) returns condition */
export function classifyCondition(culm: BambooCulm): BambooCulm['condition'] {
  const { qualityScore } = culm
  if (qualityScore >= 80) return 'ancient-giant'
  if (qualityScore >= 65) return 'mature-culm'
  if (qualityScore >= 50) return 'growing-shoot'
  if (qualityScore >= 35) return 'tender-sprout'
  if (qualityScore >= 20) return 'damaged'
  return 'dead-cane'
}

// ─── Culm Analysis ──────────────────────────────────────────

/** @example analyzeBambooCulm(content, filePath) returns full culm */
export function analyzeBambooCulm(content: string, filePath: string): BambooCulm {
  const culm = measureCulm(content)
  const joint = measureJoint(content)
  const growth = measureGrowth(content)
  const root = measureRoot(content)
  const hollow = measureHollow(content)
  const wind = measureWind(content)

  const culmStrength = culm.strength
  const jointQuality = joint.quality
  const growthRate = growth.rate
  const rootDepth = root.depth
  const hollowEfficiency = hollow.efficiency
  const windResistance = wind.resistance

  const qualityScore = Math.round(
    culmStrength * 0.15 +
    jointQuality * 0.15 +
    growthRate * 0.15 +
    rootDepth * 0.2 +
    hollowEfficiency * 0.15 +
    windResistance * 0.2,
  )

  const result: BambooCulm = {
    file: filePath,
    culmStrength, jointQuality, growthRate, rootDepth,
    hollowEfficiency, windResistance,
    culm, joint, growth, root, hollow, wind,
    qualityScore,
    condition: 'dead-cane',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── Grove Analysis ─────────────────────────────────────────

/** @example analyzeForestGrove(culms, dirPath) returns ForestGrove */
export function analyzeForestGrove(culms: BambooCulm[], dirPath: string): ForestGrove {
  if (culms.length === 0) {
    return {
      directory: dirPath, culms: [], avgStrength: 0, avgGrowth: 0,
      avgWind: 0, ancientCount: 0, deadCount: 0, strongCount: 0,
      efficientCount: 0, groveType: 'barren', condition: 'desolate',
    }
  }

  const avgStrength = Math.round(culms.reduce((s, c) => s + c.culmStrength, 0) / culms.length)
  const avgGrowth = Math.round(culms.reduce((s, c) => s + c.growthRate, 0) / culms.length)
  const avgWind = Math.round(culms.reduce((s, c) => s + c.windResistance, 0) / culms.length)
  const ancientCount = culms.filter((c) => c.condition === 'ancient-giant').length
  const deadCount = culms.filter((c) => c.condition === 'dead-cane').length
  const strongCount = culms.filter((c) => c.culm.hasHighStrength).length
  const efficientCount = culms.filter((c) => c.hollow.hasHighEfficiency).length

  const groveType = classifyGroveType(culms)
  const avgScore = culms.reduce((s, c) => s + c.qualityScore, 0) / culms.length
  const condition = classifyGroveCondition(avgScore)

  return {
    directory: dirPath, culms, avgStrength, avgGrowth, avgWind,
    ancientCount, deadCount, strongCount, efficientCount,
    groveType, condition,
  }
}

// ─── Grove Classification ───────────────────────────────────

/** @example classifyGroveType(culms) returns grove type */
export function classifyGroveType(culms: BambooCulm[]): ForestGrove['groveType'] {
  if (culms.length === 0) return 'barren'
  const avgScore = culms.reduce((s, c) => s + c.qualityScore, 0) / culms.length
  const ancientCnt = culms.filter((c) => c.condition === 'ancient-giant').length
  if (avgScore >= 75 && ancientCnt >= Math.ceil(culms.length * 0.3)) return 'ancient-forest'
  if (avgScore >= 60) return 'mature-grove'
  if (avgScore >= 45) return 'growing-stand'
  if (avgScore >= 30) return 'plantation'
  if (avgScore >= 15) return 'clearing'
  return 'barren'
}

/** @example classifyGroveCondition(avgScore) returns condition */
export function classifyGroveCondition(avgScore: number): ForestGrove['condition'] {
  if (avgScore >= 80) return 'sacred-grove'
  if (avgScore >= 65) return 'thriving-forest'
  if (avgScore >= 50) return 'healthy-stand'
  if (avgScore >= 35) return 'struggling'
  if (avgScore >= 20) return 'withered'
  return 'desolate'
}

/** @example classifyGardenerGrade(avgResilience) returns grade */
export function classifyGardenerGrade(avgResilience: number): BambooForestResult['stats']['gardenerGrade'] {
  if (avgResilience >= 80) return 'master-gardener'
  if (avgResilience >= 65) return 'forester'
  if (avgResilience >= 50) return 'gardener'
  if (avgResilience >= 35) return 'tender'
  if (avgResilience >= 20) return 'observer'
  return 'lumberjack'
}

// ─── Recommendations ────────────────────────────────────────

/** @example generateRecommendations(culms, groves, forest, stats) returns string[] */
export function generateRecommendations(
  culms: BambooCulm[],
  groves: ForestGrove[],
  forest: BambooForestResult['forest'],
  stats: BambooForestResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgCulmStrength < 50) recs.push('Strengthen culms — add type definitions and interfaces for structural walls')
  if (stats.avgJointQuality < 50) recs.push('Improve joints — use proper TypeScript types instead of any')
  if (stats.avgGrowthRate < 50) recs.push('Boost growth — add exports, async patterns, and branching logic')
  if (stats.avgRootDepth < 50) recs.push('Deepen roots — balance imports/exports and add error handling')
  if (stats.avgHollowEfficiency < 50) recs.push('Optimize hollow design — reduce long lines and remove redundant code')
  if (stats.avgWindResistance < 50) recs.push('Improve wind resistance — add optional parameters and generics')
  if (stats.deadCaneCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of culms are dead — consider major refactoring')
  if (stats.damagedCount > 0) recs.push('Warning: damaged culms detected — these files need immediate attention')
  if (forest.overallResilience < 40) recs.push('Overall forest resilience is critical — establish a management plan')
  if (groves.length > 0 && groves.every((g) => g.condition === 'desolate')) recs.push('All groves are desolate — your codebase needs nurturing')

  if (culms.length > 0) {
    const weakCulms = culms.filter((c) => c.culm.crackCount > 2)
    if (weakCulms.length > culms.length * 0.5) recs.push('Over 50% of culms have cracks — reduce TODOs and FIXMEs')
  }

  return recs
}

// ─── Build Result ───────────────────────────────────────────

/** @example buildBambooForestResult(files, contents) returns full result */
export function buildBambooForestResult(files: string[], contents: string[]): BambooForestResult {
  const culms = files.map((file, i) => analyzeBambooCulm(contents[i] ?? '', file))

  const groveMap = new Map<string, BambooCulm[]>()
  culms.forEach((culm) => {
    const parts = culm.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = groveMap.get(dir)
    if (existing) existing.push(culm)
    else groveMap.set(dir, [culm])
  })

  const groves = Array.from(groveMap.entries()).map(([dir, cs]) => analyzeForestGrove(cs, dir))

  const avgCulmStrength = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.culmStrength, 0) / culms.length) : 0
  const avgJointQuality = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.jointQuality, 0) / culms.length) : 0
  const avgGrowthRate = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.growthRate, 0) / culms.length) : 0
  const avgRootDepth = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.rootDepth, 0) / culms.length) : 0
  const avgHollowEfficiency = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.hollowEfficiency, 0) / culms.length) : 0
  const avgWindResistance = culms.length > 0 ? Math.round(culms.reduce((s, c) => s + c.windResistance, 0) / culms.length) : 0

  const overallResilience = Math.round(
    avgCulmStrength * 0.15 +
    avgJointQuality * 0.15 +
    avgGrowthRate * 0.15 +
    avgRootDepth * 0.2 +
    avgHollowEfficiency * 0.15 +
    avgWindResistance * 0.2,
  )

  const forest = {
    avgStrength: avgCulmStrength,
    avgGrowth: avgGrowthRate,
    avgWind: avgWindResistance,
    isResilient: overallResilience >= 60,
    overallResilience,
  }

  const stats = {
    totalFiles: files.length,
    totalGroves: groves.length,
    avgCulmStrength,
    avgJointQuality,
    avgGrowthRate,
    avgRootDepth,
    avgHollowEfficiency,
    avgWindResistance,
    ancientGiantCount: culms.filter((c) => c.condition === 'ancient-giant').length,
    matureCulmCount: culms.filter((c) => c.condition === 'mature-culm').length,
    growingShootCount: culms.filter((c) => c.condition === 'growing-shoot').length,
    tenderSproutCount: culms.filter((c) => c.condition === 'tender-sprout').length,
    damagedCount: culms.filter((c) => c.condition === 'damaged').length,
    deadCaneCount: culms.filter((c) => c.condition === 'dead-cane').length,
    hasHighStrengthCount: culms.filter((c) => c.culm.hasHighStrength).length,
    hasHighQualityCount: culms.filter((c) => c.joint.hasHighQuality).length,
    hasHighRateCount: culms.filter((c) => c.growth.hasHighRate).length,
    hasHighDepthCount: culms.filter((c) => c.root.hasHighDepth).length,
    hasHighEfficiencyCount: culms.filter((c) => c.hollow.hasHighEfficiency).length,
    hasHighResistanceCount: culms.filter((c) => c.wind.hasHighResistance).length,
    overallResilience,
    gardenerGrade: classifyGardenerGrade(overallResilience),
    bestCulm: '',
    strongest: '',
    bestJoints: '',
    fastestGrowing: '',
    deepestRoots: '',
    mostEfficient: '',
  }

  if (culms.length > 0) {
    stats.bestCulm = culms.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.strongest = culms.reduce((a, b) => a.culmStrength >= b.culmStrength ? a : b).file
    stats.bestJoints = culms.reduce((a, b) => a.jointQuality >= b.jointQuality ? a : b).file
    stats.fastestGrowing = culms.reduce((a, b) => a.growthRate >= b.growthRate ? a : b).file
    stats.deepestRoots = culms.reduce((a, b) => a.rootDepth >= b.rootDepth ? a : b).file
    stats.mostEfficient = culms.reduce((a, b) => a.hollowEfficiency >= b.hollowEfficiency ? a : b).file
  }

  const recommendations = generateRecommendations(culms, groves, forest, stats)

  return { culms, groves, forest, stats, recommendations }
}
