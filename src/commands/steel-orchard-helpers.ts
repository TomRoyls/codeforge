// ─── Interfaces ──────────────────────────────────────────

export interface GrowingMeasure {
  strength: number
  vitality: 'ancient-ironwood' | 'steel-oak' | 'proper-iron-tree' | 'tin-sapling' | 'foil-leaf' | 'no-strength'
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasOrganized: boolean
  hasProductive: boolean
  hasIntentional: boolean
  hasCrafted: boolean
  hasShaped: boolean
  hasDisciplined: boolean
  hasFocused: boolean
  hasPurposeful: boolean
  hasStrong: boolean
  hasResilient: boolean
  hasVigorous: boolean
  chaoticCount: number
  monolithicCount: number
}

export interface ResistingMeasure {
  resistance: number
  shield: 'stainless-steel' | 'galvanized-iron' | 'proper-coating' | 'rusted-surface' | 'corroded-lump' | 'no-resistance'
  hasHighResistance: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasConsistent: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasMaintained: boolean
  hasEnduring: boolean
  hasPreserved: boolean
  hasProtected: boolean
  hasHardened: boolean
  hasFortified: boolean
  hasDurable: boolean
  hasTimeless: boolean
  volatileCount: number
  untestedCount: number
}

export interface FloweringMeasure {
  precision: number
  blossom: 'cherry-precision' | 'apple-exactness' | 'proper-bloom' | 'wild-spray' | 'scattered-petals' | 'no-precision'
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasTypeSafe: boolean
  hasExact: boolean
  hasClean: boolean
  hasPrecise: boolean
  hasCorrect: boolean
  hasFaithful: boolean
  hasTimely: boolean
  hasMeasured: boolean
  hasCalculated: boolean
  hasDisciplined: boolean
  hasControlled: boolean
  hasDeliberate: boolean
  hasSurgical: boolean
  approximateCount: number
  unsafeCount: number
}

export interface RootingMeasure {
  depth: number
  root: 'deep-taproot' | 'strong-foundation' | 'proper-roots' | 'shallow-spread' | 'surface-only' | 'no-depth'
  hasHighDepth: boolean
  hasConnected: boolean
  hasNoIsolated: boolean
  hasExported: boolean
  hasNoHidden: boolean
  hasDocumented: boolean
  hasInterfaced: boolean
  hasAbstracted: boolean
  hasGrounded: boolean
  hasNetworked: boolean
  hasIntegrated: boolean
  hasLinked: boolean
  hasInterwoven: boolean
  hasFoundational: boolean
  hasSolid: boolean
  hasDeep: boolean
  isolatedCount: number
  hiddenCount: number
}

export interface ForgingMeasure {
  vitality: number
  fire: 'white-hot-forge' | 'red-hot-anvil' | 'proper-fire' | 'warm-embers' | 'cold-hearth' | 'no-vitality'
  hasHighVitality: boolean
  hasCreative: boolean
  hasNoStagnant: boolean
  hasEvolving: boolean
  hasNoStatic: boolean
  hasPrincipled: boolean
  hasNoHacked: boolean
  hasInnovative: boolean
  hasAdaptive: boolean
  hasEnergetic: boolean
  hasDynamic: boolean
  hasAlive: boolean
  hasThriving: boolean
  hasGrowing: boolean
  hasVibrant: boolean
  hasPulsing: boolean
  stagnantCount: number
  hackedCount: number
}

export type BlossomCondition =
  | 'iron-masterpiece'
  | 'steel-blossom'
  | 'proper-alloy'
  | 'rusted-branch'
  | 'dead-stump'
  | 'void'

export interface IronBlossom {
  file: string
  strengthThroughNature: number
  rustResistance: number
  bloomPrecision: number
  rootDepth: number
  forgeVitality: number
  growing: GrowingMeasure
  resisting: ResistingMeasure
  flowering: FloweringMeasure
  rooting: RootingMeasure
  forging: ForgingMeasure
  condition: BlossomCondition
  qualityScore: number
}

export type GroveType =
  | 'ancient-grove'
  | 'iron-orchard'
  | 'proper-plantation'
  | 'small-garden'
  | 'barren-field'
  | 'void'

export type GroveCondition =
  | 'steel-forest'
  | 'iron-vineyard'
  | 'proper-orchard'
  | 'weed-patch'
  | 'desert'
  | 'void'

export interface IronGrove {
  directory: string
  blossoms: IronBlossom[]
  avgStrength: number
  avgPrecision: number
  avgVitality: number
  ironMasterpieceCount: number
  voidCount: number
  groveType: GroveType
  condition: GroveCondition
}

