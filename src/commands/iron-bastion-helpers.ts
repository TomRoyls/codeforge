// ─── Interfaces ──────────────────────────────────────────

export interface ReinforcingMeasure {
  fortitude: number
  beam: 'i-beam-grade' | 'structural-steel' | 'proper-support' | 'thin-wire' | 'tin-foil' | 'no-fortitude'
  hasHighFortitude: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasSolid: boolean
  hasRobust: boolean
  hasStrong: boolean
  hasDurable: boolean
  hasStable: boolean
  hasHardened: boolean
  hasReinforced: boolean
  hasFortified: boolean
  hasLoadBearing: boolean
  hasSubstantial: boolean
  hasSound: boolean
  chaoticCount: number
  unsafeCount: number
}

export interface ProtectingMeasure {
  resistance: number
  coating: 'stainless-steel' | 'galvanized-iron' | 'proper-coating' | 'surface-rust' | 'corroded-metal' | 'no-resistance'
  hasHighResistance: boolean
  hasNoHack: boolean
  hasNoWorkaround: boolean
  hasNoTodo: boolean
  hasNoCommentedOut: boolean
  hasNoDebugCode: boolean
  hasNoDeadCode: boolean
  hasClean: boolean
  hasPristine: boolean
  hasMaintained: boolean
  hasPreserved: boolean
  hasProtected: boolean
  hasGuarded: boolean
  hasDefended: boolean
  hasShielded: boolean
  hasUntarnished: boolean
  hackCount: number
  workaroundCount: number
}

export interface HammeringMeasure {
  precision: number
  craft: 'master-smith' | 'skilled-forge' | 'proper-hammer' | 'clumsy-anvil' | 'unshaped-ore' | 'no-precision'
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasClean: boolean
  hasPrecise: boolean
  hasCorrect: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasPolished: boolean
  hasRefined: boolean
  hasCrafted: boolean
  hasShaped: boolean
  hasHoned: boolean
  hasTooled: boolean
  approximateCount: number
  roughCount: number
}

export interface TemperingMeasure {
  vitality: number
  heat: 'white-hot' | 'red-hot' | 'proper-glow' | 'lukewarm' | 'cold-metal' | 'no-vitality'
  hasHighVitality: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasAlive: boolean
  hasNoDead: boolean
  hasEvolving: boolean
  hasGrowing: boolean
  hasImproving: boolean
  hasThriving: boolean
  hasVibrant: boolean
  hasEnergetic: boolean
  hasActive: boolean
  hasRenewed: boolean
  hasRevitalized: boolean
  untestedCount: number
  deadCount: number
}

export interface KnowingMeasure {
  wisdom: number
  forge: 'master-forge' | 'veteran-smith' | 'proper-artisan' | 'apprentice-hammer' | 'raw-iron' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasStrategic: boolean
  hasHolistic: boolean
  hasProven: boolean
  hasMature: boolean
  hasInsightful: boolean
  hasVisionary: boolean
  hasComprehensive: boolean
  hasConnected: boolean
  hasStructural: boolean
  hasWise: boolean
  hasSeasoned: boolean
  hackedCount: number
  shallowCount: number
}

export type PlateCondition =
  | 'iron-masterpiece'
  | 'tempered-steel'
  | 'proper-iron'
  | 'rusted-metal'
  | 'scrap-iron'
  | 'void'

export interface IronPlate {
  file: string
  structuralFortitude: number
  rustResistance: number
  anvilPrecision: number
  forgeVitality: number
  steelWisdom: number
  reinforcing: ReinforcingMeasure
  protecting: ProtectingMeasure
  hammering: HammeringMeasure
  tempering: TemperingMeasure
  knowing: KnowingMeasure
  condition: PlateCondition
  qualityScore: number
}

export type FortressType =
  | 'impregnable-fortress'
  | 'strong-castle'
  | 'proper-keep'
  | 'wooden-fort'
  | 'ruin'
  | 'no-fortress'

export type FortressCondition =
  | 'iron-palace'
  | 'steel-tower'
  | 'proper-fortress'
  | 'stone-walls'
  | 'wooden-fence'
  | 'void'

export interface IronFortress {
  directory: string
  plates: IronPlate[]
  avgFortitude: number
  avgPrecision: number
  avgWisdom: number
  ironMasterpieceCount: number
  voidCount: number
  fortressType: FortressType
  condition: FortressCondition
}

