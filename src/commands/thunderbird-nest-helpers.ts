// ─── Interfaces ──────────────────────────────────────────────

export interface StormMeasure {
  power: number
  intensity: 'category-5' | 'major-storm' | 'thunderstorm' | 'squall' | 'breeze' | 'calm'
  hasHighPower: boolean
  hasElectricCharge: boolean
  hasProperDischarge: boolean
  hasNoOverload: boolean
  hasVoltage: boolean
  hasNoBrownout: boolean
  hasProperGrounding: boolean
  hasNoSurge: boolean
  hasSustained: boolean
  hasNoOutage: boolean
  overloadCount: number
  surgeCount: number
}

export interface LightningMeasure {
  speed: number
  velocity: 'lightning-bolt' | 'rapid-flash' | 'quick-strike' | 'rolling-thunder' | 'distant-rumble' | 'no-flash'
  hasHighSpeed: boolean
  hasInstantStrike: boolean
  hasProperArc: boolean
  hasNoResistance: boolean
  hasEfficient: boolean
  hasNoBottleneck: boolean
  hasCleanPath: boolean
  hasNoDelay: boolean
  hasOptimal: boolean
  hasNoWaste: boolean
  resistanceCount: number
  bottleneckCount: number
}

export interface ThunderMeasure {
  impact: number
  volume: 'deafening' | 'loud' | 'moderate' | 'distant' | 'whisper' | 'silent'
  hasHighImpact: boolean
  hasReverberation: boolean
  hasWideReach: boolean
  hasNoDistortion: boolean
  hasEcho: boolean
  hasNoNoise: boolean
  hasProperProjection: boolean
  hasNoInterference: boolean
  hasResonance: boolean
  hasNoMuffling: boolean
  distortionCount: number
  interferenceCount: number
}

export interface SacredMeasure {
  protection: number
  ward: 'impervious' | 'strong-ward' | 'protected' | 'light-shield' | 'vulnerable' | 'exposed'
  hasHighProtection: boolean
  hasSpiritShield: boolean
  hasProperWard: boolean
  hasNoCurse: boolean
  hasBlessing: boolean
  hasNoHex: boolean
  hasTotemGuard: boolean
  hasNoVulnerability: boolean
  hasRitualPurity: boolean
  hasNoDefilement: boolean
  curseCount: number
  hexCount: number
}

export interface NestMeasure {
  construction: number
  quality: 'eagle-nest' | 'well-woven' | 'sturdy' | 'basic' | 'flimsy' | 'scattered'
  hasHighConstruction: boolean
  hasSolidFoundation: boolean
  hasProperWeaving: boolean
  hasNoLooseThreads: boolean
  hasReinforced: boolean
  hasNoGaps: boolean
  hasProperInsulation: boolean
  hasNoWeakPoints: boolean
  hasSpacious: boolean
  hasNoCrowding: boolean
  looseThreadCount: number
  weakPointCount: number
}

export interface MythicalMeasure {
  quality: number
  rank: 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common' | 'mundane'
  hasHighQuality: boolean
  hasTranscendent: boolean
  hasNoWeakness: boolean
  hasDivine: boolean
  hasNoCorruption: boolean
  hasEternal: boolean
  hasNoDegradation: boolean
  hasCosmic: boolean
  hasNoMediocrity: boolean
  hasSupreme: boolean
  weaknessCount: number
  degradationCount: number
}

export interface ThunderFeather {
  file: string
  stormPower: number
  lightningSpeed: number
  thunderImpact: number
  sacredProtection: number
  nestConstruction: number
  mythicalQuality: number
  storm: StormMeasure
  lightning: LightningMeasure
  thunder: ThunderMeasure
  sacred: SacredMeasure
  nest: NestMeasure
  mythical: MythicalMeasure
  condition: 'mythical-artifact' | 'sacred-relic' | 'powerful-totem' | 'mundane-object' | 'broken-shard' | 'dust'
  qualityScore: number
}

