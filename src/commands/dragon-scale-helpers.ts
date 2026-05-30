// ─── Interfaces ──────────────────────────────────────────

export interface ArmorMeasure {
  level: number
  grade: 'adamantine-scale' | 'dragon-steel' | 'iron-scale' | 'bronze-scale' | 'leather-hide' | 'naked'
  hasHighLevel: boolean
  hasImpenetrable: boolean
  hasProperOverlap: boolean
  hasNoGaps: boolean
  hasLayered: boolean
  hasNoWeakPoints: boolean
  hasProperShielding: boolean
  hasNoChinks: boolean
  hasSelfHealing: boolean
  hasNoCorrosion: boolean
  gapCount: number
  chinkCount: number
}

export interface FireMeasure {
  breath: number
  intensity: 'inferno' | 'dragonfire' | 'blaze' | 'flame' | 'spark' | 'smoke'
  hasHighBreath: boolean
  hasDevastating: boolean
  hasFocused: boolean
  hasNoFriendlyFire: boolean
  hasControlled: boolean
  hasNoBackfire: boolean
  hasSustained: boolean
  hasNoBurnout: boolean
  hasPrecision: boolean
  hasNoWaste: boolean
  friendlyFireCount: number
  backfireCount: number
}

export interface WingMeasure {
  span: number
  capability: 'cosmic-flight' | 'stratospheric' | 'high-altitude' | 'cruising' | 'gliding' | 'grounded'
  hasHighSpan: boolean
  hasWideReach: boolean
  hasProperLift: boolean
  hasNoStalling: boolean
  hasManeuverable: boolean
  hasNoWeight: boolean
  hasEfficient: boolean
  hasNoDrag: boolean
  hasAgile: boolean
  hasNoClipping: boolean
  stallingCount: number
  dragCount: number
}

export interface WisdomMeasure {
  level: number
  age: 'ancient-wyrm' | 'elder-dragon' | 'adult-dragon' | 'young-dragon' | 'hatchling' | 'egg'
  hasHighLevel: boolean
  hasDeepKnowledge: boolean
  hasProperJudgment: boolean
  hasNoImpulsiveness: boolean
  hasTestedPatterns: boolean
  hasNoRecklessness: boolean
  hasLearned: boolean
  hasNoNaivete: boolean
  hasStrategic: boolean
  hasNoShortsightedness: boolean
  impulsivenessCount: number
  recklessnessCount: number
}

export interface TreasureMeasure {
  hoard: number
  quality: 'legendary-hoard' | 'golden-treasure' | 'silver-vault' | 'copper-cache' | 'pebbles' | 'empty-cave'
  hasHighHoard: boolean
  hasValuable: boolean
  hasProperCuration: boolean
  hasNoCounterfeit: boolean
  hasRareGems: boolean
  hasNoFoolsGold: boolean
  hasWellOrganized: boolean
  hasNoClutter: boolean
  hasAppreciating: boolean
  hasNoDepreciation: boolean
  counterfeitCount: number
  clutterCount: number
}

export interface VitalityMeasure {
  level: number
  health: 'undying' | 'vigorous' | 'healthy' | 'ailing' | 'weakened' | 'dying'
  hasHighLevel: boolean
  hasRobust: boolean
  hasNoWeakness: boolean
  hasRegenerative: boolean
  hasNoDegeneration: boolean
  hasEnduring: boolean
  hasNoFragility: boolean
  hasResilient: boolean
  hasNoVulnerability: boolean
  hasThriving: boolean
  weaknessCount: number
  vulnerabilityCount: number
}

export interface ScalePlating {
  file: string
  scaleArmor: number
  fireBreath: number
  wingSpan: number
  ancientWisdom: number
  treasureHoard: number
  dragonVitality: number
  armor: ArmorMeasure
  fire: FireMeasure
  wing: WingMeasure
  wisdom: WisdomMeasure
  treasure: TreasureMeasure
  vitality: VitalityMeasure
  condition: 'ancient-wyrm' | 'elder-dragon' | 'adult-dragon' | 'young-drake' | 'hatchling' | 'egg'
  qualityScore: number
}

