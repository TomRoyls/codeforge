// ─── Interfaces ──────────────────────────────────────────────────────────────

export type TransmutationType = 'purification' | 'transmutation' | 'projection' | 'fermentation' | 'putrefaction' | 'chaos'
export type Element = 'earth' | 'water' | 'air' | 'fire' | 'aether' | 'void'
export type FlaskCondition = 'philosopher-stone' | 'grand-elixir' | 'potion-master' | 'apprentice' | 'charlatan' | 'explosion'
export type LabType = 'ivory-tower' | 'research-lab' | 'workshop' | 'apothecary' | 'shed' | 'ruins'
export type LabCondition = 'nobel-prize' | 'peer-reviewed' | 'experimental' | 'amateur' | 'dangerous' | 'condemned'
export type AlchemistGrade = 'grand-master' | 'master-alchemist' | 'alchemist' | 'apprentice' | 'novice' | 'quack'

export interface AlchemistFlask {
  file: string
  transmutationQuality: number
  reagentHandling: number
  catalystEfficiency: number
  distillationPurity: number
  crucibleStrength: number
  philosopherPotential: number
  transmutation: {
    purity: number
    isPure: boolean
    hasSideEffects: boolean
    hasImpurities: boolean
    transmutationType: TransmutationType
    inputOutputRatio: number
    hasByproducts: boolean
    byproductCount: number
  }
  reagents: {
    count: number
    isValidated: boolean
    hasCatalysts: boolean
    hasPoisons: boolean
    hasStabilizers: boolean
    hasReactive: boolean
    poisonCount: number
    catalystCount: number
    handlingScore: number
  }
  crucible: {
    isFired: boolean
    temperature: number
    hasCracks: boolean
    hasLeaks: boolean
    isShatterproof: boolean
    crackCount: number
    leakCount: number
  }
  alembic: {
    distillationStages: number
    hasCleanSeparation: boolean
    hasContamination: boolean
    hasResidue: boolean
    contaminationPoints: string[]
    residueCount: number
    purity: number
  }
  catalyst: {
    count: number
    efficiency: number
    hasProperCatalysts: boolean
    hasFailedCatalysts: boolean
    hasInertCatalysts: boolean
    failedCount: number
    inertCount: number
  }
  philosopher: {
    elegance: number
    hasElixir: boolean
    hasHomunculus: boolean
    hasLead: boolean
    hasGold: boolean
    isEnlightened: boolean
    elixirCount: number
    leadCount: number
    goldCount: number
  }
  element: {
    primary: Element
    secondary: string
    balance: number
    isBalanced: boolean
    isDominant: boolean
  }
  condition: FlaskCondition
  qualityScore: number
}

export interface Laboratory {
  directory: string
  flasks: AlchemistFlask[]
  avgTransmutation: number
  avgDistillationPurity: number
  avgCrucibleStrength: number
  philosopherStoneCount: number
  explosionCount: number
  pureFunctionCount: number
  sideEffectCount: number
  labType: LabType
  condition: LabCondition
}

export interface Guild {
  avgTransmutation: number
  avgPurity: number
  avgCrucibleStrength: number
  avgPhilosopherPotential: number
  hasElixir: boolean
  overallMastery: number
}

export interface AlchemyLabStats {
  totalFiles: number
  totalLabs: number
  avgTransmutationQuality: number
  avgReagentHandling: number
  avgCatalystEfficiency: number
  avgDistillationPurity: number
  avgCrucibleStrength: number
  avgPhilosopherPotential: number
  philosopherStoneCount: number
  grandElixirCount: number
  potionMasterCount: number
  apprenticeCount: number
  charlatanCount: number
  explosionCount: number
  pureFunctionCount: number
  sideEffectCount: number
  impurityCount: number
  hasByproductCount: number
  hasCracksCount: number
  hasLeaksCount: number
  hasContaminationCount: number
  hasGoldCount: number
  hasLeadCount: number
  hasElixirCount: number
  earthCount: number
  waterCount: number
  airCount: number
  fireCount: number
  aetherCount: number
  voidCount: number
  overallMastery: number
  alchemistGrade: AlchemistGrade
  bestTransmutation: string
  purest: string
  strongestCrucible: string
  mostElegant: string
  mostExplosive: string
}

