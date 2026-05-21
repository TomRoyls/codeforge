// ─── Types ──────────────────────────────────────────────────────────────────

export type TransmutationElement = 'earth' | 'water' | 'air' | 'fire' | 'aether' | 'void'
export type CrucibleMaterial = 'clay' | 'bronze' | 'iron' | 'steel' | 'platinum' | 'crystal'
export type ProcessStage = 'calcination' | 'dissolution' | 'separation' | 'conjunction' | 'fermentation' | 'distillation' | 'coagulation'
export type SampleCondition = 'philosopher-stone' | 'pure-gold' | 'refined-metal' | 'base-metal' | 'raw-ore' | 'slag-heap'
export type WorkshopType = 'grand-laboratory' | 'alchemist-tower' | 'guild-workshop' | 'kitchen-lab' | 'shed' | 'ruins'
export type WorkshopCondition = 'master-alchemist' | 'journeyman' | 'apprentice' | 'dabbler' | 'charlatan' | 'explosion-site'
export type AlchemistGrade = 'grand-master' | 'master' | 'adept' | 'journeyman' | 'novice' | 'apprentice'

export interface TransmutationMeasure {
  quality: number
  element: TransmutationElement
  isBaseMetal: boolean
  isNobleMetal: boolean
  hasCompleteTransmutation: boolean
  hasPartialTransmutation: boolean
  hasFailedTransmutation: boolean
  hasImpurities: boolean
  hasResidue: boolean
  hasByproducts: boolean
  impurityCount: number
  byproductCount: number
}

export interface CrucibleMeasure {
  purity: number
  material: CrucibleMaterial
  isPure: boolean
  hasSideEffects: boolean
  hasMutations: boolean
  hasExternalDependencies: boolean
  hasImpurities: boolean
  hasSlag: boolean
  hasCracks: boolean
  sideEffectCount: number
  mutationCount: number
}

export interface StoneMeasure {
  quality: number
  hasMagnumOpus: boolean
  hasNigredo: boolean
  hasAlbedo: boolean
  hasCitrinitas: boolean
  hasRubedo: boolean
  hasElixirOfLife: boolean
  hasUniversalSolvent: boolean
  phaseCount: number
}

export interface ElementsMeasure {
  balance: number
  earth: number
  water: number
  air: number
  fire: number
  aether: number
  isBalanced: boolean
  hasExcess: string[]
  hasDeficiency: string[]
}

export interface ProcessMeasure {
  quality: number
  stage: ProcessStage
  hasProperTemperature: boolean
  hasControlledAtmosphere: boolean
  hasCatalyst: boolean
  hasReagent: boolean
  hasSolvent: boolean
  hasPrecipitate: boolean
  hasFiltration: boolean
  catalystCount: number
}

export interface YieldMeasure {
  gold: number
  isPureGold: boolean
  hasGold: boolean
  hasSilver: boolean
  hasCopper: boolean
  hasLead: boolean
  hasDross: boolean
  goldPercent: number
  drossPercent: number
}

export interface AlchemicalSample {
  file: string
  transmutationQuality: number
  cruciblePurity: number
  philosopherStone: number
  elementalBalance: number
  alchemicalProcess: number
  goldYield: number
  transmutation: TransmutationMeasure
  crucible: CrucibleMeasure
  stone: StoneMeasure
  elements: ElementsMeasure
  process: ProcessMeasure
  yield: YieldMeasure
  condition: SampleCondition
  qualityScore: number
}

export interface AlchemicalWorkshop {
  directory: string
  samples: AlchemicalSample[]
  avgTransmutation: number
  avgPurity: number
  avgGoldYield: number
  philosopherStoneCount: number
  slagHeapCount: number
  pureGoldCount: number
  balancedElementsCount: number
  workshopType: WorkshopType
  condition: WorkshopCondition
}