export type BlacksmithGrade = 'master-blacksmith' | 'iron-forger' | 'proper-smith' | 'apprentice' | 'novice' | 'bellows-boy'

export interface IronOrchardResult {
  blossoms: IronBlossom[]
  groves: IronGrove[]
  harvest: {
    avgStrength: number
    avgPrecision: number
    avgVitality: number
    isIron: boolean
    overallYield: number
  }
  stats: {
    totalFiles: number
    totalGroves: number
    avgStrengthThroughNature: number
    avgRustResistance: number
    avgBloomPrecision: number
    avgRootDepth: number
    avgForgeVitality: number
    ironMasterpieceCount: number
    steelBlossomCount: number
    properAlloyCount: number
    rustedBranchCount: number
    deadStumpCount: number
    voidCount: number
    hasHighStrengthCount: number
    hasHighResistanceCount: number
    hasHighPrecisionCount: number
    hasHighDepthCount: number
    hasHighVitalityCount: number
    overallYield: number
    blacksmithGrade: BlacksmithGrade
    bestBlossom: string
    strongest: string
    mostResistant: string
    mostPrecise: string
    deepest: string
    mostVital: string
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

/** @example classifyBlossomCondition(90) */
export function classifyBlossomCondition(score: number): BlossomCondition {
  if (score >= 90) return 'iron-masterpiece'
  if (score >= 75) return 'steel-blossom'
  if (score >= 60) return 'proper-alloy'
  if (score >= 40) return 'rusted-branch'
  if (score >= 20) return 'dead-stump'
  return 'void'
}

/** @example classifyGroveType(blossoms) */
export function classifyGroveType(blossoms: IronBlossom[]): GroveType {
  if (blossoms.length === 0) return 'void'
  const avg = blossoms.reduce((s, b) => s + b.qualityScore, 0) / blossoms.length
  if (avg >= 85) return 'ancient-grove'
  if (avg >= 70) return 'iron-orchard'
  if (avg >= 55) return 'proper-plantation'
  if (avg >= 35) return 'small-garden'
  return 'barren-field'
}

/** @example classifyGroveCondition(85) */
export function classifyGroveCondition(score: number): GroveCondition {
  if (score >= 85) return 'steel-forest'
  if (score >= 70) return 'iron-vineyard'
  if (score >= 55) return 'proper-orchard'
  if (score >= 35) return 'weed-patch'
  if (score >= 15) return 'desert'
  return 'void'
}

/** @example classifyBlacksmithGrade(80) */
export function classifyBlacksmithGrade(avgYield: number): BlacksmithGrade {
  if (avgYield >= 80) return 'master-blacksmith'
  if (avgYield >= 65) return 'iron-forger'
  if (avgYield >= 50) return 'proper-smith'
  if (avgYield >= 35) return 'apprentice'
  if (avgYield >= 20) return 'novice'
  return 'bellows-boy'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureGrowing('class X { readonly y: string }') */
export function measureGrowing(content: string): GrowingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|disorganized|tangled)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasOrganized = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasProductive = /\b(function|=>|return)\b/.test(content)
  const hasIntentional = /\b(const|readonly)\b/.test(content)
  const hasCrafted = !/\bany\b/.test(content)
  const hasShaped = /\b(readonly|private|protected)\b/.test(content)
  const hasDisciplined = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasFocused = /\b(async|await|Promise)\b/.test(content)
  const hasPurposeful = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasStrong = /\b(try|catch|if)\b/.test(content)
  const hasResilient = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasVigorous = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasModular, hasNoMonolithic, hasOrganized,
    hasProductive, hasIntentional, hasCrafted, hasShaped, hasDisciplined,
    hasFocused, hasPurposeful, hasStrong, hasResilient, hasVigorous,
  ]

  const strength = computeScore(positiveBooleans)
  const hasHighStrength = strength >= 60

  let vitality: GrowingMeasure['vitality'] = 'no-strength'
  if (strength >= 90) vitality = 'ancient-ironwood'
  else if (strength >= 75) vitality = 'steel-oak'
  else if (strength >= 60) vitality = 'proper-iron-tree'
  else if (strength >= 40) vitality = 'tin-sapling'
  else if (strength >= 20) vitality = 'foil-leaf'