export interface AlchemyLabResult {
  flasks: AlchemistFlask[]
  labs: Laboratory[]
  guild: Guild
  stats: AlchemyLabStats
  recommendations: string[]
}

// ─── Content Primitives ──────────────────────────────────────────────────────

/**
 * Count lines of code
 * @example
 * countLoc('const x = 1\nconst y = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count imports
 * @example
 * countImports('import { x } from "y"') // 1
 */
export function countImports(content: string): number {
  return (content.match(/^import\s+/gm) ?? []).length
}

/**
 * Count exports
 * @example
 * countExports('export function a() {}') // 1
 */
export function countExports(content: string): number {
  return (content.match(/\bexport\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+/g) ?? []).length
}

/**
 * Count functions
 * @example
 * countFunctions('function a() {}') // 1
 */
export function countFunctions(content: string): number {
  return (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) ?? []).length
}

/**
 * Count classes
 * @example
 * countClasses('class Foo {}') // 1
 */
export function countClasses(content: string): number {
  return (content.match(/\bclass\s+\w+/g) ?? []).length
}

/**
 * Count error handling constructs
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{|\bcatch\s*\(|\.catch\s*\(|\bthrow\s+/g) ?? []).length
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)/g) ?? []).length
}

/**
 * Count branches
 * @example
 * countBranches('if (a) {}') // 1
 */