export interface AlchemistCrucibleStats {
  totalFiles: number
  totalWorkshops: number
  avgTransmutationQuality: number
  avgCruciblePurity: number
  avgPhilosopherStone: number
  avgElementalBalance: number
  avgAlchemicalProcess: number
  avgGoldYield: number
  philosopherStoneCount: number
  pureGoldCount: number
  refinedMetalCount: number
  baseMetalCount: number
  rawOreCount: number
  slagHeapCount: number
  isPureCount: number
  hasSideEffectsCount: number
  hasMutationsCount: number
  hasMagnumOpusCount: number
  isBalancedCount: number
  hasCatalystCount: number
  hasFiltrationCount: number
  hasGoldCount: number
  hasDrossCount: number
  overallPurity: number
  alchemistGrade: AlchemistGrade
  bestSample: string
  purestCrucible: string
  bestAlgorithm: string
  mostBalanced: string
  highestYield: string
}

export interface AlchemistCrucibleResult {
  samples: AlchemicalSample[]
  workshops: AlchemicalWorkshop[]
  guild: {
    avgTransmutation: number
    avgPurity: number
    avgGoldYield: number
    isGrandMaster: boolean
    overallPurity: number
  }
  stats: AlchemistCrucibleStats
  recommendations: string[]
}

// ─── Regex Patterns ─────────────────────────────────────────────────────────