  return {
    strength, vitality, hasHighStrength,
    hasWellStructured, hasNoChaotic, hasModular, hasNoMonolithic, hasOrganized,
    hasProductive, hasIntentional, hasCrafted, hasShaped, hasDisciplined,
    hasFocused, hasPurposeful, hasStrong, hasResilient, hasVigorous,
    chaoticCount, monolithicCount,
  }
}

/** @example measureResisting('try { x } catch { y }') */
export function measureResisting(content: string): ResistingMeasure {
  const hasStable = /\b(const|readonly)\b/.test(content)
  const volatileCount = (content.match(/\b(volatile|unstable|flaky|erratic)\b/gi) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasConsistent = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const hasNoUnsafe = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasMaintained = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasPreserved = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasProtected = /\b(class|interface|type)\b/.test(content)
  const hasHardened = /\b(import|export)\b/.test(content)
  const hasFortified = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasDurable = /\b(async|await|Promise)\b/.test(content)
  const hasTimeless = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasStable, hasNoVolatile, hasConsistent, hasTested, hasNoUntested,
    hasTypeSafe, hasNoUnsafe, hasMaintained, hasEnduring, hasPreserved,
    hasProtected, hasHardened, hasFortified, hasDurable, hasTimeless,
  ]

  const resistance = computeScore(positiveBooleans)
  const hasHighResistance = resistance >= 60

  let shield: ResistingMeasure['shield'] = 'no-resistance'
  if (resistance >= 90) shield = 'stainless-steel'
  else if (resistance >= 75) shield = 'galvanized-iron'
  else if (resistance >= 60) shield = 'proper-coating'
  else if (resistance >= 40) shield = 'rusted-surface'
  else if (resistance >= 20) shield = 'corroded-lump'

  return {
    resistance, shield, hasHighResistance,
    hasStable, hasNoVolatile, hasConsistent, hasTested, hasNoUntested,
    hasTypeSafe, hasNoUnsafe, hasMaintained, hasEnduring, hasPreserved,
    hasProtected, hasHardened, hasFortified, hasDurable, hasTimeless,
    volatileCount, untestedCount,
  }
}

/** @example measureFlowering('export class X { readonly y: string }') */
export function measureFlowering(content: string): FloweringMeasure {
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|vague|fuzzy)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const hasExact = /\b(const|readonly)\b/.test(content)
  const hasClean = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasPrecise = /\b(class|interface|type)\b/.test(content)
  const hasCorrect = /\b(readonly|private|protected)\b/.test(content)
  const hasFaithful = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasTimely = /\b(async|await|Promise)\b/.test(content)
  const hasMeasured = /\b(import|export)\b/.test(content)
  const hasCalculated = /\b(function|=>|return)\b/.test(content)
  const hasDisciplined = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasControlled = /\b(try|catch|if)\b/.test(content)
  const hasDeliberate = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const unsafeCount = (content.match(/\b(unsafe|risky|hazardous)\b/gi) ?? []).length
  const hasSurgical = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasAccurate, hasNoApproximate, hasTypeSafe, hasExact, hasClean,
    hasPrecise, hasCorrect, hasFaithful, hasTimely, hasMeasured,
    hasCalculated, hasDisciplined, hasControlled, hasDeliberate, hasSurgical,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let blossom: FloweringMeasure['blossom'] = 'no-precision'
  if (precision >= 90) blossom = 'cherry-precision'
  else if (precision >= 75) blossom = 'apple-exactness'
  else if (precision >= 60) blossom = 'proper-bloom'
  else if (precision >= 40) blossom = 'wild-spray'
  else if (precision >= 20) blossom = 'scattered-petals'

  return {
    precision, blossom, hasHighPrecision,
    hasAccurate, hasNoApproximate, hasTypeSafe, hasExact, hasClean,
    hasPrecise, hasCorrect, hasFaithful, hasTimely, hasMeasured,
    hasCalculated, hasDisciplined, hasControlled, hasDeliberate, hasSurgical,
    approximateCount, unsafeCount,
  }
}