export type SmithGrade = 'master-smith' | 'veteran-forge-worker' | 'proper-blacksmith' | 'apprentice' | 'novice' | 'bellows-puller'

export interface IronBastionResult {
  plates: IronPlate[]
  fortresses: IronFortress[]
  foundry: {
    avgFortitude: number
    avgPrecision: number
    avgWisdom: number
    isIron: boolean
    overallStrength: number
  }
  stats: {
    totalFiles: number
    totalFortresses: number
    avgStructuralFortitude: number
    avgRustResistance: number
    avgAnvilPrecision: number
    avgForgeVitality: number
    avgSteelWisdom: number
    ironMasterpieceCount: number
    temperedSteelCount: number
    properIronCount: number
    rustedMetalCount: number
    scrapIronCount: number
    voidCount: number
    hasHighFortitudeCount: number
    hasHighResistanceCount: number
    hasHighPrecisionCount: number
    hasHighVitalityCount: number
    hasHighWisdomCount: number
    overallStrength: number
    smithGrade: SmithGrade
    bestPlate: string
    strongest: string
    mostResistant: string
    mostPrecise: string
    mostVital: string
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

/** @example classifyPlateCondition(90) */
export function classifyPlateCondition(score: number): PlateCondition {
  if (score >= 90) return 'iron-masterpiece'
  if (score >= 75) return 'tempered-steel'
  if (score >= 60) return 'proper-iron'
  if (score >= 40) return 'rusted-metal'
  if (score >= 20) return 'scrap-iron'
  return 'void'
}

/** @example classifyFortressType(plates) */
export function classifyFortressType(plates: IronPlate[]): FortressType {
  if (plates.length === 0) return 'no-fortress'
  const avg = plates.reduce((s, p) => s + p.qualityScore, 0) / plates.length
  if (avg >= 85) return 'impregnable-fortress'
  if (avg >= 70) return 'strong-castle'
  if (avg >= 55) return 'proper-keep'
  if (avg >= 35) return 'wooden-fort'
  return 'ruin'
}

/** @example classifyFortressCondition(85) */
export function classifyFortressCondition(score: number): FortressCondition {
  if (score >= 85) return 'iron-palace'
  if (score >= 70) return 'steel-tower'
  if (score >= 55) return 'proper-fortress'
  if (score >= 35) return 'stone-walls'
  if (score >= 15) return 'wooden-fence'
  return 'void'
}

/** @example classifySmithGrade(80) */
export function classifySmithGrade(avgStrength: number): SmithGrade {
  if (avgStrength >= 80) return 'master-smith'
  if (avgStrength >= 65) return 'veteran-forge-worker'
  if (avgStrength >= 50) return 'proper-blacksmith'
  if (avgStrength >= 35) return 'apprentice'
  if (avgStrength >= 20) return 'novice'
  return 'bellows-puller'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureReinforcing('export class X { readonly y: string }') */
export function measureReinforcing(content: string): ReinforcingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|tangled|spaghetti)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasSolid = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasStrong = /\b(readonly|private|protected)\b/.test(content)
  const hasDurable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasStable = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasHardened = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasReinforced = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasFortified = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasLoadBearing = /\b(function|=>|return)\b/.test(content)
  const hasSubstantial = /\b(async|await|Promise)\b/.test(content)
  const hasSound = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasTypeSafe, hasNoUnsafe, hasSolid,
    hasRobust, hasStrong, hasDurable, hasStable, hasHardened,
    hasReinforced, hasFortified, hasLoadBearing, hasSubstantial, hasSound,
  ]

  const fortitude = computeScore(positiveBooleans)
  const hasHighFortitude = fortitude >= 60

  let beam: ReinforcingMeasure['beam'] = 'no-fortitude'
  if (fortitude >= 90) beam = 'i-beam-grade'
  else if (fortitude >= 75) beam = 'structural-steel'
  else if (fortitude >= 60) beam = 'proper-support'
  else if (fortitude >= 40) beam = 'thin-wire'
  else if (fortitude >= 20) beam = 'tin-foil'

