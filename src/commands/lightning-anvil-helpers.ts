// ─── Interfaces ──────────────────────────────────────────

export interface StrikingMeasure {
  speed: number
  velocity: 'light-speed' | 'fast-as-lightning' | 'proper-flash' | 'slow-drift' | 'stationary' | 'no-speed'
  hasHighSpeed: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasFast: boolean
  hasNoSlow: boolean
  hasOptimized: boolean
  hasNoUnoptimized: boolean
  hasLean: boolean
  hasDirect: boolean
  hasQuick: boolean
  hasResponsive: boolean
  hasSnappy: boolean
  hasImmediate: boolean
  hasSwift: boolean
  hasRapid: boolean
  hasAccelerated: boolean
  wastefulCount: number
  slowCount: number
}

export interface CommandingMeasure {
  authority: number
  thunder: 'thunder-god' | 'storm-lord' | 'proper-rumble' | 'distant-echo' | 'silence' | 'no-authority'
  hasHighAuthority: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasConfident: boolean
  hasNoHesitant: boolean
  hasClear: boolean
  hasDecisive: boolean
  hasDocumented: boolean
  hasTyped: boolean
  hasAssertive: boolean
  hasDirect: boolean
  hasStrong: boolean
  hasCommanding: boolean
  hasAuthoritative: boolean
  hasBold: boolean
  hasFirm: boolean
  chaoticCount: number
  hesitantCount: number
}

export interface WeatheringMeasure {
  resilience: number
  shelter: 'lightning-rod' | 'storm-shelter' | 'proper-grounding' | 'exposed-wire' | 'fragile-glass' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasGrounded: boolean
  hasShielded: boolean
  hasProtected: boolean
  hasSafe: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasReinforced: boolean
  hasStormproof: boolean
  hasImpervious: boolean
  unhandledCount: number
  untestedCount: number
}

export interface IgnitingMeasure {
  precision: number
  spark: 'surgical-strike' | 'laser-precise' | 'proper-aim' | 'scatter-shot' | 'wild-arc' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasPrecise: boolean
  hasExact: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasCorrect: boolean
  hasFaithful: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasTargeted: boolean
  hasFocused: boolean
  unsafeCount: number
  approximateCount: number
}

export interface IlluminatingMeasure {
  wisdom: number
  flash: 'cosmic-revelation' | 'brilliant-flash' | 'proper-insight' | 'dim-glow' | 'darkness' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasInsightful: boolean
  hasProven: boolean
  hasStrategic: boolean
  hasMature: boolean
  hasPatterned: boolean
  hasIlluminating: boolean
  hasRevealing: boolean
  hasEnlightened: boolean
  hasVisionary: boolean
  hasClairvoyant: boolean
  hasOmniscient: boolean
  hackedCount: number
  shallowCount: number
}

export type BoltCondition =
  | 'lightning-masterpiece'
  | 'storm-forged'
  | 'proper-bolt'
  | 'weak-spark'
  | 'dead-wire'
  | 'void'

export interface LightningBolt {
  file: string
  lightningSpeed: number
  thunderAuthority: number
  stormResilience: number
  sparkPrecision: number
  boltWisdom: number
  striking: StrikingMeasure
  commanding: CommandingMeasure
  weathering: WeatheringMeasure
  igniting: IgnitingMeasure
  illuminating: IlluminatingMeasure
  condition: BoltCondition
  qualityScore: number
}

export type ForgeType =
  | 'storm-foundry'
  | 'thunder-workshop'
  | 'proper-forge'
  | 'spark-gap'
  | 'dead-circuit'
  | 'no-forge'

export type ForgeCondition =
  | 'lightning-hall'
  | 'storm-cathedral'
  | 'proper-workshop'
  | 'dark-shed'
  | 'ruins'
  | 'void'

export interface ThunderForge {
  directory: string
  bolts: LightningBolt[]
  avgSpeed: number
  avgResilience: number
  avgWisdom: number
  lightningMasterpieceCount: number
  voidCount: number
  forgeType: ForgeType
  condition: ForgeCondition
}