/** @example measureRooting('export class X { readonly y: string }') */
export function measureRooting(content: string): RootingMeasure {
  const hasConnected = /\b(import|export)\b/.test(content)
  const isolatedCount = (content.match(/\b(isolated|standalone|disconnected|orphan)\b/gi) ?? []).length
  const hasNoIsolated = isolatedCount === 0
  const hasExported = /\b(class|interface|type)\b/.test(content)
  const hiddenCount = (content.match(/\b(hidden|private-field|obscured|concealed)\b/gi) ?? []).length
  const hasNoHidden = hiddenCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInterfaced = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasAbstracted = /\b(abstract|extends|implements)\b/.test(content)
  const hasGrounded = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasNetworked = /\b(function|=>|return)\b/.test(content)
  const hasIntegrated = /\b(readonly|private|protected)\b/.test(content)
  const hasLinked = /\b(async|await|Promise)\b/.test(content)
  const hasInterwoven = !/\bany\b/.test(content)
  const hasFoundational = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasSolid = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasDeep = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasConnected, hasNoIsolated, hasExported, hasNoHidden, hasDocumented,
    hasInterfaced, hasAbstracted, hasGrounded, hasNetworked, hasIntegrated,
    hasLinked, hasInterwoven, hasFoundational, hasSolid, hasDeep,
  ]

  const depth = computeScore(positiveBooleans)
  const hasHighDepth = depth >= 60

  let root: RootingMeasure['root'] = 'no-depth'
  if (depth >= 90) root = 'deep-taproot'
  else if (depth >= 75) root = 'strong-foundation'
  else if (depth >= 60) root = 'proper-roots'
  else if (depth >= 40) root = 'shallow-spread'
  else if (depth >= 20) root = 'surface-only'

  return {
    depth, root, hasHighDepth,
    hasConnected, hasNoIsolated, hasExported, hasNoHidden, hasDocumented,
    hasInterfaced, hasAbstracted, hasGrounded, hasNetworked, hasIntegrated,
    hasLinked, hasInterwoven, hasFoundational, hasSolid, hasDeep,
    isolatedCount, hiddenCount,
  }
}