  return {
    fortitude, beam, hasHighFortitude,
    hasWellStructured, hasNoChaotic, hasTypeSafe, hasNoUnsafe, hasSolid,
    hasRobust, hasStrong, hasDurable, hasStable, hasHardened,
    hasReinforced, hasFortified, hasLoadBearing, hasSubstantial, hasSound,
    chaoticCount, unsafeCount,
  }
}

/** @example measureProtecting('export class X { readonly y: string }') */
export function measureProtecting(content: string): ProtectingMeasure {
  const hackCount = (content.match(/\b(hack|hacky| hacked)\b/gi) ?? []).length
  const hasNoHack = hackCount === 0
  const workaroundCount = (content.match(/\b(workaround|quickfix|band-aid|bandaid)\b/gi) ?? []).length
  const hasNoWorkaround = workaroundCount === 0
  const hasNoTodo = (content.match(/\b(TODO|FIXME|HACK|XXX)\b/g) ?? []).length === 0
  const hasNoCommentedOut = (content.match(/\/\/.*\bconsole\.(log|debug|warn|error)\b/g) ?? []).length === 0
  const hasNoDebugCode = (content.match(/\b(debugger|console\.(log|debug|trace))\b/g) ?? []).length === 0
  const hasNoDeadCode = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasClean = !/\bany\b/.test(content)
  const hasPristine = /\b(class|interface|type)\b/.test(content)
  const hasMaintained = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasPreserved = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasProtected = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasGuarded = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasDefended = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasShielded = /\b(import|export)\b/.test(content)
  const hasUntarnished = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut, hasNoDebugCode,
    hasNoDeadCode, hasClean, hasPristine, hasMaintained, hasPreserved,
    hasProtected, hasGuarded, hasDefended, hasShielded, hasUntarnished,
  ]

  const resistance = computeScore(positiveBooleans)
  const hasHighResistance = resistance >= 60

  let coating: ProtectingMeasure['coating'] = 'no-resistance'
  if (resistance >= 90) coating = 'stainless-steel'
  else if (resistance >= 75) coating = 'galvanized-iron'
  else if (resistance >= 60) coating = 'proper-coating'
  else if (resistance >= 40) coating = 'surface-rust'
  else if (resistance >= 20) coating = 'corroded-metal'

  return {
    resistance, coating, hasHighResistance,
    hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut, hasNoDebugCode,
    hasNoDeadCode, hasClean, hasPristine, hasMaintained, hasPreserved,
    hasProtected, hasGuarded, hasDefended, hasShielded, hasUntarnished,
    hackCount, workaroundCount,
  }
}

/** @example measureHammering('export class X { readonly y: string }') */
export function measureHammering(content: string): HammeringMeasure {
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|vague|imprecise)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasClean = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasPrecise = /\b(readonly|private|protected)\b/.test(content)
  const hasCorrect = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasSharp = /\b(import|export)\b/.test(content)
  const hasCrisp = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDefined = /\b(function|=>|return)\b/.test(content)
  const hasPolished = !/\bany\b/.test(content)
  const hasRefined = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCrafted = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasShaped = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasHoned = /\b(async|await|Promise)\b/.test(content)
  const hasTooled = /\b(try|catch|if)\b/.test(content)
  const roughCount = (content.match(/\b(rough|coarse|crude|unrefined)\b/gi) ?? []).length

  const positiveBooleans = [
    hasAccurate, hasNoApproximate, hasExact, hasClean, hasPrecise,
    hasCorrect, hasSharp, hasCrisp, hasDefined, hasPolished,
    hasRefined, hasCrafted, hasShaped, hasHoned, hasTooled,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let craft: HammeringMeasure['craft'] = 'no-precision'
  if (precision >= 90) craft = 'master-smith'
  else if (precision >= 75) craft = 'skilled-forge'
  else if (precision >= 60) craft = 'proper-hammer'
  else if (precision >= 40) craft = 'clumsy-anvil'
  else if (precision >= 20) craft = 'unshaped-ore'

  return {
    precision, craft, hasHighPrecision,
    hasAccurate, hasNoApproximate, hasExact, hasClean, hasPrecise,
    hasCorrect, hasSharp, hasCrisp, hasDefined, hasPolished,
    hasRefined, hasCrafted, hasShaped, hasHoned, hasTooled,
    approximateCount, roughCount,
  }
}