export function countBranches(content: string): number {
  return (content.match(/\bif\s*\(|\?\s*[^?]\s*:|\bswitch\s*\(/g) ?? []).length
}

/**
 * Count max nesting depth
 * @example
 * maxNesting('{{{}}}') // 3
 */
export function maxNesting(content: string): number {
  let m = 0
  let c = 0
  for (const ch of content) {
    if (ch === '{') { c++; if (c > m) m = c }
    else if (ch === '}') { c = Math.max(0, c - 1) }
  }
  return m
}

/**
 * Count console statements
 * @example
 * countConsole('console.log("x")') // 1
 */
export function countConsole(content: string): number {
  return (content.match(/console\.\w+\s*\(/g) ?? []).length
}

/**
 * Count comments
 * @example
 * countComments('// hello') // 1
 */
export function countComments(content: string): number {
  return (content.match(/\/\//g) ?? []).length + (content.match(/\/\*/g) ?? []).length
}

/**
 * Count TODO markers
 * @example
 * countTodos('TODO: fix') // 1
 */
export function countTodos(content: string): number {
  return (content.match(/TODO|FIXME|HACK|XXX/gi) ?? []).length
}

/**
 * Count JSDoc blocks
 * @example
 * countJSDoc('/** doc * slash /') // 1
 */
export function countJSDoc(content: string): number {
  return (content.match(/\/\*\*/g) ?? []).length
}

/**
 * Count descriptive names
 * @example
 * countDescriptiveNames('function calculateTotal() {}') // 1
 */
export function countDescriptiveNames(content: string): number {
  return (content.match(/\b(?:function|const|let|var)\s+[a-z]{1}[a-zA-Z]{3,}\b/g) ?? []).length
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify flask condition from quality score
 * @example
 * classifyFlaskCondition(90) // 'philosopher-stone'
 */
export function classifyFlaskCondition(score: number): FlaskCondition {
  if (score >= 80) return 'philosopher-stone'
  if (score >= 65) return 'grand-elixir'
  if (score >= 45) return 'potion-master'
  if (score >= 25) return 'apprentice'
  if (score >= 10) return 'charlatan'
  return 'explosion'
}

/**
 * Classify lab type from flasks
 * @example
 * classifyLabType([]) // 'ruins'
 */
export function classifyLabType(flasks: AlchemistFlask[]): LabType {
  if (flasks.length === 0) return 'ruins'
  const n = flasks.length
  const strong = flasks.filter(f => f.condition === 'philosopher-stone' || f.condition === 'grand-elixir').length
  if (strong > n * 0.5) return 'ivory-tower'
  if (strong > n * 0.25) return 'research-lab'
  const pure = flasks.filter(f => f.transmutation.isPure).length
  if (pure > n * 0.5) return 'workshop'
  if (n >= 3) return 'apothecary'
  return 'shed'
}

/**
 * Classify lab condition from avg score
 * @example
 * classifyLabCondition(80) // 'nobel-prize'
 */
export function classifyLabCondition(avgScore: number): LabCondition {
  if (avgScore >= 75) return 'nobel-prize'
  if (avgScore >= 60) return 'peer-reviewed'
  if (avgScore >= 40) return 'experimental'
  if (avgScore >= 25) return 'amateur'
  if (avgScore >= 10) return 'dangerous'
  return 'condemned'
}

/**
 * Classify alchemist grade from avg mastery
 * @example
 * classifyAlchemistGrade(85) // 'grand-master'
 */
export function classifyAlchemistGrade(avgMastery: number): AlchemistGrade {
  if (avgMastery >= 80) return 'grand-master'
  if (avgMastery >= 65) return 'master-alchemist'
  if (avgMastery >= 45) return 'alchemist'
  if (avgMastery >= 30) return 'apprentice'
  if (avgMastery >= 15) return 'novice'
  return 'quack'
}

/**
 * Classify primary element from code content
 * @example
 * classifyElement('export class Core {}') // { primary: 'earth', ... }
 */
export function classifyElement(content: string): AlchemistFlask['element'] {
  const classes = countClasses(content)
  const functions = countFunctions(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const loc = countLoc(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const descriptive = countDescriptiveNames(content)
  const branches = countBranches(content)

  const earthScore = classes * 10 + exports * 5
  const waterScore = functions * 8 + imports * 5
  const airScore = types * 8 + comments * 2
  const fireScore = errors * 10 + branches * 5
  const aetherScore = jsdoc * 10 + descriptive * 5
  const voidScore = loc === 0 ? 50 : 0

  let primary: Element = 'void'
  let maxScore = voidScore
  if (earthScore > maxScore) { primary = 'earth'; maxScore = earthScore }
  if (waterScore > maxScore) { primary = 'water'; maxScore = waterScore }
  if (airScore > maxScore) { primary = 'air'; maxScore = airScore }
  if (fireScore > maxScore) { primary = 'fire'; maxScore = fireScore }
  if (aetherScore > maxScore) { primary = 'aether'; maxScore = aetherScore }

  const secondaryMap: Record<Element, string> = {
    earth: 'stability', water: 'flow', air: 'clarity',
    fire: 'transformation', aether: 'perfection', void: 'emptiness',
  }

  const balance = Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) + (errors > 0 ? 20 : 0) +
    (functions > 0 ? 20 : 0) + (exports > 0 ? 20 : 0) +
    (imports > 0 ? 10 : 0) + (classes > 0 ? 10 : 0),
  )))

  return {
    primary,
    secondary: secondaryMap[primary],
    balance,
    isBalanced: balance >= 50,
    isDominant: maxScore > 30,
  }
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure transmutation properties from code content
 * @example
 * measureTransmutation('export function a(): number { return 1 }') // { purity, ... }
 */
export function measureTransmutation(content: string): AlchemistFlask['transmutation'] {
  const functions = countFunctions(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const console = countConsole(content)
  const loc = countLoc(content)
  const errors = countErrorHandling(content)

  const isPure = console === 0 && exports > 0 && types > 0
  const hasSideEffects = console > 0
  const hasImpurities = functions > 0 && types === 0

  const purity = Math.min(100, Math.max(0, Math.round(
    (isPure ? 30 : 0) +
    (types > 0 ? 25 : 0) +
    (!hasSideEffects ? 20 : 0) +
    (!hasImpurities ? 15 : 0) +
    (errors > 0 ? 10 : 0),
  )))

  let transmutationType: TransmutationType = 'chaos'
  if (purity >= 80 && isPure) transmutationType = 'purification'
  else if (purity >= 60 && exports > 0) transmutationType = 'transmutation'
  else if (purity >= 40 && functions > 0) transmutationType = 'projection'
  else if (purity >= 25) transmutationType = 'fermentation'
  else if (loc > 0) transmutationType = 'putrefaction'

  const inputOutputRatio = functions > 0 ? Math.round((exports + types) / functions) : 0
  const byproductCount = console
  const hasByproducts = byproductCount > 0

  return {
    purity, isPure, hasSideEffects, hasImpurities,
    transmutationType, inputOutputRatio, hasByproducts, byproductCount,
  }
}

/**
 * Measure reagent properties from code content
 * @example
 * measureReagents('function calc(x: number): void {}') // { count, ... }
 */
export function measureReagents(content: string): AlchemistFlask['reagents'] {
  const types = countTypeAnnotations(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const exports = countExports(content)
  const loc = countLoc(content)

  const count = imports + functions
  const isValidated = types > 0 && functions > 0
  const hasCatalysts = imports > 0 && functions > 0
  const hasPoisons = functions > 0 && types === 0
  const hasStabilizers = content.includes('= ') && functions > 0
  const hasReactive = imports > 0 && exports > 0
  const poisonCount = hasPoisons ? functions : 0
  const catalystCount = imports

  const handlingScore = Math.min(100, Math.max(0, Math.round(
    (isValidated ? 30 : 0) +
    (hasCatalysts ? 25 : 0) +
    (!hasPoisons ? 20 : 0) +
    (hasStabilizers ? 15 : 0) +
    (types > 0 ? 10 : 0),
  )))

  return {
    count, isValidated, hasCatalysts, hasPoisons,
    hasStabilizers, hasReactive, poisonCount, catalystCount, handlingScore,
  }
}

/**
 * Measure crucible properties from code content
 * @example
 * measureCrucible('try {} catch(e) {}') // { isFired, ... }
 */
export function measureCrucible(content: string): AlchemistFlask['crucible'] {
  const errors = countErrorHandling(content)
  const branches = countBranches(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const loc = countLoc(content)

  const isFired = errors > 0
  const temperature = Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 30 : 0) +
    (errors >= 2 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (functions > 0 ? 15 : 0) +
    (branches > 0 ? 10 : 0),
  )))

  const crackCount = branches > 0 && errors === 0 ? Math.max(1, branches) : 0
  const hasCracks = crackCount > 0
  const leakCount = (content.match(/catch\s*\([^)]*\)\s*\{\s*\}/g) ?? []).length
  const hasLeaks = leakCount > 0
  const isShatterproof = isFired && !hasCracks && !hasLeaks && types > 0

  return { isFired, temperature, hasCracks, hasLeaks, isShatterproof, crackCount, leakCount }
}

/**
 * Measure alembic properties from code content
 * @example
 * measureAlembic('function a() {} function b() {}') // { distillationStages, ... }
 */
export function measureAlembic(content: string): AlchemistFlask['alembic'] {
  const functions = countFunctions(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const branches = countBranches(content)
  const console = countConsole(content)
  const loc = countLoc(content)

  const distillationStages = functions + imports
  const hasCleanSeparation = exports > 0 && imports > 0

  const contaminationPoints: string[] = []
  if (console > 0) contaminationPoints.push('console')
  if (branches > 5) contaminationPoints.push('complexity')
  if (functions > 0 && types === 0) contaminationPoints.push('untyped')
  const hasContamination = contaminationPoints.length > 0

  const residueCount = branches > 0 && functions === 0 ? branches : 0
  const hasResidue = residueCount > 0

  const purity = Math.min(100, Math.max(0, Math.round(
    (hasCleanSeparation ? 30 : 0) +
    (!hasContamination ? 25 : 0) +
    (types > 0 ? 25 : 0) +
    (!hasResidue ? 20 : 0),
  )))

  return { distillationStages, hasCleanSeparation, hasContamination, hasResidue, contaminationPoints, residueCount, purity }
}

/**
 * Measure catalyst properties from code content
 * @example
 * measureCatalyst('import { x } from "./a"') // { count, ... }
 */
export function measureCatalyst(content: string): AlchemistFlask['catalyst'] {
  const imports = countImports(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const functions = countFunctions(content)

  const count = imports
  const efficiency = Math.min(100, Math.max(0, Math.round(
    (imports > 0 && types > 0 ? 30 : 0) +
    (imports > 0 && exports > 0 ? 25 : 0) +
    (imports > 0 && functions > 0 ? 25 : 0) +
    (imports <= 5 ? 20 : 0),
  )))
  const hasProperCatalysts = imports > 0 && types > 0 && functions > 0
  const hasFailedCatalysts = imports > 0 && types === 0
  const hasInertCatalysts = imports > 3 && exports === 0
  const failedCount = hasFailedCatalysts ? imports : 0
  const inertCount = hasInertCatalysts ? imports - 3 : 0

  return { count, efficiency, hasProperCatalysts, hasFailedCatalysts, hasInertCatalysts, failedCount, inertCount }
}

/**
 * Measure philosopher properties from code content
 * @example
 * measurePhilosopher('export function a(): number { return 1 }') // { elegance, ... }
 */
export function measurePhilosopher(content: string): AlchemistFlask['philosopher'] {
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const errors = countErrorHandling(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const descriptive = countDescriptiveNames(content)
  const todos = countTodos(content)
  const loc = countLoc(content)
  const nesting = maxNesting(content)

  const elegance = Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (errors > 0 ? 15 : 0) +
    (descriptive > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (todos === 0 && loc > 0 ? 15 : 0) +
    (nesting <= 3 ? 10 : 0),
  )))

  const hasElixir = types > 0 && jsdoc > 0 && errors > 0 && descriptive > 0
  const hasHomunculus = nesting > 5 && functions > 3
  const hasLead = todos > 0 || (loc > 0 && types === 0)
  const hasGold = types > 0 && jsdoc > 0 && errors > 0
  const isEnlightened = elegance >= 80
  const elixirCount = hasElixir ? 1 : 0
  const leadCount = todos
  const goldCount = hasGold ? 1 : 0

  return { elegance, hasElixir, hasHomunculus, hasLead, hasGold, isEnlightened, elixirCount, leadCount, goldCount }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as an alchemist flask
 * @example
 * analyzeAlchemistFlask('export function a(): number { return 1 }', 'a.ts') // AlchemistFlask
 */
export function analyzeAlchemistFlask(content: string, filePath: string): AlchemistFlask {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      transmutationQuality: 0, reagentHandling: 0, catalystEfficiency: 0,
      distillationPurity: 0, crucibleStrength: 0, philosopherPotential: 0,
      transmutation: { purity: 0, isPure: false, hasSideEffects: false, hasImpurities: false, transmutationType: 'chaos', inputOutputRatio: 0, hasByproducts: false, byproductCount: 0 },
      reagents: { count: 0, isValidated: false, hasCatalysts: false, hasPoisons: false, hasStabilizers: false, hasReactive: false, poisonCount: 0, catalystCount: 0, handlingScore: 0 },
      crucible: { isFired: false, temperature: 0, hasCracks: false, hasLeaks: false, isShatterproof: false, crackCount: 0, leakCount: 0 },
      alembic: { distillationStages: 0, hasCleanSeparation: false, hasContamination: false, hasResidue: false, contaminationPoints: [], residueCount: 0, purity: 0 },
      catalyst: { count: 0, efficiency: 0, hasProperCatalysts: false, hasFailedCatalysts: false, hasInertCatalysts: false, failedCount: 0, inertCount: 0 },
      philosopher: { elegance: 0, hasElixir: false, hasHomunculus: false, hasLead: false, hasGold: false, isEnlightened: false, elixirCount: 0, leadCount: 0, goldCount: 0 },
      element: { primary: 'void', secondary: 'emptiness', balance: 0, isBalanced: false, isDominant: false },
      condition: 'explosion',
      qualityScore: 0,
    }
  }

  const transmutation = measureTransmutation(content)
  const reagents = measureReagents(content)
  const crucible = measureCrucible(content)
  const alembic = measureAlembic(content)
  const catalyst = measureCatalyst(content)
  const philosopher = measurePhilosopher(content)
  const element = classifyElement(content)

  const transmutationQuality = transmutation.purity
  const reagentHandling = reagents.handlingScore
  const catalystEfficiency = catalyst.efficiency
  const distillationPurity = alembic.purity
  const crucibleStrength = crucible.temperature
  const philosopherPotential = philosopher.elegance

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    transmutationQuality * 0.2 +
    reagentHandling * 0.15 +
    catalystEfficiency * 0.1 +
    distillationPurity * 0.2 +
    crucibleStrength * 0.2 +
    philosopherPotential * 0.15,
  )))

  const condition = classifyFlaskCondition(qualityScore)

  return {
    file: filePath,
    transmutationQuality, reagentHandling, catalystEfficiency,
    distillationPurity, crucibleStrength, philosopherPotential,
    transmutation, reagents, crucible, alembic, catalyst, philosopher, element,
    condition, qualityScore,
  }
}

// ─── Laboratory Analysis ─────────────────────────────────────────────────────

/**
 * Analyze a directory as a laboratory
 * @example
 * analyzeLaboratory(flasks, 'src') // Laboratory
 */
export function analyzeLaboratory(flasks: AlchemistFlask[], dirPath: string): Laboratory {
  if (flasks.length === 0) {
    return {
      directory: dirPath, flasks: [],
      avgTransmutation: 0, avgDistillationPurity: 0, avgCrucibleStrength: 0,
      philosopherStoneCount: 0, explosionCount: 0, pureFunctionCount: 0, sideEffectCount: 0,
      labType: 'ruins', condition: 'condemned',
    }
  }

  const n = flasks.length
  const avgTransmutation = Math.round(flasks.reduce((s, f) => s + f.transmutationQuality, 0) / n)
  const avgDistillationPurity = Math.round(flasks.reduce((s, f) => s + f.distillationPurity, 0) / n)
  const avgCrucibleStrength = Math.round(flasks.reduce((s, f) => s + f.crucibleStrength, 0) / n)
  const philosopherStoneCount = flasks.filter(f => f.condition === 'philosopher-stone').length
  const explosionCount = flasks.filter(f => f.condition === 'explosion').length
  const pureFunctionCount = flasks.filter(f => f.transmutation.isPure).length
  const sideEffectCount = flasks.filter(f => f.transmutation.hasSideEffects).length

  const labType = classifyLabType(flasks)
  const avgScore = Math.round(flasks.reduce((s, f) => s + f.qualityScore, 0) / n)
  const condition = classifyLabCondition(avgScore)

  return {
    directory: dirPath, flasks,
    avgTransmutation, avgDistillationPurity, avgCrucibleStrength,
    philosopherStoneCount, explosionCount, pureFunctionCount, sideEffectCount,
    labType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate alchemy lab recommendations
 * @example
 * generateRecommendations(flasks, labs, guild, stats) // string[]
 */
export function generateRecommendations(
  _flasks: AlchemistFlask[],
  _labs: Laboratory[],
  _guild: Guild,
  stats: AlchemyLabStats,
): string[] {
  void _flasks
  void _labs
  void _guild
  const recs: string[] = []

  if (stats.explosionCount > 0) {
    recs.push(`Explosions detected: ${stats.explosionCount} files are critically unstable`)
  }
  if (stats.impurityCount > stats.totalFiles * 0.3) {
    recs.push(`Impure transmutations: ${stats.impurityCount} files mix concerns without type safety`)
  }
  if (stats.overallMastery >= 60) {
    recs.push('Strong alchemy: codebase shows good transformation purity')
  }
  if (stats.hasCracksCount > 3) {
    recs.push(`Crucible cracks: ${stats.hasCracksCount} files have branches without error handling`)
  }
  if (stats.voidCount > stats.totalFiles * 0.5) {
    recs.push('Void elements: majority of files lack substance')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete alchemy lab result from files and contents
 * @example
 * buildAlchemyLabResult(['a.ts'], ['export function a() {}'], {}) // AlchemyLabResult
 */
export function buildAlchemyLabResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): AlchemyLabResult {
  void options

  const flasks: AlchemistFlask[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeAlchemistFlask(content, file)
    } catch {
      return analyzeAlchemistFlask('', file)
    }
  })

  const dirMap = new Map<string, AlchemistFlask[]>()
  for (const flask of flasks) {
    const dir = flask.file.includes('/') ? flask.file.slice(0, flask.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(flask) } else { dirMap.set(dir, [flask]) }
  }

  const labs: Laboratory[] = Array.from(dirMap.entries()).map(([dir, fs]) =>
    analyzeLaboratory(fs, dir),
  )

  const n = flasks.length || 1
  const avgTransmutation = Math.round(flasks.reduce((s, f) => s + f.transmutationQuality, 0) / n)
  const avgPurity = Math.round(flasks.reduce((s, f) => s + f.distillationPurity, 0) / n)
  const avgCrucibleStrength = Math.round(flasks.reduce((s, f) => s + f.crucibleStrength, 0) / n)
  const avgPhilosopherPotential = Math.round(flasks.reduce((s, f) => s + f.philosopherPotential, 0) / n)

  const overallMastery = Math.min(100, Math.max(0, Math.round(
    avgTransmutation * 0.25 +
    avgPurity * 0.25 +
    avgCrucibleStrength * 0.25 +
    avgPhilosopherPotential * 0.25,
  )))

  const hasElixir = flasks.some(f => f.philosopher.hasElixir)

  const guild: Guild = {
    avgTransmutation, avgPurity, avgCrucibleStrength,
    avgPhilosopherPotential, hasElixir, overallMastery,
  }

  const stats: AlchemyLabStats = {
    totalFiles: files.length,
    totalLabs: labs.length,
    avgTransmutationQuality: avgTransmutation,
    avgReagentHandling: Math.round(flasks.reduce((s, f) => s + f.reagentHandling, 0) / n),
    avgCatalystEfficiency: Math.round(flasks.reduce((s, f) => s + f.catalystEfficiency, 0) / n),
    avgDistillationPurity: avgPurity,
    avgCrucibleStrength,
    avgPhilosopherPotential,
    philosopherStoneCount: flasks.filter(f => f.condition === 'philosopher-stone').length,
    grandElixirCount: flasks.filter(f => f.condition === 'grand-elixir').length,
    potionMasterCount: flasks.filter(f => f.condition === 'potion-master').length,
    apprenticeCount: flasks.filter(f => f.condition === 'apprentice').length,
    charlatanCount: flasks.filter(f => f.condition === 'charlatan').length,
    explosionCount: flasks.filter(f => f.condition === 'explosion').length,
    pureFunctionCount: flasks.filter(f => f.transmutation.isPure).length,
    sideEffectCount: flasks.filter(f => f.transmutation.hasSideEffects).length,
    impurityCount: flasks.filter(f => f.transmutation.hasImpurities).length,
    hasByproductCount: flasks.filter(f => f.transmutation.hasByproducts).length,
    hasCracksCount: flasks.filter(f => f.crucible.hasCracks).length,
    hasLeaksCount: flasks.filter(f => f.crucible.hasLeaks).length,
    hasContaminationCount: flasks.filter(f => f.alembic.hasContamination).length,
    hasGoldCount: flasks.filter(f => f.philosopher.hasGold).length,
    hasLeadCount: flasks.filter(f => f.philosopher.hasLead).length,
    hasElixirCount: flasks.filter(f => f.philosopher.hasElixir).length,
    earthCount: flasks.filter(f => f.element.primary === 'earth').length,
    waterCount: flasks.filter(f => f.element.primary === 'water').length,
    airCount: flasks.filter(f => f.element.primary === 'air').length,
    fireCount: flasks.filter(f => f.element.primary === 'fire').length,
    aetherCount: flasks.filter(f => f.element.primary === 'aether').length,
    voidCount: flasks.filter(f => f.element.primary === 'void').length,
    overallMastery,
    alchemistGrade: classifyAlchemistGrade(overallMastery),
    bestTransmutation: flasks.length > 0
      ? flasks.reduce((a, b) => b.transmutationQuality > a.transmutationQuality ? b : a, flasks[0]).file : 'none',
    purest: flasks.length > 0
      ? flasks.reduce((a, b) => b.distillationPurity > a.distillationPurity ? b : a, flasks[0]).file : 'none',
    strongestCrucible: flasks.length > 0
      ? flasks.reduce((a, b) => b.crucibleStrength > a.crucibleStrength ? b : a, flasks[0]).file : 'none',
    mostElegant: flasks.length > 0
      ? flasks.reduce((a, b) => b.philosopherPotential > a.philosopherPotential ? b : a, flasks[0]).file : 'none',
    mostExplosive: flasks.length > 0
      ? flasks.reduce((a, b) => b.transmutation.byproductCount > a.transmutation.byproductCount ? b : a, flasks[0]).file : 'none',
  }

  const recommendations = generateRecommendations(flasks, labs, guild, stats)

  return { flasks, labs, guild, stats, recommendations }
}