export interface AerieLevel {
  directory: string
  feathers: ThunderFeather[]
  avgPower: number
  avgSpeed: number
  avgMythical: number
  legendaryCount: number
  dustCount: number
  powerfulCount: number
  fastCount: number
  levelType: 'mythical-aerie' | 'storm-perch' | 'mountain-nest' | 'tree-branch' | 'ground-level' | 'underground'
  condition: 'divine-sanctuary' | 'storm-fortress' | 'mountain-retreat' | 'shelter' | 'exposed' | 'ruined'
}

export interface ThunderbirdNestResult {
  feathers: ThunderFeather[]
  levels: AerieLevel[]
  sky: {
    avgPower: number
    avgSpeed: number
    avgMythical: number
    isMythical: boolean
    overallPower: number
  }
  stats: {
    totalFiles: number
    totalLevels: number
    avgStormPower: number
    avgLightningSpeed: number
    avgThunderImpact: number
    avgSacredProtection: number
    avgNestConstruction: number
    avgMythicalQuality: number
    mythicalArtifactCount: number
    sacredRelicCount: number
    powerfulTotemCount: number
    mundaneObjectCount: number
    brokenShardCount: number
    dustCount: number
    hasHighPowerCount: number
    hasHighSpeedCount: number
    hasHighImpactCount: number
    hasHighProtectionCount: number
    hasHighConstructionCount: number
    hasHighQualityCount: number
    overallPower: number
    shamanGrade: 'mythical-shaman' | 'storm-caller' | 'sky-watcher' | 'apprentice' | 'novice' | 'grounded'
    bestFeather: string
    mostPowerful: string
    fastest: string
    mostImpactful: string
    mostProtected: string
    bestArchitected: string
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

// ─── measureStorm ────────────────────────────────────────────

/** @example measureStorm(content) returns StormMeasure */
export function measureStorm(content: string): StormMeasure {
  let score = 0

  const hasElectricCharge = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hasProperDischarge = RETURN_RE.test(content)
  const overloadCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoOverload = overloadCount === 0
  const hasVoltage = INTERFACE_RE.test(content) || TYPE_RE.test(content) || CLASS_RE.test(content)
  const hasNoBrownout = (content.match(DEPRECATED_RE) || []).length === 0
  const hasProperGrounding = TRY_RE.test(content) && CATCH_RE.test(content)
  const surgeCount = (content.match(CONSOLE_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoSurge = surgeCount === 0
  const hasSustained = content.length > 0 && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const hasNoOutage = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasElectricCharge) score += 12
  if (hasProperDischarge) score += 10
  if (hasNoOverload) score += 12
  if (hasVoltage) score += 10
  if (hasNoBrownout) score += 10
  if (hasProperGrounding) score += 10
  if (hasNoSurge) score += 10
  if (hasSustained) score += 11
  if (hasNoOutage) score += 10

  const power = Math.min(100, Math.max(0, score))
  const hasHighPower = power >= 70

  let intensity: StormMeasure['intensity'] = 'calm'
  if (hasHighPower && hasNoOverload && hasNoSurge && hasVoltage) intensity = 'category-5'
  else if (hasHighPower && hasNoOverload) intensity = 'major-storm'
  else if (hasHighPower) intensity = 'thunderstorm'
  else if (hasVoltage && hasProperGrounding) intensity = 'squall'
  else if (power > 30) intensity = 'breeze'

  return {
    power, intensity, hasHighPower, hasElectricCharge, hasProperDischarge,
    hasNoOverload, hasVoltage, hasNoBrownout, hasProperGrounding,
    hasNoSurge, hasSustained, hasNoOutage, overloadCount, surgeCount,
  }
}

// ─── measureLightning ────────────────────────────────────────

/** @example measureLightning(content) returns LightningMeasure */
export function measureLightning(content: string): LightningMeasure {
  let score = 0

  const hasInstantStrike = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasProperArc = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const resistanceCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoResistance = resistanceCount === 0
  const hasEfficient = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const bottleneckCount = linesOverThreshold(content, 3)
  const hasNoBottleneck = bottleneckCount === 0
  const hasCleanPath = linesOverThreshold(content, 5) <= 1
  const hasNoDelay = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasOptimal = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const hasNoWaste = (content.match(CONSOLE_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasInstantStrike) score += 12
  if (hasProperArc) score += 10
  if (hasNoResistance) score += 12
  if (hasEfficient) score += 10
  if (hasNoBottleneck) score += 10
  if (hasCleanPath) score += 10
  if (hasNoDelay) score += 10
  if (hasOptimal) score += 11
  if (hasNoWaste) score += 10

  const speed = Math.min(100, Math.max(0, score))
  const hasHighSpeed = speed >= 70

  let velocity: LightningMeasure['velocity'] = 'no-flash'
  if (hasHighSpeed && hasNoResistance && hasNoBottleneck && hasInstantStrike) velocity = 'lightning-bolt'
  else if (hasHighSpeed && hasNoResistance) velocity = 'rapid-flash'
  else if (hasHighSpeed) velocity = 'quick-strike'
  else if (hasProperArc && hasEfficient) velocity = 'rolling-thunder'
  else if (speed > 30) velocity = 'distant-rumble'

  return {
    speed, velocity, hasHighSpeed, hasInstantStrike, hasProperArc,
    hasNoResistance, hasEfficient, hasNoBottleneck, hasCleanPath,
    hasNoDelay, hasOptimal, hasNoWaste, resistanceCount, bottleneckCount,
  }
}

// ─── measureThunder ──────────────────────────────────────────

/** @example measureThunder(content) returns ThunderMeasure */
export function measureThunder(content: string): ThunderMeasure {
  let score = 0

  const hasReverberation = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasWideReach = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const distortionCount = (content.match(NESTED_TERNARY_RE) || []).length
  const hasNoDistortion = distortionCount === 0
  const hasEcho = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hasNoNoise = (content.match(CONSOLE_RE) || []).length === 0
  const hasProperProjection = TRY_RE.test(content) && CATCH_RE.test(content)
  const interferenceCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoInterference = interferenceCount === 0
  const hasResonance = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoMuffling = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasReverberation) score += 12
  if (hasWideReach) score += 10
  if (hasNoDistortion) score += 10
  if (hasEcho) score += 12
  if (hasNoNoise) score += 10
  if (hasProperProjection) score += 10
  if (hasNoInterference) score += 10
  if (hasResonance) score += 11
  if (hasNoMuffling) score += 10

  const impact = Math.min(100, Math.max(0, score))
  const hasHighImpact = impact >= 70

  let volume: ThunderMeasure['volume'] = 'silent'
  if (hasHighImpact && hasNoDistortion && hasNoInterference && hasWideReach) volume = 'deafening'
  else if (hasHighImpact && hasNoDistortion) volume = 'loud'
  else if (hasHighImpact) volume = 'moderate'
  else if (hasReverberation && hasEcho) volume = 'distant'
  else if (impact > 30) volume = 'whisper'

  return {
    impact, volume, hasHighImpact, hasReverberation, hasWideReach,
    hasNoDistortion, hasEcho, hasNoNoise, hasProperProjection,
    hasNoInterference, hasResonance, hasNoMuffling, distortionCount, interferenceCount,
  }
}

// ─── measureSacred ───────────────────────────────────────────

/** @example measureSacred(content) returns SacredMeasure */
export function measureSacred(content: string): SacredMeasure {
  let score = 0

  const hasSpiritShield = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasProperWard = THROW_RE.test(content) || (TRY_RE.test(content) && CATCH_RE.test(content))
  const curseCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoCurse = curseCount === 0
  const hasBlessing = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hexCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoHex = hexCount === 0
  const hasTotemGuard = OPTIONAL_RE.test(content) || GENERIC_RE.test(content)
  const hasNoVulnerability = (content.match(DEPRECATED_RE) || []).length === 0
  const hasRitualPurity = (content.match(TODO_RE) || []).length === 0 && (content.match(FIXME_RE) || []).length === 0
  const hasNoDefilement = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasSpiritShield) score += 12
  if (hasProperWard) score += 10
  if (hasNoCurse) score += 12
  if (hasBlessing) score += 10
  if (hasNoHex) score += 10
  if (hasTotemGuard) score += 10
  if (hasNoVulnerability) score += 10
  if (hasRitualPurity) score += 11
  if (hasNoDefilement) score += 10

  const protection = Math.min(100, Math.max(0, score))
  const hasHighProtection = protection >= 70

  let ward: SacredMeasure['ward'] = 'exposed'
  if (hasHighProtection && hasNoCurse && hasNoHex && hasSpiritShield) ward = 'impervious'
  else if (hasHighProtection && hasNoCurse) ward = 'strong-ward'
  else if (hasHighProtection) ward = 'protected'
  else if (hasSpiritShield && hasBlessing) ward = 'light-shield'
  else if (protection > 30) ward = 'vulnerable'

  return {
    protection, ward, hasHighProtection, hasSpiritShield, hasProperWard,
    hasNoCurse, hasBlessing, hasNoHex, hasTotemGuard, hasNoVulnerability,
    hasRitualPurity, hasNoDefilement, curseCount, hexCount,
  }
}

// ─── measureNest ─────────────────────────────────────────────

/** @example measureNest(content) returns NestMeasure */
export function measureNest(content: string): NestMeasure {
  let score = 0

  const hasSolidFoundation = INTERFACE_RE.test(content) || TYPE_RE.test(content) || CLASS_RE.test(content)
  const hasProperWeaving = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const looseThreadCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoLooseThreads = looseThreadCount === 0
  const hasReinforced = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoGaps = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasProperInsulation = (content.match(DOC_COMMENT_RE) || []).length > 0
  const weakPointCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoWeakPoints = weakPointCount === 0
  const lineCount = content.split('\n').length
  const hasSpacious = lineCount < 500
  const hasNoCrowding = lineCount > 0 && lineCount < 300

  if (content.length > 0) score += 5
  if (hasSolidFoundation) score += 12
  if (hasProperWeaving) score += 12
  if (hasNoLooseThreads) score += 10
  if (hasReinforced) score += 10
  if (hasNoGaps) score += 10
  if (hasProperInsulation) score += 10
  if (hasNoWeakPoints) score += 10
  if (hasSpacious) score += 11
  if (hasNoCrowding) score += 10

  const construction = Math.min(100, Math.max(0, score))
  const hasHighConstruction = construction >= 70

  let quality: NestMeasure['quality'] = 'scattered'
  if (hasHighConstruction && hasNoLooseThreads && hasNoWeakPoints && hasSolidFoundation) quality = 'eagle-nest'
  else if (hasHighConstruction && hasNoLooseThreads) quality = 'well-woven'
  else if (hasHighConstruction) quality = 'sturdy'
  else if (hasSolidFoundation && hasProperWeaving) quality = 'basic'
  else if (construction > 30) quality = 'flimsy'

  return {
    construction, quality, hasHighConstruction, hasSolidFoundation, hasProperWeaving,
    hasNoLooseThreads, hasReinforced, hasNoGaps, hasProperInsulation,
    hasNoWeakPoints, hasSpacious, hasNoCrowding, looseThreadCount, weakPointCount,
  }
}

// ─── measureMythical ─────────────────────────────────────────

/** @example measureMythical(content) returns MythicalMeasure */
export function measureMythical(content: string): MythicalMeasure {
  let score = 0

  const hasTranscendent = INTERFACE_RE.test(content) && TYPE_RE.test(content) && CLASS_RE.test(content)
  const weaknessCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoWeakness = weaknessCount === 0
  const hasDivine = ASYNC_RE.test(content) && AWAIT_RE.test(content) && TRY_RE.test(content)
  const hasNoCorruption = (content.match(DEPRECATED_RE) || []).length === 0
  const hasEternal = EXPORT_RE.test(content) && IMPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const degradationCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoDegradation = degradationCount === 0
  const hasCosmic = (content.match(DOC_COMMENT_RE) || []).length > 0 && GENERIC_RE.test(content)
  const hasNoMediocrity = !NESTED_TERNARY_RE.test(content)
  const hasSupreme = content.length > 0 && RETURN_RE.test(content)

  if (content.length > 0) score += 5
  if (hasTranscendent) score += 12
  if (hasNoWeakness) score += 10
  if (hasDivine) score += 12
  if (hasNoCorruption) score += 10
  if (hasEternal) score += 10
  if (hasNoDegradation) score += 10
  if (hasCosmic) score += 11
  if (hasNoMediocrity) score += 10
  if (hasSupreme) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let rank: MythicalMeasure['rank'] = 'mundane'
  if (hasHighQuality && hasNoWeakness && hasTranscendent && hasDivine) rank = 'legendary'
  else if (hasHighQuality && hasNoWeakness) rank = 'epic'
  else if (hasHighQuality) rank = 'rare'
  else if (hasTranscendent && hasEternal) rank = 'uncommon'
  else if (quality > 30) rank = 'common'

  return {
    quality, rank, hasHighQuality, hasTranscendent, hasNoWeakness,
    hasDivine, hasNoCorruption, hasEternal, hasNoDegradation,
    hasCosmic, hasNoMediocrity, hasSupreme, weaknessCount, degradationCount,
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

/** @example classifyCondition(feather) returns condition */
export function classifyCondition(feather: ThunderFeather): ThunderFeather['condition'] {
  const { qualityScore } = feather
  if (qualityScore >= 80) return 'mythical-artifact'
  if (qualityScore >= 65) return 'sacred-relic'
  if (qualityScore >= 50) return 'powerful-totem'
  if (qualityScore >= 35) return 'mundane-object'
  if (qualityScore >= 20) return 'broken-shard'
  return 'dust'
}

// ─── analyzeThunderFeather ───────────────────────────────────

/** @example analyzeThunderFeather(content, filePath) returns full feather */
export function analyzeThunderFeather(content: string, filePath: string): ThunderFeather {
  const storm = measureStorm(content)
  const lightning = measureLightning(content)
  const thunder = measureThunder(content)
  const sacred = measureSacred(content)
  const nest = measureNest(content)
  const mythical = measureMythical(content)

  const stormPower = storm.power
  const lightningSpeed = lightning.speed
  const thunderImpact = thunder.impact
  const sacredProtection = sacred.protection
  const nestConstruction = nest.construction
  const mythicalQuality = mythical.quality

  const qualityScore = Math.round(
    stormPower * 0.15 +
    lightningSpeed * 0.15 +
    thunderImpact * 0.2 +
    sacredProtection * 0.2 +
    nestConstruction * 0.15 +
    mythicalQuality * 0.15,
  )

  const result: ThunderFeather = {
    file: filePath,
    stormPower, lightningSpeed, thunderImpact,
    sacredProtection, nestConstruction, mythicalQuality,
    storm, lightning, thunder, sacred, nest, mythical,
    qualityScore,
    condition: 'dust',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── Aerie Level Analysis ────────────────────────────────────

/** @example analyzeAerieLevel(feathers, dirPath) returns AerieLevel */
export function analyzeAerieLevel(feathers: ThunderFeather[], dirPath: string): AerieLevel {
  if (feathers.length === 0) {
    return {
      directory: dirPath, feathers: [], avgPower: 0, avgSpeed: 0, avgMythical: 0,
      legendaryCount: 0, dustCount: 0, powerfulCount: 0, fastCount: 0,
      levelType: 'underground', condition: 'ruined',
    }
  }

  const avgPower = Math.round(feathers.reduce((s, f) => s + f.stormPower, 0) / feathers.length)
  const avgSpeed = Math.round(feathers.reduce((s, f) => s + f.lightningSpeed, 0) / feathers.length)
  const avgMythical = Math.round(feathers.reduce((s, f) => s + f.mythicalQuality, 0) / feathers.length)
  const legendaryCount = feathers.filter((f) => f.mythical.rank === 'legendary').length
  const dustCount = feathers.filter((f) => f.condition === 'dust').length
  const powerfulCount = feathers.filter((f) => f.storm.hasHighPower).length
  const fastCount = feathers.filter((f) => f.lightning.hasHighSpeed).length

  const levelType = classifyLevelType(feathers)
  const avgScore = feathers.reduce((s, f) => s + f.qualityScore, 0) / feathers.length
  let condition: AerieLevel['condition'] = 'ruined'
  if (avgScore >= 75) condition = 'divine-sanctuary'
  else if (avgScore >= 60) condition = 'storm-fortress'
  else if (avgScore >= 45) condition = 'mountain-retreat'
  else if (avgScore >= 30) condition = 'shelter'
  else if (avgScore >= 15) condition = 'exposed'

  return {
    directory: dirPath, feathers, avgPower, avgSpeed, avgMythical,
    legendaryCount, dustCount, powerfulCount, fastCount, levelType, condition,
  }
}

// ─── classifyLevelType ───────────────────────────────────────

/** @example classifyLevelType(feathers) returns level type */
export function classifyLevelType(feathers: ThunderFeather[]): AerieLevel['levelType'] {
  if (feathers.length === 0) return 'underground'
  const avgScore = feathers.reduce((s, f) => s + f.qualityScore, 0) / feathers.length
  const mythicalCnt = feathers.filter((f) => f.mythical.rank === 'legendary' || f.mythical.rank === 'epic').length
  if (avgScore >= 75 && mythicalCnt >= Math.ceil(feathers.length * 0.3)) return 'mythical-aerie'
  if (avgScore >= 60) return 'storm-perch'
  if (avgScore >= 45) return 'mountain-nest'
  if (avgScore >= 30) return 'tree-branch'
  if (avgScore >= 15) return 'ground-level'
  return 'underground'
}

// ─── classifyShamanGrade ─────────────────────────────────────

/** @example classifyShamanGrade(avgPower) returns grade */
export function classifyShamanGrade(avgPower: number): ThunderbirdNestResult['stats']['shamanGrade'] {
  if (avgPower >= 80) return 'mythical-shaman'
  if (avgPower >= 65) return 'storm-caller'
  if (avgPower >= 50) return 'sky-watcher'
  if (avgPower >= 35) return 'apprentice'
  if (avgPower >= 20) return 'novice'
  return 'grounded'
}

// ─── generateRecommendations ─────────────────────────────────

/** @example generateRecommendations(feathers, levels, sky, stats) returns string[] */
export function generateRecommendations(
  feathers: ThunderFeather[],
  levels: AerieLevel[],
  sky: ThunderbirdNestResult['sky'],
  stats: ThunderbirdNestResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgStormPower < 50) recs.push('Amplify storm power — add more exports, functions, and structured types')
  if (stats.avgLightningSpeed < 50) recs.push('Accelerate lightning speed — add async patterns and reduce code duplication')
  if (stats.avgThunderImpact < 50) recs.push('Increase thunder impact — improve code influence with wider type coverage')
  if (stats.avgSacredProtection < 50) recs.push('Strengthen sacred protection — add error handling and remove eval/any usage')
  if (stats.avgNestConstruction < 50) recs.push('Reinforce nest construction — improve architecture with proper interfaces and imports')
  if (stats.avgMythicalQuality < 50) recs.push('Elevate mythical quality — combine async patterns with proper typing and documentation')
  if (stats.dustCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of feathers are dust — consider major refactoring')
  if (stats.brokenShardCount > 0) recs.push('Warning: broken shards detected — these files need immediate attention')
  if (sky.overallPower < 40) recs.push('Overall sky power is critical — establish an improvement plan')
  if (levels.length > 0 && levels.every((l) => l.condition === 'ruined')) recs.push('All levels are ruined — your codebase needs fundamental restructuring')

  if (feathers.length > 0) {
    const overloadedFeathers = feathers.filter((f) => f.storm.overloadCount > 2)
    if (overloadedFeathers.length > feathers.length * 0.5) recs.push('Over 50% of feathers are overloaded — reduce TODOs and FIXMEs')
  }

  return recs
}

// ─── buildThunderbirdNestResult ──────────────────────────────

/** @example buildThunderbirdNestResult(files, contents) returns full result */
export function buildThunderbirdNestResult(files: string[], contents: string[]): ThunderbirdNestResult {
  const feathers = files.map((file, i) => analyzeThunderFeather(contents[i] ?? '', file))

  const levelMap = new Map<string, ThunderFeather[]>()
  feathers.forEach((feather) => {
    const parts = feather.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = levelMap.get(dir)
    if (existing) existing.push(feather)
    else levelMap.set(dir, [feather])
  })

  const levels = Array.from(levelMap.entries()).map(([dir, fs]) => analyzeAerieLevel(fs, dir))

  const avgStormPower = feathers.length > 0 ? Math.round(feathers.reduce((s, f) => s + f.stormPower, 0) / feathers.length) : 0
  const avgLightningSpeed = feathers.length > 0 ? Math.round(feathers.reduce((s, f) => s + f.lightningSpeed, 0) / feathers.length) : 0
  const avgThunderImpact = feathers.length > 0 ? Math.round(feathers.reduce((s, f) => s + f.thunderImpact, 0) / feathers.length) : 0
  const avgSacredProtection = feathers.length > 0 ? Math.round(feathers.reduce((s, f) => s + f.sacredProtection, 0) / feathers.length) : 0
  const avgNestConstruction = feathers.length > 0 ? Math.round(feathers.reduce((s, f) => s + f.nestConstruction, 0) / feathers.length) : 0
  const avgMythicalQuality = feathers.length > 0 ? Math.round(feathers.reduce((s, f) => s + f.mythicalQuality, 0) / feathers.length) : 0

  const overallPower = Math.round(
    avgStormPower * 0.15 +
    avgLightningSpeed * 0.15 +
    avgThunderImpact * 0.2 +
    avgSacredProtection * 0.2 +
    avgNestConstruction * 0.15 +
    avgMythicalQuality * 0.15,
  )

  const sky = {
    avgPower: avgStormPower,
    avgSpeed: avgLightningSpeed,
    avgMythical: avgMythicalQuality,
    isMythical: overallPower >= 60,
    overallPower,
  }

  const stats = {
    totalFiles: files.length,
    totalLevels: levels.length,
    avgStormPower,
    avgLightningSpeed,
    avgThunderImpact,
    avgSacredProtection,
    avgNestConstruction,
    avgMythicalQuality,
    mythicalArtifactCount: feathers.filter((f) => f.condition === 'mythical-artifact').length,
    sacredRelicCount: feathers.filter((f) => f.condition === 'sacred-relic').length,
    powerfulTotemCount: feathers.filter((f) => f.condition === 'powerful-totem').length,
    mundaneObjectCount: feathers.filter((f) => f.condition === 'mundane-object').length,
    brokenShardCount: feathers.filter((f) => f.condition === 'broken-shard').length,
    dustCount: feathers.filter((f) => f.condition === 'dust').length,
    hasHighPowerCount: feathers.filter((f) => f.storm.hasHighPower).length,
    hasHighSpeedCount: feathers.filter((f) => f.lightning.hasHighSpeed).length,
    hasHighImpactCount: feathers.filter((f) => f.thunder.hasHighImpact).length,
    hasHighProtectionCount: feathers.filter((f) => f.sacred.hasHighProtection).length,
    hasHighConstructionCount: feathers.filter((f) => f.nest.hasHighConstruction).length,
    hasHighQualityCount: feathers.filter((f) => f.mythical.hasHighQuality).length,
    overallPower,
    shamanGrade: classifyShamanGrade(overallPower),
    bestFeather: '',
    mostPowerful: '',
    fastest: '',
    mostImpactful: '',
    mostProtected: '',
    bestArchitected: '',
  }

  if (feathers.length > 0) {
    stats.bestFeather = feathers.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.mostPowerful = feathers.reduce((a, b) => a.stormPower >= b.stormPower ? a : b).file
    stats.fastest = feathers.reduce((a, b) => a.lightningSpeed >= b.lightningSpeed ? a : b).file
    stats.mostImpactful = feathers.reduce((a, b) => a.thunderImpact >= b.thunderImpact ? a : b).file
    stats.mostProtected = feathers.reduce((a, b) => a.sacredProtection >= b.sacredProtection ? a : b).file
    stats.bestArchitected = feathers.reduce((a, b) => a.nestConstruction >= b.nestConstruction ? a : b).file
  }

  const recommendations = generateRecommendations(feathers, levels, sky, stats)

  return { feathers, levels, sky, stats, recommendations }
}