const FUNCTION_RE = /\bfunction\s+(\w+)/g
const ARROW_RE = /=>\s*[{(]/g
const RETURN_RE = /\breturn\b/g
const MUTATION_RE = /\.\s*(push|pop|shift|unshift|splice|sort|reverse)\s*\(/g
const SIDE_EFFECT_RE = /\b(console|process|fs|fetch|http|writeFile|readFile)\b/g
const TYPE_ANNOTATION_RE = /:\s*(?:string|number|boolean|void|Promise|Record|Map|Set|Array|Date|RegExp|Error|[A-Z]\w+)/
const GENERIC_RE = /<\w+>/
const INTERFACE_RE = /(?:interface|type)\s+\w+\s*(?:<[^>]+>)?\s*\{/
const CLASS_RE = /\bclass\s+\w+/
const IMPORT_RE = /import\s+/g
const EXPORT_RE = /export\s+/g
const TRY_CATCH_RE = /try\s*\{/g
const IF_RE = /\bif\s*\(/g
const FOR_RE = /\bfor\s*\(/g
const WHILE_RE = /\bwhile\s*\(/g
const SWITCH_RE = /\bswitch\s*\(/g
const ASYNC_RE = /\basync\s+/
const AWAIT_RE = /\bawait\s+/
const HELPER_RE = /\bfunction\s+(is|has|get|check|validate|parse|format|compute|calculate|measure)\w*/gi
const PIPE_RE = /[.\s](map|filter|reduce|forEach|flatMap|find|some|every)\s*\(/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const COMMENT_RE = /\/\/.*$/gm
const CONST_RE = /\bconst\s+/g
const LET_RE = /\blet\s+/g
const DEAD_CODE_RE = /\b(debugger|with)\s*[(;]/

// ─── measureTransmutation ────────────────────────────────────────────────────

/**
 * Measure data transformation quality
 * @example
 * measureTransmutation('function double(x) { return x * 2 }') // { quality: 70, ... }
 */
export function measureTransmutation(content: string): TransmutationMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      quality: 0, element: 'void', isBaseMetal: false, isNobleMetal: false,
      hasCompleteTransmutation: false, hasPartialTransmutation: false,
      hasFailedTransmutation: false, hasImpurities: false, hasResidue: false,
      hasByproducts: false, impurityCount: 0, byproductCount: 0,
    }
  }

  const pipes = (content.match(PIPE_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const mutations = (content.match(MUTATION_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length

  const transformRatio = functions > 0 ? Math.min(pipes / functions, 1) : 0
  const returnRatio = functions > 0 ? Math.min(returns / functions, 1) : 0
  let quality = Math.round((transformRatio * 30 + returnRatio * 40 + Math.min(pipes * 5, 30)) * 1.0)
  quality = Math.max(0, Math.min(100, quality - mutations * 3 - sideEffects * 2))

  const hasComplete = quality >= 70
  const hasPartial = quality >= 40 && quality < 70
  const hasFailed = quality < 40
  const hasImpurities = mutations > 0 || sideEffects > 0
  const hasResidue = functions > 0 && returns < functions
  const hasByproducts = sideEffects > 0

  let element: TransmutationElement = 'earth'
  if (quality >= 80) element = 'aether'
  else if (quality >= 60) element = 'fire'
  else if (quality >= 40) element = 'air'
  else if (quality >= 20) element = 'water'
  else element = 'earth'

  return {
    quality,
    element,
    isBaseMetal: quality < 40,
    isNobleMetal: quality >= 75,
    hasCompleteTransmutation: hasComplete,
    hasPartialTransmutation: hasPartial,
    hasFailedTransmutation: hasFailed,
    hasImpurities,
    hasResidue,
    hasByproducts,
    impurityCount: mutations + sideEffects,
    byproductCount: sideEffects,
  }
}

// ─── measureCrucible ─────────────────────────────────────────────────────────

/**
 * Measure function purity
 * @example
 * measureCrucible('const pure = (x) => x + 1') // { purity: 90, ... }
 */
export function measureCrucible(content: string): CrucibleMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      purity: 0, material: 'clay', isPure: false, hasSideEffects: false,
      hasMutations: false, hasExternalDependencies: false, hasImpurities: false,
      hasSlag: false, hasCracks: false, sideEffectCount: 0, mutationCount: 0,
    }
  }

  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length
  const mutations = (content.match(MUTATION_RE) ?? []).length
  const lets = (content.match(LET_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const deadCode = (content.match(DEAD_CODE_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length

  const sideEffectDensity = functions > 0 ? sideEffects / functions : sideEffects > 0 ? 1 : 0
  const mutationDensity = functions > 0 ? mutations / functions : mutations > 0 ? 1 : 0

  let purity = 100
  purity -= Math.round(sideEffectDensity * 30)
  purity -= Math.round(mutationDensity * 25)
  purity -= Math.min(lets * 2, 10)
  purity -= deadCode * 10
  purity += Math.min(tryCatch * 3, 10)
  purity = Math.max(0, Math.min(100, purity))

  let material: CrucibleMaterial = 'clay'
  if (purity >= 90) material = 'crystal'
  else if (purity >= 75) material = 'platinum'
  else if (purity >= 55) material = 'steel'
  else if (purity >= 35) material = 'iron'
  else if (purity >= 15) material = 'bronze'

  const hasSE = sideEffects > 0
  const hasMut = mutations > 0
  const hasExtDeps = sideEffects > 0
  const hasImp = hasSE || hasMut
  const hasSlag = deadCode > 0
  const hasCrack = tryCatch === 0 && functions > 2

  return {
    purity,
    material,
    isPure: !hasSE && !hasMut,
    hasSideEffects: hasSE,
    hasMutations: hasMut,
    hasExternalDependencies: hasExtDeps,
    hasImpurities: hasImp,
    hasSlag,
    hasCracks: hasCrack,
    sideEffectCount: sideEffects,
    mutationCount: mutations,
  }
}

// ─── measureStone ─────────────────────────────────────────────────────────────

/**
 * Measure core algorithm quality (magnum opus phases)
 * @example
 * measureStone('function sort(arr) { ... }') // { quality: 60, hasNigredo: true, ... }
 */
export function measureStone(content: string): StoneMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      quality: 0, hasMagnumOpus: false, hasNigredo: false, hasAlbedo: false,
      hasCitrinitas: false, hasRubedo: false, hasElixirOfLife: false,
      hasUniversalSolvent: false, phaseCount: 0,
    }
  }

  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length

  // Nigredo: decomposition (input breakdown)
  const hasNigredo = functions > 0 && (types > 0 || interfaces > 0)
  // Albedo: purification (type safety, validation)
  const hasAlbedo = types > 0 && tryCatch > 0
  // Citrinitas: awakening (generics, abstractions)
  const hasCitrinitas = generics > 0 || interfaces > 0
  // Rubedo: completion (output formation, returns)
  const hasRubedo = returns > 0 && pipes > 0
  // Elixir: self-sustaining (recursive or recursive patterns)
  const hasElixirOfLife = functions > 3 && consts > functions * 0.5
  // Universal solvent: versatile
  const hasUniversalSolvent = generics > 0 && functions > 2

  const phaseCount = [hasNigredo, hasAlbedo, hasCitrinitas, hasRubedo].filter(Boolean).length
  const hasMagnum = phaseCount >= 3

  let quality = 0
  quality += Math.min(functions * 5, 20)
  quality += Math.min(types * 5, 20)
  quality += Math.min(pipes * 3, 15)
  quality += hasNigredo ? 10 : 0
  quality += hasAlbedo ? 10 : 0
  quality += hasCitrinitas ? 10 : 0
  quality += hasRubedo ? 10 : 0
  quality += hasElixirOfLife ? 5 : 0
  quality = Math.max(0, Math.min(100, quality))

  return {
    quality,
    hasMagnumOpus: hasMagnum,
    hasNigredo,
    hasAlbedo,
    hasCitrinitas,
    hasRubedo,
    hasElixirOfLife,
    hasUniversalSolvent,
    phaseCount,
  }
}

// ─── measureElements ──────────────────────────────────────────────────────────

/**
 * Measure type element balance
 * @example
 * measureElements('const x: number = 1') // { balance: 30, earth: 80, ... }
 */
export function measureElements(content: string): ElementsMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      balance: 0, earth: 0, water: 0, air: 0, fire: 0, aether: 0,
      isBalanced: false, hasExcess: [], hasDeficiency: [],
    }
  }

  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const ifs = (content.match(IF_RE) ?? []).length
  const fors = (content.match(FOR_RE) ?? []).length
  const whiles = (content.match(WHILE_RE) ?? []).length
  const switches = (content.match(SWITCH_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const asyncs = (content.match(ASYNC_RE) ?? []).length
  const awaits = (content.match(AWAIT_RE) ?? []).length

  // Earth: concrete types
  const earth = Math.min(100, Math.round((types + classes * 2) / Math.max(loc, 1) * 500))
  // Water: flow/control
  const water = Math.min(100, Math.round((ifs + fors + whiles + switches) / Math.max(loc, 1) * 500))
  // Air: abstractions
  const air = Math.min(100, Math.round((interfaces + generics) / Math.max(loc, 1) * 500 + (pipes > 0 ? 20 : 0)))
  // Fire: transformations
  const fire = Math.min(100, Math.round((pipes + returns) / Math.max(loc, 1) * 500))
  // Aether: generics/templates
  const aether = Math.min(100, Math.round(generics / Math.max(loc, 1) * 800 + (asyncs > 0 ? 15 : 0) + (awaits > 0 ? 15 : 0)))

  const scores = [earth, water, air, fire, aether]
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length
  const variance = scores.reduce((s, v) => s + (v - avg) ** 2, 0) / scores.length
  const balance = Math.max(0, Math.round(100 - Math.sqrt(variance)))

  const threshold = 60
  const hasExcess: string[] = []
  const hasDeficiency: string[] = []
  if (earth > threshold + 20) hasExcess.push('earth')
  if (water > threshold + 20) hasExcess.push('water')
  if (air > threshold + 20) hasExcess.push('air')
  if (fire > threshold + 20) hasExcess.push('fire')
  if (aether > threshold + 20) hasExcess.push('aether')
  if (earth < 10) hasDeficiency.push('earth')
  if (water < 10) hasDeficiency.push('water')
  if (air < 10) hasDeficiency.push('air')
  if (fire < 10) hasDeficiency.push('fire')
  if (aether < 10) hasDeficiency.push('aether')

  return {
    balance,
    earth,
    water,
    air,
    fire,
    aether,
    isBalanced: balance >= 50 && hasExcess.length === 0,
    hasExcess,
    hasDeficiency,
  }
}

// ─── measureProcess ───────────────────────────────────────────────────────────

/**
 * Measure code process quality
 * @example
 * measureProcess('function helper() {}') // { quality: 50, stage: 'conjunction', ... }
 */
export function measureProcess(content: string): ProcessMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      quality: 0, stage: 'calcination', hasProperTemperature: false,
      hasControlledAtmosphere: false, hasCatalyst: false, hasReagent: false,
      hasSolvent: false, hasPrecipitate: false, hasFiltration: false, catalystCount: 0,
    }
  }

  const helpers = (content.match(HELPER_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const ifs = (content.match(IF_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length

  const hasCatalyst = helpers > 0
  const hasReagent = imports > 0
  const hasSolvent = consts > 0 && functions > 0
  const hasPrecipitate = exports > 0
  const hasFiltration = tryCatch > 0
  const hasProperTemperature = functions > 0 && functions <= loc * 0.3
  const hasControlledAtmosphere = tryCatch > 0 && ifs > 0

  let quality = 0
  quality += hasCatalyst ? 15 : 0
  quality += hasReagent ? 10 : 0
  quality += hasSolvent ? 15 : 0
  quality += hasPrecipitate ? 15 : 0
  quality += hasFiltration ? 15 : 0
  quality += hasProperTemperature ? 15 : 0
  quality += hasControlledAtmosphere ? 15 : 0
  quality = Math.max(0, Math.min(100, quality))

  let stage: ProcessStage = 'calcination'
  if (quality >= 90) stage = 'coagulation'
  else if (quality >= 75) stage = 'distillation'
  else if (quality >= 60) stage = 'fermentation'
  else if (quality >= 45) stage = 'conjunction'
  else if (quality >= 30) stage = 'separation'
  else if (quality >= 15) stage = 'dissolution'

  return {
    quality,
    stage,
    hasProperTemperature,
    hasControlledAtmosphere,
    hasCatalyst,
    hasReagent,
    hasSolvent,
    hasPrecipitate,
    hasFiltration,
    catalystCount: helpers,
  }
}

// ─── measureYield ─────────────────────────────────────────────────────────────

/**
 * Measure output value
 * @example
 * measureYield('export function gold() { return 42 }') // { gold: 80, ... }
 */
export function measureYield(content: string): YieldMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      gold: 0, isPureGold: false, hasGold: false, hasSilver: false,
      hasCopper: false, hasLead: false, hasDross: true,
      goldPercent: 0, drossPercent: 100,
    }
  }

  const exports = (content.match(EXPORT_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const comments = (content.match(JSDOC_RE) ?? []).length + (content.match(COMMENT_RE) ?? []).length
  const deadCode = (content.match(DEAD_CODE_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length

  const exportRatio = exports / Math.max(loc, 1)
  const returnRatio = returns / Math.max(loc, 1)
  const commentRatio = comments / Math.max(loc, 1)

  let gold = 0
  gold += Math.round(exportRatio * 200)
  gold += Math.round(returnRatio * 200)
  gold += Math.round(commentRatio * 100)
  gold += Math.min(types * 3, 15)
  gold -= deadCode * 20
  gold -= sideEffects * 3
  gold = Math.max(0, Math.min(100, gold))

  const goldPercent = gold
  const drossPercent = Math.max(0, 100 - gold)
  const isPureGold = gold >= 90
  const hasGold = gold >= 70
  const hasSilver = gold >= 50 && gold < 70
  const hasCopper = gold >= 30 && gold < 50
  const hasLead = gold >= 10 && gold < 30
  const hasDross = gold < 10

  return {
    gold,
    isPureGold,
    hasGold,
    hasSilver,
    hasCopper,
    hasLead,
    hasDross,
    goldPercent,
    drossPercent,
  }
}

// ─── analyzeAlchemicalSample ──────────────────────────────────────────────────

/**
 * Analyze a single file as an alchemical sample
 * @example
 * analyzeAlchemicalSample('const x = 1', 'test.ts') // { qualityScore: 45, ... }
 */
export function analyzeAlchemicalSample(content: string, filePath: string): AlchemicalSample {
  const transmutation = measureTransmutation(content)
  const crucible = measureCrucible(content)
  const stone = measureStone(content)
  const elements = measureElements(content)
  const process = measureProcess(content)
  const yieldResult = measureYield(content)

  const transmutationQuality = transmutation.quality
  const cruciblePurity = crucible.purity
  const philosopherStone = stone.quality
  const elementalBalance = elements.balance
  const alchemicalProcess = process.quality
  const goldYield = yieldResult.gold

  const qualityScore = Math.round(
    (transmutationQuality + cruciblePurity + philosopherStone + elementalBalance + alchemicalProcess + goldYield) / 6,
  )

  let condition: SampleCondition = 'slag-heap'
  if (qualityScore >= 90) condition = 'philosopher-stone'
  else if (qualityScore >= 75) condition = 'pure-gold'
  else if (qualityScore >= 60) condition = 'refined-metal'
  else if (qualityScore >= 40) condition = 'base-metal'
  else if (qualityScore >= 20) condition = 'raw-ore'

  return {
    file: filePath,
    transmutationQuality,
    cruciblePurity,
    philosopherStone,
    elementalBalance,
    alchemicalProcess,
    goldYield,
    transmutation,
    crucible,
    stone,
    elements,
    process,
    yield: yieldResult,
    condition,
    qualityScore,
  }
}

// ─── classifyWorkshopType ─────────────────────────────────────────────────────

/**
 * Classify workshop type based on samples
 * @example
 * classifyWorkshopType(samples) // 'guild-workshop'
 */
export function classifyWorkshopType(samples: AlchemicalSample[]): WorkshopType {
  if (samples.length === 0) return 'ruins'

  const avgQuality = samples.reduce((s, x) => s + x.qualityScore, 0) / samples.length
  const philosopherCount = samples.filter((s) => s.condition === 'philosopher-stone').length
  const slagCount = samples.filter((s) => s.condition === 'slag-heap').length

  if (avgQuality >= 80 && philosopherCount >= 2) return 'grand-laboratory'
  if (avgQuality >= 65) return 'alchemist-tower'
  if (avgQuality >= 50) return 'guild-workshop'
  if (avgQuality >= 30 && slagCount < samples.length * 0.5) return 'kitchen-lab'
  if (avgQuality >= 15) return 'shed'
  return 'ruins'
}

// ─── classifyAlchemistGrade ───────────────────────────────────────────────────

/**
 * Classify alchemist grade based on average purity
 * @example
 * classifyAlchemistGrade(85) // 'master'
 */
export function classifyAlchemistGrade(avgPurity: number): AlchemistGrade {
  if (avgPurity >= 90) return 'grand-master'
  if (avgPurity >= 75) return 'master'
  if (avgPurity >= 60) return 'adept'
  if (avgPurity >= 45) return 'journeyman'
  if (avgPurity >= 25) return 'novice'
  return 'apprentice'
}

// ─── classifyWorkshopCondition ────────────────────────────────────────────────

function classifyWorkshopCondition(avgPurity: number): WorkshopCondition {
  if (avgPurity >= 85) return 'master-alchemist'
  if (avgPurity >= 65) return 'journeyman'
  if (avgPurity >= 45) return 'apprentice'
  if (avgPurity >= 25) return 'dabbler'
  if (avgPurity >= 10) return 'charlatan'
  return 'explosion-site'
}

// ─── analyzeAlchemicalWorkshop ────────────────────────────────────────────────

/**
 * Analyze a directory as an alchemical workshop
 * @example
 * analyzeAlchemicalWorkshop(samples, 'src/') // { workshopType: 'guild-workshop', ... }
 */
export function analyzeAlchemicalWorkshop(samples: AlchemicalSample[], dirPath: string): AlchemicalWorkshop {
  if (samples.length === 0) {
    return {
      directory: dirPath,
      samples: [],
      avgTransmutation: 0,
      avgPurity: 0,
      avgGoldYield: 0,
      philosopherStoneCount: 0,
      slagHeapCount: 0,
      pureGoldCount: 0,
      balancedElementsCount: 0,
      workshopType: 'ruins',
      condition: 'explosion-site',
    }
  }

  const avgTransmutation = Math.round(samples.reduce((s, x) => s + x.transmutationQuality, 0) / samples.length)
  const avgPurity = Math.round(samples.reduce((s, x) => s + x.cruciblePurity, 0) / samples.length)
  const avgGoldYield = Math.round(samples.reduce((s, x) => s + x.goldYield, 0) / samples.length)

  return {
    directory: dirPath,
    samples,
    avgTransmutation,
    avgPurity,
    avgGoldYield,
    philosopherStoneCount: samples.filter((s) => s.condition === 'philosopher-stone').length,
    slagHeapCount: samples.filter((s) => s.condition === 'slag-heap').length,
    pureGoldCount: samples.filter((s) => s.yield.isPureGold).length,
    balancedElementsCount: samples.filter((s) => s.elements.isBalanced).length,
    workshopType: classifyWorkshopType(samples),
    condition: classifyWorkshopCondition(avgPurity),
  }
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate improvement recommendations
 * @example
 * generateRecommendations(samples, workshops, guild, stats) // ['Reduce side effects...']
 */
export function generateRecommendations(
  samples: AlchemicalSample[],
  workshops: AlchemicalWorkshop[],
  _guild: { avgTransmutation: number; avgPurity: number; avgGoldYield: number; isGrandMaster: boolean; overallPurity: number },
  stats: AlchemistCrucibleStats,
): string[] {
  const recs: string[] = []

  if (stats.hasSideEffectsCount > stats.totalFiles * 0.5) {
    recs.push('Reduce side effects — over half of files have impure operations')
  }
  if (stats.hasMutationsCount > stats.totalFiles * 0.3) {
    recs.push('Minimize mutations — prefer immutable data transformations')
  }
  if (stats.avgCruciblePurity < 40) {
    recs.push('Improve function purity — extract pure functions from impure code')
  }
  if (stats.avgElementalBalance < 40) {
    recs.push('Balance type elements — add type annotations and abstractions')
  }
  if (stats.slagHeapCount > stats.totalFiles * 0.3) {
    recs.push('Too much slag — refactor or remove low-value files')
  }
  if (stats.hasDrossCount > stats.totalFiles * 0.2) {
    recs.push('Remove dross — eliminate dead code and debugger statements')
  }
  if (stats.hasFiltrationCount < stats.totalFiles * 0.3) {
    recs.push('Add error handling — most files lack proper filtration (try/catch)')
  }
  if (stats.hasCatalystCount < stats.totalFiles * 0.2) {
    recs.push('Add helper functions — extract utility functions to act as catalysts')
  }

  const worst = samples.length > 0
    ? samples.reduce((w, s) => s.qualityScore < w.qualityScore ? s : w, samples[0])
    : null
  if (worst && worst.qualityScore < 30) {
    recs.push(`Lowest quality file "${worst.file}" needs urgent transmutation (score: ${worst.qualityScore})`)
  }

  if (workshops.some((w) => w.condition === 'explosion-site')) {
    recs.push('Some workshops are explosion sites — consider major refactoring')
  }

  return recs.length > 0 ? recs : ['Code transmutation quality is acceptable — keep refining']
}

// ─── buildAlchemistCrucibleResult ─────────────────────────────────────────────

/**
 * Build the complete alchemist crucible result
 * @example
 * buildAlchemistCrucibleResult(['a.ts'], ['const x = 1'], {}) // { samples: [...], ... }
 */
export function buildAlchemistCrucibleResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): AlchemistCrucibleResult {
  const samples: AlchemicalSample[] = []
  for (let i = 0; i < files.length; i++) {
    samples.push(analyzeAlchemicalSample(contents[i] ?? '', files[i] ?? ''))
  }

  // Group by directory for workshops
  const dirMap = new Map<string, AlchemicalSample[]>()
  for (const sample of samples) {
    const dir = sample.file.includes('/') ? sample.file.substring(0, sample.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(sample)
    } else {
      dirMap.set(dir, [sample])
    }
  }

  const workshops: AlchemicalWorkshop[] = []
  for (const [dir, dirSamples] of dirMap) {
    workshops.push(analyzeAlchemicalWorkshop(dirSamples, dir))
  }

  const avgTransmutation = samples.length > 0 ? Math.round(samples.reduce((s, x) => s + x.transmutationQuality, 0) / samples.length) : 0
  const avgPurity = samples.length > 0 ? Math.round(samples.reduce((s, x) => s + x.cruciblePurity, 0) / samples.length) : 0
  const avgGoldYield = samples.length > 0 ? Math.round(samples.reduce((s, x) => s + x.goldYield, 0) / samples.length) : 0
  const overallPurity = samples.length > 0 ? Math.round(samples.reduce((s, x) => s + x.qualityScore, 0) / samples.length) : 0

  const guild = {
    avgTransmutation,
    avgPurity,
    avgGoldYield,
    isGrandMaster: overallPurity >= 80,
    overallPurity,
  }

  const conditions = samples.map((s) => s.condition)
  const bestSample = samples.length > 0
    ? samples.reduce((b, s) => s.qualityScore > b.qualityScore ? s : b, samples[0])
    : null
  const purest = samples.length > 0
    ? samples.reduce((b, s) => s.cruciblePurity > b.cruciblePurity ? s : b, samples[0])
    : null
  const bestAlgo = samples.length > 0
    ? samples.reduce((b, s) => s.philosopherStone > b.philosopherStone ? s : b, samples[0])
    : null
  const mostBal = samples.length > 0
    ? samples.reduce((b, s) => s.elementalBalance > b.elementalBalance ? s : b, samples[0])
    : null
  const highYield = samples.length > 0
    ? samples.reduce((b, s) => s.goldYield > b.goldYield ? s : b, samples[0])
    : null

  const stats: AlchemistCrucibleStats = {
    totalFiles: samples.length,
    totalWorkshops: workshops.length,
    avgTransmutationQuality: avgTransmutation,
    avgCruciblePurity: avgPurity,
    avgPhilosopherStone: samples.length > 0 ? Math.round(samples.reduce((s, x) => s + x.philosopherStone, 0) / samples.length) : 0,
    avgElementalBalance: samples.length > 0 ? Math.round(samples.reduce((s, x) => s + x.elementalBalance, 0) / samples.length) : 0,
    avgAlchemicalProcess: samples.length > 0 ? Math.round(samples.reduce((s, x) => s + x.alchemicalProcess, 0) / samples.length) : 0,
    avgGoldYield,
    philosopherStoneCount: conditions.filter((c) => c === 'philosopher-stone').length,
    pureGoldCount: conditions.filter((c) => c === 'pure-gold').length,
    refinedMetalCount: conditions.filter((c) => c === 'refined-metal').length,
    baseMetalCount: conditions.filter((c) => c === 'base-metal').length,
    rawOreCount: conditions.filter((c) => c === 'raw-ore').length,
    slagHeapCount: conditions.filter((c) => c === 'slag-heap').length,
    isPureCount: samples.filter((s) => s.crucible.isPure).length,
    hasSideEffectsCount: samples.filter((s) => s.crucible.hasSideEffects).length,
    hasMutationsCount: samples.filter((s) => s.crucible.hasMutations).length,
    hasMagnumOpusCount: samples.filter((s) => s.stone.hasMagnumOpus).length,
    isBalancedCount: samples.filter((s) => s.elements.isBalanced).length,
    hasCatalystCount: samples.filter((s) => s.process.hasCatalyst).length,
    hasFiltrationCount: samples.filter((s) => s.process.hasFiltration).length,
    hasGoldCount: samples.filter((s) => s.yield.hasGold).length,
    hasDrossCount: samples.filter((s) => s.yield.hasDross).length,
    overallPurity,
    alchemistGrade: classifyAlchemistGrade(overallPurity),
    bestSample: bestSample?.file ?? '',
    purestCrucible: purest?.file ?? '',
    bestAlgorithm: bestAlgo?.file ?? '',
    mostBalanced: mostBal?.file ?? '',
    highestYield: highYield?.file ?? '',
  }

  const recommendations = generateRecommendations(samples, workshops, guild, stats)

  return { samples, workshops, guild, stats, recommendations }
}