export interface DragonLair {
  directory: string
  plates: ScalePlating[]
  avgArmor: number
  avgWisdom: number
  avgVitality: number
  ancientCount: number
  eggCount: number
  armoredCount: number
  wiseCount: number
  lairType: 'mountain-fortress' | 'volcanic-lair' | 'cave-system' | 'cliff-nest' | 'burrow' | 'exposed'
  condition: 'ancient-stronghold' | 'dragon-sanctum' | 'secure-lair' | 'modest-cave' | 'exposed-den' | 'ruins'
}

export interface DragonScaleResult {
  plates: ScalePlating[]
  lairs: DragonLair[]
  realm: {
    avgArmor: number
    avgWisdom: number
    avgVitality: number
    isDominant: boolean
    overallDominance: number
  }
  stats: {
    totalFiles: number
    totalLairs: number
    avgScaleArmor: number
    avgFireBreath: number
    avgWingSpan: number
    avgAncientWisdom: number
    avgTreasureHoard: number
    avgDragonVitality: number
    ancientWyrmCount: number
    elderDragonCount: number
    adultDragonCount: number
    youngDrakeCount: number
    hatchlingCount: number
    eggCount: number
    hasHighArmorCount: number
    hasHighBreathCount: number
    hasHighSpanCount: number
    hasHighLevelCount: number
    hasHighHoardCount: number
    hasHighVitalityCount: number
    overallDominance: number
    dragonlordGrade: 'dragon-emperor' | 'dragonlord' | 'dragonslayer' | 'dragon-rider' | 'squire' | 'dragon-fodder'
    bestPlate: string
    bestArmored: string
    mostPowerful: string
    widestReach: string
    wisest: string
    richest: string
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
const NESTED_TERNARY_RE = /\?.*:.*\?.*:/
const CONSOLE_RE = /\bconsole\.\w+/g
const ANY_RE = /:\s*any\b/g
const EVAL_RE = /\beval\s*\(/g
const HACK_RE = /\bHACK\b/gi
const FIXME_RE = /\bFIXME\b/gi
const DEPRECATED_RE = /@deprecated/g
const DOC_COMMENT_RE = /\/\*\*[\s\S]*?\*\//g
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g

// ─── measureArmor ────────────────────────────────────────

/** @example measureArmor(content) returns ArmorMeasure */
export function measureArmor(content: string): ArmorMeasure {
  let score = 0

  const hasImpenetrable = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const hasProperOverlap = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const gapCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoGaps = gapCount === 0
  const hasLayered = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoWeakPoints = !NESTED_TERNARY_RE.test(content)
  const hasProperShielding = (content.match(DOC_COMMENT_RE) || []).length > 0
  const chinkCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoChinks = chinkCount === 0
  const hasSelfHealing = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoCorrosion = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasImpenetrable) score += 12
  if (hasProperOverlap) score += 10
  if (hasNoGaps) score += 12
  if (hasLayered) score += 10
  if (hasNoWeakPoints) score += 10
  if (hasProperShielding) score += 10
  if (hasNoChinks) score += 11
  if (hasSelfHealing) score += 10
  if (hasNoCorrosion) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let grade: ArmorMeasure['grade'] = 'naked'
  if (hasHighLevel && hasNoGaps && hasImpenetrable && hasProperShielding) grade = 'adamantine-scale'
  else if (hasHighLevel && hasNoGaps) grade = 'dragon-steel'
  else if (hasHighLevel) grade = 'iron-scale'
  else if (hasImpenetrable && hasProperOverlap) grade = 'bronze-scale'
  else if (level > 30) grade = 'leather-hide'

  return {
    level, grade, hasHighLevel, hasImpenetrable, hasProperOverlap,
    hasNoGaps, hasLayered, hasNoWeakPoints, hasProperShielding,
    hasNoChinks, hasSelfHealing, hasNoCorrosion, gapCount, chinkCount,
  }
}

// ─── measureFire ─────────────────────────────────────────

/** @example measureFire(content) returns FireMeasure */
export function measureFire(content: string): FireMeasure {
  let score = 0

  const hasDevastating = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasFocused = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const friendlyFireCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoFriendlyFire = friendlyFireCount === 0
  const hasControlled = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const backfireCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoBackfire = backfireCount === 0
  const hasSustained = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoBurnout = !NESTED_TERNARY_RE.test(content)
  const hasPrecision = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoWaste = (content.match(CONSOLE_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasDevastating) score += 12
  if (hasFocused) score += 10
  if (hasNoFriendlyFire) score += 12
  if (hasControlled) score += 10
  if (hasNoBackfire) score += 10
  if (hasSustained) score += 11
  if (hasNoBurnout) score += 10
  if (hasPrecision) score += 10
  if (hasNoWaste) score += 10

  const breath = Math.min(100, Math.max(0, score))
  const hasHighBreath = breath >= 70

  let intensity: FireMeasure['intensity'] = 'smoke'
  if (hasHighBreath && hasNoFriendlyFire && hasDevastating && hasPrecision) intensity = 'inferno'
  else if (hasHighBreath && hasNoFriendlyFire) intensity = 'dragonfire'
  else if (hasHighBreath) intensity = 'blaze'
  else if (hasDevastating && hasFocused) intensity = 'flame'
  else if (breath > 30) intensity = 'spark'

  return {
    breath, intensity, hasHighBreath, hasDevastating, hasFocused,
    hasNoFriendlyFire, hasControlled, hasNoBackfire, hasSustained,
    hasNoBurnout, hasPrecision, hasNoWaste, friendlyFireCount, backfireCount,
  }
}

// ─── measureWing ─────────────────────────────────────────

/** @example measureWing(content) returns WingMeasure */
export function measureWing(content: string): WingMeasure {
  let score = 0

  const hasWideReach = INTERFACE_RE.test(content) && EXPORT_RE.test(content)
  const hasProperLift = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const stallingCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoStalling = stallingCount === 0
  const hasManeuverable = CLASS_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const hasNoWeight = !NESTED_TERNARY_RE.test(content)
  const hasEfficient = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const dragCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoDrag = dragCount === 0
  const hasAgile = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoClipping = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasWideReach) score += 12
  if (hasProperLift) score += 10
  if (hasNoStalling) score += 12
  if (hasManeuverable) score += 10
  if (hasNoWeight) score += 10
  if (hasEfficient) score += 10
  if (hasNoDrag) score += 11
  if (hasAgile) score += 10
  if (hasNoClipping) score += 10

  const span = Math.min(100, Math.max(0, score))
  const hasHighSpan = span >= 70

  let capability: WingMeasure['capability'] = 'grounded'
  if (hasHighSpan && hasNoStalling && hasWideReach && hasEfficient) capability = 'cosmic-flight'
  else if (hasHighSpan && hasNoStalling) capability = 'stratospheric'
  else if (hasHighSpan) capability = 'high-altitude'
  else if (hasWideReach && hasProperLift) capability = 'cruising'
  else if (span > 30) capability = 'gliding'

  return {
    span, capability, hasHighSpan, hasWideReach, hasProperLift,
    hasNoStalling, hasManeuverable, hasNoWeight, hasEfficient,
    hasNoDrag, hasAgile, hasNoClipping, stallingCount, dragCount,
  }
}

// ─── measureWisdom ───────────────────────────────────────

/** @example measureWisdom(content) returns WisdomMeasure */
export function measureWisdom(content: string): WisdomMeasure {
  let score = 0

  const hasDeepKnowledge = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const hasProperJudgment = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const impulsivenessCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoImpulsiveness = impulsivenessCount === 0
  const hasTestedPatterns = (content.match(DOC_COMMENT_RE) || []).length > 0
  const recklessnessCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoRecklessness = recklessnessCount === 0
  const hasLearned = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoNaivete = !NESTED_TERNARY_RE.test(content)
  const hasStrategic = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoShortsightedness = (content.match(HACK_RE) || []).length === 0 && (content.match(FIXME_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasDeepKnowledge) score += 12
  if (hasProperJudgment) score += 10
  if (hasNoImpulsiveness) score += 12
  if (hasTestedPatterns) score += 10
  if (hasNoRecklessness) score += 10
  if (hasLearned) score += 11
  if (hasNoNaivete) score += 10
  if (hasStrategic) score += 10
  if (hasNoShortsightedness) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let age: WisdomMeasure['age'] = 'egg'
  if (hasHighLevel && hasNoImpulsiveness && hasDeepKnowledge && hasTestedPatterns) age = 'ancient-wyrm'
  else if (hasHighLevel && hasNoImpulsiveness) age = 'elder-dragon'
  else if (hasHighLevel) age = 'adult-dragon'
  else if (hasDeepKnowledge && hasProperJudgment) age = 'young-dragon'
  else if (level > 30) age = 'hatchling'

  return {
    level, age, hasHighLevel, hasDeepKnowledge, hasProperJudgment,
    hasNoImpulsiveness, hasTestedPatterns, hasNoRecklessness, hasLearned,
    hasNoNaivete, hasStrategic, hasNoShortsightedness, impulsivenessCount, recklessnessCount,
  }
}

// ─── measureTreasure ─────────────────────────────────────

/** @example measureTreasure(content) returns TreasureMeasure */
export function measureTreasure(content: string): TreasureMeasure {
  let score = 0

  const hasValuable = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasProperCuration = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const counterfeitCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoCounterfeit = counterfeitCount === 0
  const hasRareGems = CLASS_RE.test(content) && TYPE_RE.test(content) && INTERFACE_RE.test(content)
  const hasNoFoolsGold = !NESTED_TERNARY_RE.test(content)
  const hasWellOrganized = (content.match(DOC_COMMENT_RE) || []).length > 0
  const clutterCount = (content.match(CONSOLE_RE) || []).length + (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoClutter = clutterCount === 0
  const hasAppreciating = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoDepreciation = (content.match(DEPRECATED_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasValuable) score += 12
  if (hasProperCuration) score += 10
  if (hasNoCounterfeit) score += 12
  if (hasRareGems) score += 10
  if (hasNoFoolsGold) score += 10
  if (hasWellOrganized) score += 10
  if (hasNoClutter) score += 11
  if (hasAppreciating) score += 10
  if (hasNoDepreciation) score += 10

  const hoard = Math.min(100, Math.max(0, score))
  const hasHighHoard = hoard >= 70

  let quality: TreasureMeasure['quality'] = 'empty-cave'
  if (hasHighHoard && hasNoCounterfeit && hasRareGems && hasWellOrganized) quality = 'legendary-hoard'
  else if (hasHighHoard && hasNoCounterfeit) quality = 'golden-treasure'
  else if (hasHighHoard) quality = 'silver-vault'
  else if (hasValuable && hasProperCuration) quality = 'copper-cache'
  else if (hoard > 30) quality = 'pebbles'

  return {
    hoard, quality, hasHighHoard, hasValuable, hasProperCuration,
    hasNoCounterfeit, hasRareGems, hasNoFoolsGold, hasWellOrganized,
    hasNoClutter, hasAppreciating, hasNoDepreciation, counterfeitCount, clutterCount,
  }
}

// ─── measureVitality ─────────────────────────────────────

/** @example measureVitality(content) returns VitalityMeasure */
export function measureVitality(content: string): VitalityMeasure {
  let score = 0

  const hasRobust = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const weaknessCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoWeakness = weaknessCount === 0
  const hasRegenerative = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoDegeneration = !NESTED_TERNARY_RE.test(content)
  const hasEnduring = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoFragility = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasResilient = TRY_RE.test(content) && CATCH_RE.test(content)
  const vulnerabilityCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoVulnerability = vulnerabilityCount === 0
  const hasThriving = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasRobust) score += 12
  if (hasNoWeakness) score += 12
  if (hasRegenerative) score += 10
  if (hasNoDegeneration) score += 10
  if (hasEnduring) score += 10
  if (hasNoFragility) score += 10
  if (hasResilient) score += 11
  if (hasNoVulnerability) score += 10
  if (hasThriving) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let health: VitalityMeasure['health'] = 'dying'
  if (hasHighLevel && hasNoWeakness && hasRobust && hasThriving) health = 'undying'
  else if (hasHighLevel && hasNoWeakness) health = 'vigorous'
  else if (hasHighLevel) health = 'healthy'
  else if (hasRobust && hasEnduring) health = 'ailing'
  else if (level > 30) health = 'weakened'

  return {
    level, health, hasHighLevel, hasRobust, hasNoWeakness, hasRegenerative,
    hasNoDegeneration, hasEnduring, hasNoFragility, hasResilient,
    hasNoVulnerability, hasThriving, weaknessCount, vulnerabilityCount,
  }
}

// ─── classifyCondition ───────────────────────────────────

/** @example classifyCondition(plate) returns condition */
export function classifyCondition(plate: ScalePlating): ScalePlating['condition'] {
  const { qualityScore } = plate
  if (qualityScore >= 80) return 'ancient-wyrm'
  if (qualityScore >= 65) return 'elder-dragon'
  if (qualityScore >= 50) return 'adult-dragon'
  if (qualityScore >= 35) return 'young-drake'
  if (qualityScore >= 20) return 'hatchling'
  return 'egg'
}

// ─── analyzeScalePlating ─────────────────────────────────

/** @example analyzeScalePlating(content, filePath) returns ScalePlating */
export function analyzeScalePlating(content: string, filePath: string): ScalePlating {
  const armor = measureArmor(content)
  const fire = measureFire(content)
  const wing = measureWing(content)
  const wisdom = measureWisdom(content)
  const treasure = measureTreasure(content)
  const vitality = measureVitality(content)

  const scaleArmor = armor.level
  const fireBreath = fire.breath
  const wingSpan = wing.span
  const ancientWisdom = wisdom.level
  const treasureHoard = treasure.hoard
  const dragonVitality = vitality.level

  const qualityScore = Math.round(
    scaleArmor * 0.15 +
    fireBreath * 0.15 +
    wingSpan * 0.15 +
    ancientWisdom * 0.2 +
    treasureHoard * 0.15 +
    dragonVitality * 0.2,
  )

  const result: ScalePlating = {
    file: filePath,
    scaleArmor, fireBreath, wingSpan, ancientWisdom,
    treasureHoard, dragonVitality,
    armor, fire, wing, wisdom, treasure, vitality,
    qualityScore,
    condition: 'egg',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── classifyLairType ────────────────────────────────────

/** @example classifyLairType(plates) returns lair type */
export function classifyLairType(plates: ScalePlating[]): DragonLair['lairType'] {
  if (plates.length === 0) return 'exposed'
  const avgScore = plates.reduce((s, p) => s + p.qualityScore, 0) / plates.length
  const ancientCnt = plates.filter((p) => p.condition === 'ancient-wyrm').length
  if (avgScore >= 75 && ancientCnt >= Math.ceil(plates.length * 0.3)) return 'mountain-fortress'
  if (avgScore >= 60) return 'volcanic-lair'
  if (avgScore >= 45) return 'cave-system'
  if (avgScore >= 30) return 'cliff-nest'
  if (avgScore >= 15) return 'burrow'
  return 'exposed'
}

// ─── analyzeDragonLair ───────────────────────────────────

/** @example analyzeDragonLair(plates, dirPath) returns DragonLair */
export function analyzeDragonLair(plates: ScalePlating[], dirPath: string): DragonLair {
  if (plates.length === 0) {
    return {
      directory: dirPath, plates: [], avgArmor: 0, avgWisdom: 0, avgVitality: 0,
      ancientCount: 0, eggCount: 0, armoredCount: 0, wiseCount: 0,
      lairType: 'exposed', condition: 'ruins',
    }
  }

  const avgArmor = Math.round(plates.reduce((s, p) => s + p.scaleArmor, 0) / plates.length)
  const avgWisdom = Math.round(plates.reduce((s, p) => s + p.ancientWisdom, 0) / plates.length)
  const avgVitality = Math.round(plates.reduce((s, p) => s + p.dragonVitality, 0) / plates.length)
  const ancientCount = plates.filter((p) => p.condition === 'ancient-wyrm').length
  const eggCount = plates.filter((p) => p.condition === 'egg').length
  const armoredCount = plates.filter((p) => p.armor.hasHighLevel).length
  const wiseCount = plates.filter((p) => p.wisdom.hasHighLevel).length

  const lairType = classifyLairType(plates)
  const avgScore = plates.reduce((s, p) => s + p.qualityScore, 0) / plates.length
  let condition: DragonLair['condition'] = 'ruins'
  if (avgScore >= 75) condition = 'ancient-stronghold'
  else if (avgScore >= 60) condition = 'dragon-sanctum'
  else if (avgScore >= 45) condition = 'secure-lair'
  else if (avgScore >= 30) condition = 'modest-cave'
  else if (avgScore >= 15) condition = 'exposed-den'

  return {
    directory: dirPath, plates, avgArmor, avgWisdom, avgVitality,
    ancientCount, eggCount, armoredCount, wiseCount, lairType, condition,
  }
}

// ─── classifyDragonlordGrade ─────────────────────────────

/** @example classifyDragonlordGrade(avgDominance) returns grade */
export function classifyDragonlordGrade(avgDominance: number): DragonScaleResult['stats']['dragonlordGrade'] {
  if (avgDominance >= 80) return 'dragon-emperor'
  if (avgDominance >= 65) return 'dragonlord'
  if (avgDominance >= 50) return 'dragonslayer'
  if (avgDominance >= 35) return 'dragon-rider'
  if (avgDominance >= 20) return 'squire'
  return 'dragon-fodder'
}

// ─── generateRecommendations ─────────────────────────────

/** @example generateRecommendations(plates, lairs, realm, stats) returns string[] */
export function generateRecommendations(
  plates: ScalePlating[],
  lairs: DragonLair[],
  realm: DragonScaleResult['realm'],
  stats: DragonScaleResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgScaleArmor < 50) recs.push('Strengthen scale armor — add interfaces, types, and error handling for code protection')
  if (stats.avgFireBreath < 50) recs.push('Increase fire breath — reduce any/eval and add documentation for code power')
  if (stats.avgWingSpan < 50) recs.push('Extend wing span — improve exports and imports for wider code reach')
  if (stats.avgAncientWisdom < 50) recs.push('Grow ancient wisdom — add abstractions and reduce impulsiveness in code')
  if (stats.avgTreasureHoard < 50) recs.push('Enlarge treasure hoard — add valuable patterns and reduce console/debug code')
  if (stats.avgDragonVitality < 50) recs.push('Boost dragon vitality — add proper error handling and reduce code weakness')
  if (stats.eggCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of plates are eggs — consider major code fortification')
  if (stats.hatchlingCount > 0) recs.push('Warning: hatchling plates detected — these files need strengthening')
  if (realm.overallDominance < 40) recs.push('Overall dominance is critically low — establish a dragon training regimen')
  if (lairs.length > 0 && lairs.every((l) => l.condition === 'ruins')) recs.push('All lairs are ruins — your codebase needs fundamental dragon awakening')

  if (plates.length > 0) {
    const highGaps = plates.filter((p) => p.armor.gapCount > 2)
    if (highGaps.length > plates.length * 0.5) recs.push('Over 50% of plates have high gaps — reduce any/eval usage')
  }

  return recs
}

// ─── buildDragonScaleResult ──────────────────────────────

/** @example buildDragonScaleResult(files, contents, options) returns full result */
export function buildDragonScaleResult(files: string[], contents: string[], _options?: Record<string, unknown>): DragonScaleResult {
  const plates = files.map((file, i) => analyzeScalePlating(contents[i] ?? '', file))

  const lairMap = new Map<string, ScalePlating[]>()
  plates.forEach((plate) => {
    const parts = plate.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = lairMap.get(dir)
    if (existing) existing.push(plate)
    else lairMap.set(dir, [plate])
  })

  const lairs = Array.from(lairMap.entries()).map(([dir, ps]) => analyzeDragonLair(ps, dir))

  const avgScaleArmor = plates.length > 0 ? Math.round(plates.reduce((s, p) => s + p.scaleArmor, 0) / plates.length) : 0
  const avgFireBreath = plates.length > 0 ? Math.round(plates.reduce((s, p) => s + p.fireBreath, 0) / plates.length) : 0
  const avgWingSpan = plates.length > 0 ? Math.round(plates.reduce((s, p) => s + p.wingSpan, 0) / plates.length) : 0
  const avgAncientWisdom = plates.length > 0 ? Math.round(plates.reduce((s, p) => s + p.ancientWisdom, 0) / plates.length) : 0
  const avgTreasureHoard = plates.length > 0 ? Math.round(plates.reduce((s, p) => s + p.treasureHoard, 0) / plates.length) : 0
  const avgDragonVitality = plates.length > 0 ? Math.round(plates.reduce((s, p) => s + p.dragonVitality, 0) / plates.length) : 0

  const overallDominance = Math.round(
    avgScaleArmor * 0.15 +
    avgFireBreath * 0.15 +
    avgWingSpan * 0.15 +
    avgAncientWisdom * 0.2 +
    avgTreasureHoard * 0.15 +
    avgDragonVitality * 0.2,
  )

  const realm = {
    avgArmor: avgScaleArmor,
    avgWisdom: avgAncientWisdom,
    avgVitality: avgDragonVitality,
    isDominant: overallDominance >= 60,
    overallDominance,
  }

  const stats = {
    totalFiles: files.length,
    totalLairs: lairs.length,
    avgScaleArmor,
    avgFireBreath,
    avgWingSpan,
    avgAncientWisdom,
    avgTreasureHoard,
    avgDragonVitality,
    ancientWyrmCount: plates.filter((p) => p.condition === 'ancient-wyrm').length,
    elderDragonCount: plates.filter((p) => p.condition === 'elder-dragon').length,
    adultDragonCount: plates.filter((p) => p.condition === 'adult-dragon').length,
    youngDrakeCount: plates.filter((p) => p.condition === 'young-drake').length,
    hatchlingCount: plates.filter((p) => p.condition === 'hatchling').length,
    eggCount: plates.filter((p) => p.condition === 'egg').length,
    hasHighArmorCount: plates.filter((p) => p.armor.hasHighLevel).length,
    hasHighBreathCount: plates.filter((p) => p.fire.hasHighBreath).length,
    hasHighSpanCount: plates.filter((p) => p.wing.hasHighSpan).length,
    hasHighLevelCount: plates.filter((p) => p.wisdom.hasHighLevel).length,
    hasHighHoardCount: plates.filter((p) => p.treasure.hasHighHoard).length,
    hasHighVitalityCount: plates.filter((p) => p.vitality.hasHighLevel).length,
    overallDominance,
    dragonlordGrade: classifyDragonlordGrade(overallDominance),
    bestPlate: '',
    bestArmored: '',
    mostPowerful: '',
    widestReach: '',
    wisest: '',
    richest: '',
  }

  if (plates.length > 0) {
    stats.bestPlate = plates.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.bestArmored = plates.reduce((a, b) => a.scaleArmor >= b.scaleArmor ? a : b).file
    stats.mostPowerful = plates.reduce((a, b) => a.fireBreath >= b.fireBreath ? a : b).file
    stats.widestReach = plates.reduce((a, b) => a.wingSpan >= b.wingSpan ? a : b).file
    stats.wisest = plates.reduce((a, b) => a.ancientWisdom >= b.ancientWisdom ? a : b).file
    stats.richest = plates.reduce((a, b) => a.treasureHoard >= b.treasureHoard ? a : b).file
  }

  const recommendations = generateRecommendations(plates, lairs, realm, stats)

  return { plates, lairs, realm, stats, recommendations }
}