/** @example measureTempering('export class X { readonly y: string }') */
export function measureTempering(content: string): TemperingMeasure {
  const hasTested = /\b(if|return)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDynamic = /\b(async|await|Promise)\b/.test(content)
  const hasNoStatic = (content.match(/\b(hardcoded|magic-number|literal)\b/gi) ?? []).length === 0
  const hasAlive = /\b(function|=>|return)\b/.test(content)
  const deadCount = (content.match(/\b(dead|unused|obsolete|deprecated)\b/gi) ?? []).length
  const hasNoDead = deadCount === 0
  const hasEvolving = /\b(class|interface|type)\b/.test(content)
  const hasGrowing = /\b(import|export)\b/.test(content)
  const hasImproving = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasThriving = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasVibrant = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasEnergetic = /\b(readonly|private|protected)\b/.test(content)
  const hasActive = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasRenewed = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasRevitalized = /\b(try|catch)\b/.test(content)

  const positiveBooleans = [
    hasTested, hasNoUntested, hasDynamic, hasNoStatic, hasAlive,
    hasNoDead, hasEvolving, hasGrowing, hasImproving, hasThriving,
    hasVibrant, hasEnergetic, hasActive, hasRenewed, hasRevitalized,
  ]

  const vitality = computeScore(positiveBooleans)
  const hasHighVitality = vitality >= 60

  let heat: TemperingMeasure['heat'] = 'no-vitality'
  if (vitality >= 90) heat = 'white-hot'
  else if (vitality >= 75) heat = 'red-hot'
  else if (vitality >= 60) heat = 'proper-glow'
  else if (vitality >= 40) heat = 'lukewarm'
  else if (vitality >= 20) heat = 'cold-metal'

  return {
    vitality, heat, hasHighVitality,
    hasTested, hasNoUntested, hasDynamic, hasNoStatic, hasAlive,
    hasNoDead, hasEvolving, hasGrowing, hasImproving, hasThriving,
    hasVibrant, hasEnergetic, hasActive, hasRenewed, hasRevitalized,
    untestedCount, deadCount,
  }
}