export interface LightningAnvilResult {
  bolts: LightningBolt[]
  forges: ThunderForge[]
  storm: {
    avgSpeed: number
    avgResilience: number
    avgWisdom: number
    isLightning: boolean
    overallVoltage: number
  }
  stats: {
    totalFiles: number
    totalForges: number
    avgLightningSpeed: number
    avgThunderAuthority: number
    avgStormResilience: number
    avgSparkPrecision: number
    avgBoltWisdom: number
    lightningMasterpieceCount: number
    stormForgedCount: number
    properBoltCount: number
    weakSparkCount: number
    deadWireCount: number
    voidCount: number
    hasHighSpeedCount: number
    hasHighAuthorityCount: number
    hasHighResilienceCount: number
    hasHighPrecisionCount: number
    hasHighWisdomCount: number
    overallVoltage: number
    stormCallerGrade: 'thunder-god' | 'storm-caller' | 'lightning-tamer' | 'apprentice' | 'novice' | 'grounded-mortal'
    bestBolt: string
    fastest: string
    mostAuthoritative: string
    mostResilient: string
    mostPrecise: string
    wisest: string
  }
  recommendations: string[]
}

// ─── Score computation ──────────────────────────────────

function computeScore(positiveBooleans: boolean[]): number {
  const total = positiveBooleans.length
  const perFeature = total > 0 ? Math.floor(100 / total) : 0
  const remainder = total > 0 ? 100 - perFeature * total : 0
  let score = 0
  for (let i = 0; i < total; i++) {
    if (positiveBooleans[i]) {
      score += perFeature + (i < remainder ? 1 : 0)
    }
  }
  return score
}

// ─── Classifiers ────────────────────────────────────────

/** @example classifyBoltCondition(90) */
export function classifyBoltCondition(score: number): BoltCondition {
  if (score >= 90) return 'lightning-masterpiece'
  if (score >= 75) return 'storm-forged'
  if (score >= 60) return 'proper-bolt'
  if (score >= 40) return 'weak-spark'
  if (score >= 20) return 'dead-wire'
  return 'void'
}

/** @example classifyForgeType(bolts) */
export function classifyForgeType(bolts: LightningBolt[]): ForgeType {
  if (bolts.length === 0) return 'no-forge'
  const avg =
    bolts.reduce((s, b) => s + b.qualityScore, 0) / bolts.length
  if (avg >= 85) return 'storm-foundry'
  if (avg >= 70) return 'thunder-workshop'
  if (avg >= 55) return 'proper-forge'
  if (avg >= 35) return 'spark-gap'
  return 'dead-circuit'
}

/** @example classifyForgeCondition(85) */
export function classifyForgeCondition(score: number): ForgeCondition {
  if (score >= 85) return 'lightning-hall'
  if (score >= 70) return 'storm-cathedral'
  if (score >= 55) return 'proper-workshop'
  if (score >= 35) return 'dark-shed'
  if (score >= 15) return 'ruins'
  return 'void'
}