/** @example measureForging('export class X { async method(): Promise<T> }') */
export function measureForging(content: string): ForgingMeasure {
  const hasCreative = /\b(class|interface|type)\b/.test(content)
  const stagnantCount = (content.match(/\b(stagnant|static|rigid|frozen|dead)\b/gi) ?? []).length
  const hasNoStagnant = stagnantCount === 0
  const hasEvolving = /\b(async|await|Promise)\b/.test(content)
  const hasNoStatic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasInnovative = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasAdaptive = /\b(readonly|private|protected)\b/.test(content)
  const hasEnergetic = /\b(import|export)\b/.test(content)
  const hasDynamic = /\b(function|=>|return)\b/.test(content)
  const hasAlive = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasThriving = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasGrowing = /\b(try|catch|if)\b/.test(content)
  const hasVibrant = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasPulsing = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasCreative, hasNoStagnant, hasEvolving, hasNoStatic, hasPrincipled,
    hasNoHacked, hasInnovative, hasAdaptive, hasEnergetic, hasDynamic,
    hasAlive, hasThriving, hasGrowing, hasVibrant, hasPulsing,
  ]

  const vitality = computeScore(positiveBooleans)
  const hasHighVitality = vitality >= 60

  let fire: ForgingMeasure['fire'] = 'no-vitality'
  if (vitality >= 90) fire = 'white-hot-forge'
  else if (vitality >= 75) fire = 'red-hot-anvil'
  else if (vitality >= 60) fire = 'proper-fire'
  else if (vitality >= 40) fire = 'warm-embers'
  else if (vitality >= 20) fire = 'cold-hearth'

  return {
    vitality, fire, hasHighVitality,
    hasCreative, hasNoStagnant, hasEvolving, hasNoStatic, hasPrincipled,
    hasNoHacked, hasInnovative, hasAdaptive, hasEnergetic, hasDynamic,
    hasAlive, hasThriving, hasGrowing, hasVibrant, hasPulsing,
    stagnantCount, hackedCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeIronBlossom(content, 'app.ts') */
export function analyzeIronBlossom(content: string, filePath: string): IronBlossom {
  const growing = measureGrowing(content)
  const resisting = measureResisting(content)
  const flowering = measureFlowering(content)
  const rooting = measureRooting(content)
  const forging = measureForging(content)

  const strengthThroughNature = growing.strength
  const rustResistance = resisting.resistance
  const bloomPrecision = flowering.precision
  const rootDepth = rooting.depth
  const forgeVitality = forging.vitality

  const qualityScore = Math.round(
    strengthThroughNature * 0.2 +
    rustResistance * 0.2 +
    bloomPrecision * 0.2 +
    rootDepth * 0.2 +
    forgeVitality * 0.2,
  )

  const condition = classifyBlossomCondition(qualityScore)

  return {
    file: filePath,
    strengthThroughNature, rustResistance, bloomPrecision, rootDepth, forgeVitality,
    growing, resisting, flowering, rooting, forging,
    condition, qualityScore,
  }
}

/** @example analyzeIronGrove(blossoms, 'src') */
export function analyzeIronGrove(blossoms: IronBlossom[], dirPath: string): IronGrove {
  if (blossoms.length === 0) {
    return {
      directory: dirPath, blossoms: [],
      avgStrength: 0, avgPrecision: 0, avgVitality: 0,
      ironMasterpieceCount: 0, voidCount: 0,
      groveType: 'void', condition: 'void',
    }
  }

  const avgStrength = Math.round(blossoms.reduce((s, b) => s + b.strengthThroughNature, 0) / blossoms.length)
  const avgPrecision = Math.round(blossoms.reduce((s, b) => s + b.bloomPrecision, 0) / blossoms.length)
  const avgVitality = Math.round(blossoms.reduce((s, b) => s + b.forgeVitality, 0) / blossoms.length)
  const ironMasterpieceCount = blossoms.filter((b) => b.condition === 'iron-masterpiece').length
  const voidCount = blossoms.filter((b) => b.condition === 'void').length
  const groveType = classifyGroveType(blossoms)
  const avgQuality = Math.round(blossoms.reduce((s, b) => s + b.qualityScore, 0) / blossoms.length)
  const condition = classifyGroveCondition(avgQuality)

  return {
    directory: dirPath, blossoms,
    avgStrength, avgPrecision, avgVitality,
    ironMasterpieceCount, voidCount,
    groveType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildIronOrchardResult(['a.ts'], [content]) */
export async function buildIronOrchardResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<IronOrchardResult> {
  const blossoms: IronBlossom[] = files.map((file, i) =>
    analyzeIronBlossom(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, IronBlossom[]>()
  for (const blossom of blossoms) {
    const dir = blossom.file.includes('/')
      ? blossom.file.substring(0, blossom.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(blossom)
    } else {
      dirMap.set(dir, [blossom])
    }
  }

  const groves: IronGrove[] = Array.from(dirMap.entries()).map(([dir, dirBlossoms]) =>
    analyzeIronGrove(dirBlossoms, dir),
  )

  const avgStrengthThroughNature = blossoms.length > 0
    ? Math.round(blossoms.reduce((s, b) => s + b.strengthThroughNature, 0) / blossoms.length) : 0
  const avgRustResistance = blossoms.length > 0
    ? Math.round(blossoms.reduce((s, b) => s + b.rustResistance, 0) / blossoms.length) : 0
  const avgBloomPrecision = blossoms.length > 0
    ? Math.round(blossoms.reduce((s, b) => s + b.bloomPrecision, 0) / blossoms.length) : 0
  const avgRootDepth = blossoms.length > 0
    ? Math.round(blossoms.reduce((s, b) => s + b.rootDepth, 0) / blossoms.length) : 0
  const avgForgeVitality = blossoms.length > 0
    ? Math.round(blossoms.reduce((s, b) => s + b.forgeVitality, 0) / blossoms.length) : 0

  const overallYield = blossoms.length > 0
    ? Math.round(blossoms.reduce((s, b) => s + b.qualityScore, 0) / blossoms.length) : 0
  const isIron = overallYield >= 60

  const harvest = { avgStrength: avgStrengthThroughNature, avgPrecision: avgBloomPrecision, avgVitality: avgForgeVitality, isIron, overallYield }

  const ironMasterpieceCount = blossoms.filter((b) => b.condition === 'iron-masterpiece').length
  const steelBlossomCount = blossoms.filter((b) => b.condition === 'steel-blossom').length
  const properAlloyCount = blossoms.filter((b) => b.condition === 'proper-alloy').length
  const rustedBranchCount = blossoms.filter((b) => b.condition === 'rusted-branch').length
  const deadStumpCount = blossoms.filter((b) => b.condition === 'dead-stump').length
  const voidCount = blossoms.filter((b) => b.condition === 'void').length

  const hasHighStrengthCount = blossoms.filter((b) => b.growing.hasHighStrength).length
  const hasHighResistanceCount = blossoms.filter((b) => b.resisting.hasHighResistance).length
  const hasHighPrecisionCount = blossoms.filter((b) => b.flowering.hasHighPrecision).length
  const hasHighDepthCount = blossoms.filter((b) => b.rooting.hasHighDepth).length
  const hasHighVitalityCount = blossoms.filter((b) => b.forging.hasHighVitality).length

  const blacksmithGrade = classifyBlacksmithGrade(overallYield)

  const bestBlossom = blossoms.length > 0
    ? blossoms.reduce((best, b) => (b.qualityScore > best.qualityScore ? b : best)).file : ''
  const strongest = blossoms.length > 0
    ? blossoms.reduce((best, b) => (b.strengthThroughNature > best.strengthThroughNature ? b : best)).file : ''
  const mostResistant = blossoms.length > 0
    ? blossoms.reduce((best, b) => (b.rustResistance > best.rustResistance ? b : best)).file : ''
  const mostPrecise = blossoms.length > 0
    ? blossoms.reduce((best, b) => (b.bloomPrecision > best.bloomPrecision ? b : best)).file : ''
  const deepest = blossoms.length > 0
    ? blossoms.reduce((best, b) => (b.rootDepth > best.rootDepth ? b : best)).file : ''
  const mostVital = blossoms.length > 0
    ? blossoms.reduce((best, b) => (b.forgeVitality > best.forgeVitality ? b : best)).file : ''

  const stats: IronOrchardResult['stats'] = {
    totalFiles: files.length, totalGroves: groves.length,
    avgStrengthThroughNature, avgRustResistance, avgBloomPrecision, avgRootDepth, avgForgeVitality,
    ironMasterpieceCount, steelBlossomCount, properAlloyCount, rustedBranchCount, deadStumpCount, voidCount,
    hasHighStrengthCount, hasHighResistanceCount, hasHighPrecisionCount, hasHighDepthCount, hasHighVitalityCount,
    overallYield, blacksmithGrade,
    bestBlossom, strongest, mostResistant, mostPrecise, deepest, mostVital,
  }

  const recommendations = generateRecommendations(blossoms, groves, harvest, stats)

  return { blossoms, groves, harvest, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(blossoms, groves, harvest, stats) */
export function generateRecommendations(
  blossoms: IronBlossom[],
  groves: IronGrove[],
  _harvest: IronOrchardResult['harvest'],
  stats: IronOrchardResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgStrengthThroughNature >= 90 &&
    stats.avgRustResistance >= 90 &&
    stats.avgBloomPrecision >= 90 &&
    stats.avgRootDepth >= 90 &&
    stats.avgForgeVitality >= 90
  ) {
    recs.push(
      'Your iron orchard is a masterpiece of living steel! Every blossom is forged with purpose, the rust cannot touch it, blooms are precise, roots run deep through bedrock, and the forge burns with creative vitality!',
    )
    return recs
  }

  if (stats.avgStrengthThroughNature < 60) {
    recs.push(
      'Strengthen the ironwood — your code needs more structured growth, modular design, and disciplined crafting to grow with the power of ancient ironwood',
    )
  }

  if (stats.avgRustResistance < 60) {
    recs.push(
      'Improve rust resistance — the iron orchard must be immune to decay; your code needs stable types, tested paths, and hardened abstractions',
    )
  }

  if (stats.avgBloomPrecision < 60) {
    recs.push(
      'Refine bloom precision — each blossom should be surgically precise; your code needs exact types, clean patterns, and deliberate structure',
    )
  }

  if (stats.avgRootDepth < 60) {
    recs.push(
      'Deepen the root system — iron trees need deep taproots; your code needs strong connections, documented interfaces, and integrated abstractions',
    )
  }

  if (stats.avgForgeVitality < 60) {
    recs.push(
      'Ignite forge vitality — the orchard needs creative fire; your code should be evolving, principled, innovative, and alive with dynamic energy',
    )
  }

  if (stats.overallYield < 40) {
    recs.push(
      'The iron orchard has withered — dead stumps and rusted branches remain where living steel once grew',
    )
  }

  const voidBlossoms = blossoms.filter((b) => b.condition === 'void')
  if (voidBlossoms.length > 0 && voidBlossoms.length <= 5) {
    recs.push(`Uproot these dead stumps: ${voidBlossoms.map((b) => b.file).join(', ')}`)
  } else if (voidBlossoms.length > 5) {
    recs.push(`Uproot ${voidBlossoms.length} dead stumps before the entire orchard collapses`)
  }

  const poorGroves = groves.filter((g) => g.condition === 'void' || g.condition === 'desert')
  if (poorGroves.length === groves.length && groves.length > 0) {
    recs.push('All groves have turned to desert — the iron orchard needs complete replanting from the strongest seeds')
  }

  if (recs.length === 0) {
    recs.push('Your iron orchard thrives beautifully — each blossom combines strength, resistance, precision, depth, and vitality in perfect harmony')
  }

  return recs
}