/** @example measureKnowing('export class X { readonly y: string }') */
export function measureKnowing(content: string): KnowingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasStrategic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasHolistic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasProven = /\b(readonly|private|protected)\b/.test(content)
  const hasMature = /\b(import|export)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVisionary = /\b(async|await|Promise)\b/.test(content)
  const hasComprehensive = /\b(try|catch|if)\b/.test(content)
  const hasConnected = /\b(function|=>|return)\b/.test(content)
  const hasStructural = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length === 0
  const hasSeasoned = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasStructural, hasWise, hasSeasoned,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let forge: KnowingMeasure['forge'] = 'no-wisdom'
  if (wisdom >= 90) forge = 'master-forge'
  else if (wisdom >= 75) forge = 'veteran-smith'
  else if (wisdom >= 60) forge = 'proper-artisan'
  else if (wisdom >= 40) forge = 'apprentice-hammer'
  else if (wisdom >= 20) forge = 'raw-iron'

  return {
    wisdom, forge, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasStructural, hasWise, hasSeasoned,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeIronPlate(content, 'app.ts') */
export function analyzeIronPlate(content: string, filePath: string): IronPlate {
  const reinforcing = measureReinforcing(content)
  const protecting = measureProtecting(content)
  const hammering = measureHammering(content)
  const tempering = measureTempering(content)
  const knowing = measureKnowing(content)

  const structuralFortitude = reinforcing.fortitude
  const rustResistance = protecting.resistance
  const anvilPrecision = hammering.precision
  const forgeVitality = tempering.vitality
  const steelWisdom = knowing.wisdom

  const qualityScore = Math.round(
    structuralFortitude * 0.2 +
    rustResistance * 0.2 +
    anvilPrecision * 0.2 +
    forgeVitality * 0.2 +
    steelWisdom * 0.2,
  )

  const condition = classifyPlateCondition(qualityScore)

  return {
    file: filePath,
    structuralFortitude, rustResistance, anvilPrecision, forgeVitality, steelWisdom,
    reinforcing, protecting, hammering, tempering, knowing,
    condition, qualityScore,
  }
}

/** @example analyzeIronFortress(plates, 'src') */
export function analyzeIronFortress(plates: IronPlate[], dirPath: string): IronFortress {
  if (plates.length === 0) {
    return {
      directory: dirPath, plates: [],
      avgFortitude: 0, avgPrecision: 0, avgWisdom: 0,
      ironMasterpieceCount: 0, voidCount: 0,
      fortressType: 'no-fortress', condition: 'void',
    }
  }

  const avgFortitude = Math.round(plates.reduce((s, p) => s + p.structuralFortitude, 0) / plates.length)
  const avgPrecision = Math.round(plates.reduce((s, p) => s + p.anvilPrecision, 0) / plates.length)
  const avgWisdom = Math.round(plates.reduce((s, p) => s + p.steelWisdom, 0) / plates.length)
  const ironMasterpieceCount = plates.filter((p) => p.condition === 'iron-masterpiece').length
  const voidCount = plates.filter((p) => p.condition === 'void').length
  const fortressType = classifyFortressType(plates)
  const avgQuality = Math.round(plates.reduce((s, p) => s + p.qualityScore, 0) / plates.length)
  const condition = classifyFortressCondition(avgQuality)

  return {
    directory: dirPath, plates,
    avgFortitude, avgPrecision, avgWisdom,
    ironMasterpieceCount, voidCount,
    fortressType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildIronBastionResult(['a.ts'], [content]) */
export async function buildIronBastionResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<IronBastionResult> {
  const plates: IronPlate[] = files.map((file, i) =>
    analyzeIronPlate(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, IronPlate[]>()
  for (const plate of plates) {
    const dir = plate.file.includes('/')
      ? plate.file.substring(0, plate.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(plate)
    } else {
      dirMap.set(dir, [plate])
    }
  }

  const fortresses: IronFortress[] = Array.from(dirMap.entries()).map(([dir, dirPlates]) =>
    analyzeIronFortress(dirPlates, dir),
  )

  const avgStructuralFortitude = plates.length > 0
    ? Math.round(plates.reduce((s, p) => s + p.structuralFortitude, 0) / plates.length) : 0
  const avgRustResistance = plates.length > 0
    ? Math.round(plates.reduce((s, p) => s + p.rustResistance, 0) / plates.length) : 0
  const avgAnvilPrecision = plates.length > 0
    ? Math.round(plates.reduce((s, p) => s + p.anvilPrecision, 0) / plates.length) : 0
  const avgForgeVitality = plates.length > 0
    ? Math.round(plates.reduce((s, p) => s + p.forgeVitality, 0) / plates.length) : 0
  const avgSteelWisdom = plates.length > 0
    ? Math.round(plates.reduce((s, p) => s + p.steelWisdom, 0) / plates.length) : 0

  const overallStrength = plates.length > 0
    ? Math.round(plates.reduce((s, p) => s + p.qualityScore, 0) / plates.length) : 0
  const isIron = overallStrength >= 60

  const foundry: IronBastionResult['foundry'] = {
    avgFortitude: avgStructuralFortitude, avgPrecision: avgAnvilPrecision, avgWisdom: avgSteelWisdom,
    isIron, overallStrength,
  }

  const ironMasterpieceCount = plates.filter((p) => p.condition === 'iron-masterpiece').length
  const temperedSteelCount = plates.filter((p) => p.condition === 'tempered-steel').length
  const properIronCount = plates.filter((p) => p.condition === 'proper-iron').length
  const rustedMetalCount = plates.filter((p) => p.condition === 'rusted-metal').length
  const scrapIronCount = plates.filter((p) => p.condition === 'scrap-iron').length
  const voidCount = plates.filter((p) => p.condition === 'void').length

  const hasHighFortitudeCount = plates.filter((p) => p.reinforcing.hasHighFortitude).length
  const hasHighResistanceCount = plates.filter((p) => p.protecting.hasHighResistance).length
  const hasHighPrecisionCount = plates.filter((p) => p.hammering.hasHighPrecision).length
  const hasHighVitalityCount = plates.filter((p) => p.tempering.hasHighVitality).length
  const hasHighWisdomCount = plates.filter((p) => p.knowing.hasHighWisdom).length

  const smithGrade = classifySmithGrade(overallStrength)

  const bestPlate = plates.length > 0
    ? plates.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file : ''
  const strongest = plates.length > 0
    ? plates.reduce((best, p) => (p.structuralFortitude > best.structuralFortitude ? p : best)).file : ''
  const mostResistant = plates.length > 0
    ? plates.reduce((best, p) => (p.rustResistance > best.rustResistance ? p : best)).file : ''
  const mostPrecise = plates.length > 0
    ? plates.reduce((best, p) => (p.anvilPrecision > best.anvilPrecision ? p : best)).file : ''
  const mostVital = plates.length > 0
    ? plates.reduce((best, p) => (p.forgeVitality > best.forgeVitality ? p : best)).file : ''
  const wisest = plates.length > 0
    ? plates.reduce((best, p) => (p.steelWisdom > best.steelWisdom ? p : best)).file : ''

  const stats: IronBastionResult['stats'] = {
    totalFiles: files.length, totalFortresses: fortresses.length,
    avgStructuralFortitude, avgRustResistance, avgAnvilPrecision, avgForgeVitality, avgSteelWisdom,
    ironMasterpieceCount, temperedSteelCount, properIronCount, rustedMetalCount, scrapIronCount, voidCount,
    hasHighFortitudeCount, hasHighResistanceCount, hasHighPrecisionCount, hasHighVitalityCount, hasHighWisdomCount,
    overallStrength, smithGrade,
    bestPlate, strongest, mostResistant, mostPrecise, mostVital, wisest,
  }

  const recommendations = generateRecommendations(plates, fortresses, foundry, stats)

  return {
    plates, fortresses, foundry, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(plates, fortresses, foundry, stats) */
export function generateRecommendations(
  plates: IronPlate[],
  fortresses: IronFortress[],
  _foundry: IronBastionResult['foundry'],
  stats: IronBastionResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgStructuralFortitude >= 90 &&
    stats.avgRustResistance >= 90 &&
    stats.avgAnvilPrecision >= 90 &&
    stats.avgForgeVitality >= 90 &&
    stats.avgSteelWisdom >= 90
  ) {
    recs.push(
      'Your iron bastion stands impregnable! Structural fortitude is i-beam-grade, rust resistance is stainless-steel, anvil precision is master-smith level, forge vitality blazes white-hot, and steel wisdom comes from the master-forge!',
    )
    return recs
  }

  if (stats.avgStructuralFortitude < 60) {
    recs.push(
      'Reinforce structural fortitude — the bastion needs load-bearing walls; add strong types, solid interfaces, and robust architecture'
    )
  }

  if (stats.avgRustResistance < 60) {
    recs.push(
      'Improve rust resistance — iron must be protected from corrosion; remove hacks, eliminate workarounds, and preserve code integrity'
    )
  }

  if (stats.avgAnvilPrecision < 60) {
    recs.push(
      'Sharpen anvil precision — every strike of the hammer must be exact; tighten types, eliminate approximations, and hone definitions'
    )
  }

  if (stats.avgForgeVitality < 60) {
    recs.push(
      'Stoke forge vitality — the fire must burn hot to temper steel; add dynamic patterns, eliminate dead code, and keep the forge alive'
    )
  }

  if (stats.avgSteelWisdom < 60) {
    recs.push(
      'Temper steel wisdom — the strongest steel is forged with knowledge; build with principled architecture, proven patterns, and seasoned design'
    )
  }

  if (stats.overallStrength < 40) {
    recs.push(
      'The bastion is crumbling — scrap iron and rusted metal outnumber the steel, and the walls cannot hold'
    )
  }

  const voidPlates = plates.filter((p) => p.condition === 'void')
  if (voidPlates.length > 0 && voidPlates.length <= 5) {
    recs.push(`Reforge these scrap plates: ${voidPlates.map((p) => p.file).join(', ')}`)
  } else if (voidPlates.length > 5) {
    recs.push(`Reforge ${voidPlates.length} scrap plates before the bastion collapses entirely`)
  }

  const poorFortresses = fortresses.filter((f) => f.condition === 'void' || f.condition === 'wooden-fence')
  if (poorFortresses.length === fortresses.length && fortresses.length > 0) {
    recs.push('All fortresses are wooden fences — the iron bastion needs impregnable-fortress quality plates throughout')
  }

  if (recs.length === 0) {
    recs.push('Your iron bastion stands strong — every plate embodies structural fortitude, rust resistance, anvil precision, forge vitality, and steel wisdom')
  }

  return recs
}