/** @example classifyStormCallerGrade(80) */
export function classifyStormCallerGrade(
  avgVoltage: number,
): LightningAnvilResult['stats']['stormCallerGrade'] {
  if (avgVoltage >= 80) return 'thunder-god'
  if (avgVoltage >= 65) return 'storm-caller'
  if (avgVoltage >= 50) return 'lightning-tamer'
  if (avgVoltage >= 35) return 'apprentice'
  if (avgVoltage >= 20) return 'novice'
  return 'grounded-mortal'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureStriking('const x: string = ""') */
export function measureStriking(content: string): StrikingMeasure {
  const hasEfficient = !/\bany\b/.test(content)
  const wastefulCount = (content.match(/\b(hack|workaround|bypass)\b/gi) ?? []).length
  const hasNoWasteful = wastefulCount === 0
  const hasFast = /\b(const|readonly)\b/.test(content)
  const slowCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoSlow = slowCount === 0
  const hasOptimized = /\b(readonly|private|protected)\b/.test(content)
  const hasNoUnoptimized = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasLean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasQuick = /\b(import|export)\b/.test(content)
  const hasResponsive = /\b(async|await|Promise)\b/.test(content)
  const hasSnappy = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasImmediate = /\b(class|interface|type)\b/.test(content)
  const hasSwift = !/\b(dirty|hacky|gross)\b/i.test(content)
  const hasRapid = /\b(readonly|as const)\b/.test(content)
  const hasAccelerated = /\b(export|public)\b/.test(content)

  const positiveBooleans = [
    hasEfficient,
    hasNoWasteful,
    hasFast,
    hasNoSlow,
    hasOptimized,
    hasNoUnoptimized,
    hasLean,
    hasDirect,
    hasQuick,
    hasResponsive,
    hasSnappy,
    hasImmediate,
    hasSwift,
    hasRapid,
    hasAccelerated,
  ]

  const speed = computeScore(positiveBooleans)
  const hasHighSpeed = speed >= 60

  let velocity: StrikingMeasure['velocity'] = 'no-speed'
  if (speed >= 90) velocity = 'light-speed'
  else if (speed >= 75) velocity = 'fast-as-lightning'
  else if (speed >= 60) velocity = 'proper-flash'
  else if (speed >= 40) velocity = 'slow-drift'
  else if (speed >= 20) velocity = 'stationary'

  return {
    speed,
    velocity,
    hasHighSpeed,
    hasEfficient,
    hasNoWasteful,
    hasFast,
    hasNoSlow,
    hasOptimized,
    hasNoUnoptimized,
    hasLean,
    hasDirect,
    hasQuick,
    hasResponsive,
    hasSnappy,
    hasImmediate,
    hasSwift,
    hasRapid,
    hasAccelerated,
    wastefulCount,
    slowCount,
  }
}

/** @example measureCommanding('class X { private y: string }') */
export function measureCommanding(content: string): CommandingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasConfident = /\b(export|public)\b/.test(content)
  const hesitantCount = (content.match(/\b(uncertain|tentative|maybe)\b/gi) ?? []).length
  const hasNoHesitant = hesitantCount === 0
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasDecisive = /\b(return|throw|if)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTyped = /\b(readonly|private|protected)\b/.test(content)
  const hasAssertive = /\b(try|catch|finally)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasStrong = !/\bany\b/.test(content)
  const hasCommanding = /\b(import|export)\b/.test(content)
  const hasAuthoritative = /\b(readonly|as const)\b/.test(content)
  const hasBold = /\b(async|await|Promise)\b/.test(content)
  const hasFirm = !/\b(quick|dirty|temporary)\b/i.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasConfident,
    hasNoHesitant,
    hasClear,
    hasDecisive,
    hasDocumented,
    hasTyped,
    hasAssertive,
    hasDirect,
    hasStrong,
    hasCommanding,
    hasAuthoritative,
    hasBold,
    hasFirm,
  ]

  const authority = computeScore(positiveBooleans)
  const hasHighAuthority = authority >= 60

  let thunder: CommandingMeasure['thunder'] = 'no-authority'
  if (authority >= 90) thunder = 'thunder-god'
  else if (authority >= 75) thunder = 'storm-lord'
  else if (authority >= 60) thunder = 'proper-rumble'
  else if (authority >= 40) thunder = 'distant-echo'
  else if (authority >= 20) thunder = 'silence'

  return {
    authority,
    thunder,
    hasHighAuthority,
    hasWellStructured,
    hasNoChaotic,
    hasConfident,
    hasNoHesitant,
    hasClear,
    hasDecisive,
    hasDocumented,
    hasTyped,
    hasAssertive,
    hasDirect,
    hasStrong,
    hasCommanding,
    hasAuthoritative,
    hasBold,
    hasFirm,
    chaoticCount,
    hesitantCount,
  }
}

/** @example measureWeathering('try { x() } catch { y() }') */
export function measureWeathering(content: string): WeatheringMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(readonly|private|protected)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasTested = /\b(try|catch|throw|if)\b/.test(content)
  const untestedCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasGrounded = /\b(const|readonly)\b/.test(content)
  const hasShielded = /\b(class|interface|type)\b/.test(content)
  const hasProtected = !/\b(vulnerable|exploit|inject)\b/i.test(content)
  const hasSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasHardened = /\b(function|=>|return)\b/.test(content)
  const hasEnduring = !/\bany\b/.test(content)
  const hasReinforced = /\b(readonly|private|protected)\b/.test(content)
  const hasStormproof = /\b(async|await|Promise)\b/.test(content)
  const hasImpervious = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasTested,
    hasNoUntested,
    hasGrounded,
    hasShielded,
    hasProtected,
    hasSafe,
    hasHardened,
    hasEnduring,
    hasReinforced,
    hasStormproof,
    hasImpervious,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let shelter: WeatheringMeasure['shelter'] = 'no-resilience'
  if (resilience >= 90) shelter = 'lightning-rod'
  else if (resilience >= 75) shelter = 'storm-shelter'
  else if (resilience >= 60) shelter = 'proper-grounding'
  else if (resilience >= 40) shelter = 'exposed-wire'
  else if (resilience >= 20) shelter = 'fragile-glass'

  return {
    resilience,
    shelter,
    hasHighResilience,
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasTested,
    hasNoUntested,
    hasGrounded,
    hasShielded,
    hasProtected,
    hasSafe,
    hasHardened,
    hasEnduring,
    hasReinforced,
    hasStormproof,
    hasImpervious,
    unhandledCount,
    untestedCount,
  }
}

/** @example measureIgniting('const x: string = ""') */
export function measureIgniting(content: string): IgnitingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(roughly|approximately|guesstimate)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasPrecise = /\b(readonly|as const)\b/.test(content)
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasNoDirty = !/\b(dirty|hacky|gross)\b/i.test(content)
  const hasCorrect = /\b(import|export)\b/.test(content)
  const hasFaithful = /\b(readonly|private|protected)\b/.test(content)
  const hasSharp = /\b(function|=>|return)\b/.test(content)
  const hasCrisp = !/\b(var|eval)\b/.test(content)
  const hasDefined = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTargeted = /\b(try|catch|if)\b/.test(content)
  const hasFocused = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe,
    hasNoUnsafe,
    hasAccurate,
    hasNoApproximate,
    hasPrecise,
    hasExact,
    hasClean,
    hasNoDirty,
    hasCorrect,
    hasFaithful,
    hasSharp,
    hasCrisp,
    hasDefined,
    hasTargeted,
    hasFocused,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let spark: IgnitingMeasure['spark'] = 'no-precision'
  if (precision >= 90) spark = 'surgical-strike'
  else if (precision >= 75) spark = 'laser-precise'
  else if (precision >= 60) spark = 'proper-aim'
  else if (precision >= 40) spark = 'scatter-shot'
  else if (precision >= 20) spark = 'wild-arc'

  return {
    precision,
    spark,
    hasHighPrecision,
    hasTypeSafe,
    hasNoUnsafe,
    hasAccurate,
    hasNoApproximate,
    hasPrecise,
    hasExact,
    hasClean,
    hasNoDirty,
    hasCorrect,
    hasFaithful,
    hasSharp,
    hasCrisp,
    hasDefined,
    hasTargeted,
    hasFocused,
    unsafeCount,
    approximateCount,
  }
}

/** @example measureIlluminating('class X implements Y { readonly z: string }') */
export function measureIlluminating(content: string): IlluminatingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const hasDeep = /\b(interface|type)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasProven = /\b(export|public)\b/.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasMature = /\b(readonly|as const)\b/.test(content)
  const hasPatterned = /\b(async|await|Promise)\b/.test(content)
  const hasIlluminating = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRevealing = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEnlightened = /\b(function|class|interface)\b/.test(content)
  const hasVisionary = /\b(return|throw)\b/.test(content)
  const hasClairvoyant = !/\bany\b/.test(content)
  const hasOmniscient = /\b(try|catch|if)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|skin.deep)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasInsightful,
    hasProven,
    hasStrategic,
    hasMature,
    hasPatterned,
    hasIlluminating,
    hasRevealing,
    hasEnlightened,
    hasVisionary,
    hasClairvoyant,
    hasOmniscient,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let flash: IlluminatingMeasure['flash'] = 'no-wisdom'
  if (wisdom >= 90) flash = 'cosmic-revelation'
  else if (wisdom >= 75) flash = 'brilliant-flash'
  else if (wisdom >= 60) flash = 'proper-insight'
  else if (wisdom >= 40) flash = 'dim-glow'
  else if (wisdom >= 20) flash = 'darkness'

  return {
    wisdom,
    flash,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasInsightful,
    hasProven,
    hasStrategic,
    hasMature,
    hasPatterned,
    hasIlluminating,
    hasRevealing,
    hasEnlightened,
    hasVisionary,
    hasClairvoyant,
    hasOmniscient,
    hackedCount,
    shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeLightningBolt(content, 'app.ts') */
export function analyzeLightningBolt(content: string, filePath: string): LightningBolt {
  const striking = measureStriking(content)
  const commanding = measureCommanding(content)
  const weathering = measureWeathering(content)
  const igniting = measureIgniting(content)
  const illuminating = measureIlluminating(content)

  const lightningSpeed = striking.speed
  const thunderAuthority = commanding.authority
  const stormResilience = weathering.resilience
  const sparkPrecision = igniting.precision
  const boltWisdom = illuminating.wisdom

  const qualityScore = Math.round(
    lightningSpeed * 0.2 +
    thunderAuthority * 0.2 +
    stormResilience * 0.2 +
    sparkPrecision * 0.2 +
    boltWisdom * 0.2,
  )

  const condition = classifyBoltCondition(qualityScore)

  return {
    file: filePath,
    lightningSpeed,
    thunderAuthority,
    stormResilience,
    sparkPrecision,
    boltWisdom,
    striking,
    commanding,
    weathering,
    igniting,
    illuminating,
    condition,
    qualityScore,
  }
}

/** @example analyzeThunderForge(bolts, 'src') */
export function analyzeThunderForge(bolts: LightningBolt[], dirPath: string): ThunderForge {
  if (bolts.length === 0) {
    return {
      directory: dirPath,
      bolts: [],
      avgSpeed: 0,
      avgResilience: 0,
      avgWisdom: 0,
      lightningMasterpieceCount: 0,
      voidCount: 0,
      forgeType: 'no-forge',
      condition: 'void',
    }
  }

  const avgSpeed = Math.round(
    bolts.reduce((s, b) => s + b.lightningSpeed, 0) / bolts.length,
  )
  const avgResilience = Math.round(
    bolts.reduce((s, b) => s + b.stormResilience, 0) / bolts.length,
  )
  const avgWisdom = Math.round(
    bolts.reduce((s, b) => s + b.boltWisdom, 0) / bolts.length,
  )

  const lightningMasterpieceCount = bolts.filter(
    (b) => b.condition === 'lightning-masterpiece',
  ).length
  const voidCount = bolts.filter((b) => b.condition === 'void').length

  const forgeType = classifyForgeType(bolts)
  const avgQuality = Math.round(
    bolts.reduce((s, b) => s + b.qualityScore, 0) / bolts.length,
  )
  const condition = classifyForgeCondition(avgQuality)

  return {
    directory: dirPath,
    bolts,
    avgSpeed,
    avgResilience,
    avgWisdom,
    lightningMasterpieceCount,
    voidCount,
    forgeType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildLightningAnvilResult(['a.ts'], [content]) */
export async function buildLightningAnvilResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<LightningAnvilResult> {
  const bolts: LightningBolt[] = files.map((file, i) =>
    analyzeLightningBolt(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, LightningBolt[]>()
  for (const bolt of bolts) {
    const dir = bolt.file.includes('/')
      ? bolt.file.substring(0, bolt.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(bolt)
    } else {
      dirMap.set(dir, [bolt])
    }
  }

  const forges: ThunderForge[] = Array.from(dirMap.entries()).map(([dir, dirBolts]) =>
    analyzeThunderForge(dirBolts, dir),
  )

  const avgSpeed =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.lightningSpeed, 0) / bolts.length)
      : 0
  const avgResilience =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.stormResilience, 0) / bolts.length)
      : 0
  const avgWisdom =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.boltWisdom, 0) / bolts.length)
      : 0

  const overallVoltage =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.qualityScore, 0) / bolts.length)
      : 0
  const isLightning = overallVoltage >= 60

  const storm = { avgSpeed, avgResilience, avgWisdom, isLightning, overallVoltage }

  const avgThunderAuthority =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.thunderAuthority, 0) / bolts.length)
      : 0
  const avgSparkPrecision =
    bolts.length > 0
      ? Math.round(bolts.reduce((s, b) => s + b.sparkPrecision, 0) / bolts.length)
      : 0
  const avgBoltWisdom = avgWisdom

  const lightningMasterpieceCount = bolts.filter(
    (b) => b.condition === 'lightning-masterpiece',
  ).length
  const stormForgedCount = bolts.filter(
    (b) => b.condition === 'storm-forged',
  ).length
  const properBoltCount = bolts.filter(
    (b) => b.condition === 'proper-bolt',
  ).length
  const weakSparkCount = bolts.filter(
    (b) => b.condition === 'weak-spark',
  ).length
  const deadWireCount = bolts.filter(
    (b) => b.condition === 'dead-wire',
  ).length
  const voidCount = bolts.filter((b) => b.condition === 'void').length

  const hasHighSpeedCount = bolts.filter(
    (b) => b.striking.hasHighSpeed,
  ).length
  const hasHighAuthorityCount = bolts.filter(
    (b) => b.commanding.hasHighAuthority,
  ).length
  const hasHighResilienceCount = bolts.filter(
    (b) => b.weathering.hasHighResilience,
  ).length
  const hasHighPrecisionCount = bolts.filter(
    (b) => b.igniting.hasHighPrecision,
  ).length
  const hasHighWisdomCount = bolts.filter(
    (b) => b.illuminating.hasHighWisdom,
  ).length

  const stormCallerGrade = classifyStormCallerGrade(overallVoltage)

  const bestBolt = bolts.length > 0
    ? bolts.reduce((best, b) => (b.qualityScore > best.qualityScore ? b : best)).file
    : ''
  const fastest = bolts.length > 0
    ? bolts.reduce((best, b) => (b.lightningSpeed > best.lightningSpeed ? b : best)).file
    : ''
  const mostAuthoritative = bolts.length > 0
    ? bolts.reduce((best, b) => (b.thunderAuthority > best.thunderAuthority ? b : best)).file
    : ''
  const mostResilient = bolts.length > 0
    ? bolts.reduce((best, b) => (b.stormResilience > best.stormResilience ? b : best)).file
    : ''
  const mostPrecise = bolts.length > 0
    ? bolts.reduce((best, b) => (b.sparkPrecision > best.sparkPrecision ? b : best)).file
    : ''
  const wisest = bolts.length > 0
    ? bolts.reduce((best, b) => (b.boltWisdom > best.boltWisdom ? b : best)).file
    : ''

  const stats: LightningAnvilResult['stats'] = {
    totalFiles: files.length,
    totalForges: forges.length,
    avgLightningSpeed: avgSpeed,
    avgThunderAuthority,
    avgStormResilience: avgResilience,
    avgSparkPrecision,
    avgBoltWisdom,
    lightningMasterpieceCount,
    stormForgedCount,
    properBoltCount,
    weakSparkCount,
    deadWireCount,
    voidCount,
    hasHighSpeedCount,
    hasHighAuthorityCount,
    hasHighResilienceCount,
    hasHighPrecisionCount,
    hasHighWisdomCount,
    overallVoltage,
    stormCallerGrade,
    bestBolt,
    fastest,
    mostAuthoritative,
    mostResilient,
    mostPrecise,
    wisest,
  }

  const recommendations = generateRecommendations(bolts, forges, storm, stats)

  return { bolts, forges, storm, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(bolts, forges, storm, stats) */
export function generateRecommendations(
  bolts: LightningBolt[],
  forges: ThunderForge[],
  storm: LightningAnvilResult['storm'],
  stats: LightningAnvilResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgLightningSpeed >= 90 &&
    stats.avgThunderAuthority >= 90 &&
    stats.avgStormResilience >= 90 &&
    stats.avgSparkPrecision >= 90 &&
    stats.avgBoltWisdom >= 90
  ) {
    recs.push(
      'Your lightning forge channels the fury of a thousand thunderstorms! Each bolt is a masterpiece of electric perfection!',
    )
    return recs
  }

  if (stats.avgLightningSpeed < 60) {
    recs.push(
      'Accelerate the forge — code should strike like lightning, finding the fastest path with zero resistance',
    )
  }

  if (stats.avgThunderAuthority < 60) {
    recs.push(
      'Command with thunder — code should announce its presence with the authority of a thunderclap that shakes the heavens',
    )
  }

  if (stats.avgStormResilience < 60) {
    recs.push(
      'Weather the storm — your code should be forged to withstand the fiercest tempest, like a lightning rod grounded in bedrock',
    )
  }

  if (stats.avgSparkPrecision < 60) {
    recs.push(
      'Sharpen the spark — lightning finds its exact target with surgical precision; your code should be no less accurate',
    )
  }

  if (stats.avgBoltWisdom < 60) {
    recs.push(
      'Channel the illumination — lightning reveals everything in a single flash; your code should illuminate its purpose instantly',
    )
  }

  if (stats.overallVoltage < 40) {
    recs.push(
      'The forge has gone dark — reignite the lightning before the last spark dies and the anvil falls silent',
    )
  }

  const voidBolts = bolts.filter((b) => b.condition === 'void')
  if (voidBolts.length > 0 && voidBolts.length <= 5) {
    recs.push(
      `Re-examine these dead wires: ${voidBolts.map((b) => b.file).join(', ')}`,
    )
  } else if (voidBolts.length > 5) {
    recs.push(
      `Re-examine these ${voidBolts.length} dead wires before the lightning forge collapses entirely`,
    )
  }

  const poorForges = forges.filter(
    (f) => f.condition === 'void' || f.condition === 'ruins',
  )
  if (poorForges.length === forges.length && forges.length > 0) {
    recs.push(
      'All forges have fallen silent — the lightning network needs complete reconstruction from the ground up',
    )
  }

  if (recs.length === 0) {
    recs.push('Your lightning anvil hums with electric power — each bolt forged carries thunderous authority and blinding precision')
  }

  return recs
}
