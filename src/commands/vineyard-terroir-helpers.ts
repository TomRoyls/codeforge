// ─── Interfaces ──────────────────────────────────────────

export interface SoilMeasure {
  quality: number
  type: 'limestone' | 'clay' | 'gravel' | 'sand' | 'loam' | 'dirt'
  hasMineralComplexity: boolean
  hasGoodDrainage: boolean
  hasDeepTopsoil: boolean
  hasProperPH: boolean
  hasTerroirCharacter: boolean
  hasErosion: boolean
  hasCompaction: boolean
  hasNutrientBalance: boolean
  hasLivingSoil: boolean
  erosionCount: number
}

export interface GrapeMeasure {
  variety: number
  type: 'cabernet-sauvignon' | 'pinot-noir' | 'chardonnay' | 'merlot' | 'riesling' | 'table-grape'
  isNobleVariety: boolean
  hasGeneticPurity: boolean
  hasDiseaseResistance: boolean
  hasOptimalRipeness: boolean
  hasBunchSpacing: boolean
  hasCanopyManagement: boolean
  hasGreenHarvest: boolean
  hasLateHarvest: boolean
  hasIceWine: boolean
  isOrganic: boolean
}

export interface VintageMeasure {
  character: number
  year: 'legendary' | 'exceptional' | 'excellent' | 'good' | 'average' | 'poor'
  isReadyToDrink: boolean
  hasAging: boolean
  hasVintageVariation: boolean
  hasReserveQuality: boolean
  hasGrandCru: boolean
  hasPremierCru: boolean
  hasTableWine: boolean
  hasVintageChart: boolean
  agingYears: number
}

export interface AgingMeasure {
  potential: number
  cellar: 'oak-barrel' | 'stainless-steel' | 'concrete-egg' | 'amphora' | 'bottle' | 'box-wine'
  hasProperTannins: boolean
  hasAcidBalance: boolean
  hasOakTreatment: boolean
  hasMalolactic: boolean
  hasLeesContact: boolean
  hasBottleAge: boolean
  hasCellarWorthiness: boolean
  hasCorkQuality: boolean
  hasSulfiteProtection: boolean
  cellarWorthy: boolean
}

export interface AromaMeasure {
  quality: number
  bouquet: 'complex' | 'elegant' | 'fruity' | 'earthy' | 'simple' | 'corked'
  hasPrimaryAromas: boolean
  hasSecondaryAromas: boolean
  hasTertiaryAromas: boolean
  hasFloralNotes: boolean
  hasFruityCharacter: boolean
  hasMineralNotes: boolean
  hasSpiceComplexity: boolean
  hasOakInfluence: boolean
  hasCorkTaint: boolean
  hasVolatileAcidity: boolean
  corkTaintCount: number
}

export interface BodyMeasure {
  weight: number
  character: 'full-bodied' | 'medium-bodied' | 'light-bodied' | 'watery' | 'syrupy' | 'vinegar'
  hasProperStructure: boolean
  hasBalancedTannins: boolean
  hasSmoothFinish: boolean
  hasLongFinish: boolean
  hasLegs: boolean
  hasTexture: boolean
  hasWeightOnPalate: boolean
  hasAlcoholBalance: boolean
  hasResidualSugar: boolean
  finishLength: number
}

export interface VineyardPlot {
  file: string
  soilQuality: number
  grapeVariety: number
  vintageCharacter: number
  agingPotential: number
  bouquet: number
  bodyScore: number
  soil: SoilMeasure
  grape: GrapeMeasure
  vintage: VintageMeasure
  aging: AgingMeasure
  aroma: AromaMeasure
  body: BodyMeasure
  condition: 'grand-cru' | 'premier-cru' | 'cru-bourgeois' | 'vin-de-pays' | 'table-wine' | 'vinegar'
  qualityScore: number
}

export interface WineRegion {
  directory: string
  plots: VineyardPlot[]
  avgSoilQuality: number
  avgVintageCharacter: number
  avgAgingPotential: number
  grandCruCount: number
  vinegarCount: number
  readyToDrinkCount: number
  cellarWorthyCount: number
  regionType: 'bordeaux' | 'burgundy' | 'napa-valley' | 'rhine' | 'tuscany' | 'backyard'
  condition: 'legendary-region' | 'premium-appellation' | 'quality-region' | 'growing-region' | 'emerging' | 'wasteland'
}

export interface EstateMeasure {
  avgSoilQuality: number
  avgVintageCharacter: number
  avgAgingPotential: number
  isGrandCru: boolean
  overallTerroir: number
}

export interface VineyardTerroirStats {
  totalFiles: number
  totalRegions: number
  avgSoilQuality: number
  avgGrapeVariety: number
  avgVintageCharacter: number
  avgAgingPotential: number
  avgBouquet: number
  avgBody: number
  grandCruCount: number
  premierCruCount: number
  cruBourgeoisCount: number
  vinDePaysCount: number
  tableWineCount: number
  vinegarCount: number
  hasMineralComplexityCount: number
  hasGoodDrainageCount: number
  hasErosionCount: number
  isNobleVarietyCount: number
  isReadyToDrinkCount: number
  hasGrandCruCount: number
  hasProperTanninsCount: number
  hasCellarWorthinessCount: number
  hasComplexBouquetCount: number
  hasCorkTaintCount: number
  hasProperStructureCount: number
  hasSmoothFinishCount: number
  overallTerroir: number
  sommelierGrade: 'master-sommelier' | 'advanced-sommelier' | 'sommelier' | 'wine-steward' | 'enthusiast' | 'box-wine-drinker'
  bestPlot: string
  bestSoil: string
  bestVintage: string
  bestAging: string
  bestBouquet: string
}

export interface VineyardTerroirResult {
  plots: VineyardPlot[]
  regions: WineRegion[]
  estate: EstateMeasure
  stats: VineyardTerroirStats
  recommendations: string[]
}

// ─── Counting Utilities ─────────────────────────────────

/**
 * Count non-empty lines
 * @example
 * countLoc('const a = 1\n\nconst b = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count function declarations
 * @example
 * countFunctions('function foo() {}') // 1
 */
export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

/**
 * Count class declarations
 * @example
 * countClasses('class Foo {}') // 1
 */
export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

/**
 * Count interface declarations
 * @example
 * countInterfaces('interface Foo {}') // 1
 */
export function countInterfaces(content: string): number {
  const m = content.match(/\binterface\s+\w+/g)
  return m ? m.length : 0
}

/**
 * Count type aliases
 * @example
 * countTypes('type Foo = string') // 1
 */
export function countTypes(content: string): number {
  const m = content.match(/\btype\s+\w+\s*=/g)
  return m ? m.length : 0
}

/**
 * Count enum declarations
 * @example
 * countEnums('enum Direction { Up, Down }') // 1
 */
export function countEnums(content: string): number {
  const m = content.match(/\benum\s+\w+/g)
  return m ? m.length : 0
}

/**
 * Count export statements
 * @example
 * countExports('export const a = 1') // 1
 */
export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

/**
 * Count import statements
 * @example
 * countImports("import { foo } from 'bar'") // 1
 */
export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

/**
 * Count JSDoc blocks
 * @example
 * countJSDoc('const x = 1') // 0
 */
export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

/**
 * Count all comments
 * @example
 * countComments('const a = 1 // inline') // 1
 */
export function countComments(content: string): number {
  const line = (content.match(/\/\/.*/g) || []).length
  const block = (content.match(/\/\*[\s\S]*?\*\//g) || []).length
  return line + block
}

/**
 * Count error handling keywords
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  const m = content.match(/\b(catch|finally|throw)\b/g)
  return m ? m.length : 0
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:number|string|boolean|void|any|unknown|never|object)\b/g)
  return m ? m.length : 0
}

/**
 * Count TODO markers
 * @example
 * countTodos('// TODO: fix this') // 1
 */
export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b/gi)
  return m ? m.length : 0
}

/**
 * Count console calls
 * @example
 * countConsole('console.log("hi")') // 1
 */
export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

/**
 * Count branches (if, switch, ternary)
 * @example
 * countBranches('if (x) {}') // 1
 */
export function countBranches(content: string): number {
  const ifs = (content.match(/\bif\b/g) || []).length
  const switches = (content.match(/\bswitch\b/g) || []).length
  const ternaries = (content.match(/\?\s*[^;:]*\s*:/g) || []).length
  return ifs + switches + ternaries
}

/**
 * Count descriptive names
 * @example
 * countDescriptiveNames('function getData() {}') // 1
 */
export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

/**
 * Count default keywords
 * @example
 * countDefaults('export default class {}') // 1
 */
export function countDefaults(content: string): number {
  const m = content.match(/\bdefault\b/g)
  return m ? m.length : 0
}

/**
 * Count deprecated markers
 * @example
 * countDeprecated('@deprecated use newApi') // 1
 */
export function countDeprecated(content: string): number {
  const m = content.match(/\bdeprecated\b|\@deprecated/gi)
  return m ? m.length : 0
}

/**
 * Count return type annotations
 * @example
 * countReturnTypes('function foo(): string {}') // 1
 */
export function countReturnTypes(content: string): number {
  const m = content.match(/\)\s*:\s*\w+/g)
  return m ? m.length : 0
}

/**
 * Count generic type parameters
 * @example
 * countGenerics('function foo<T>() {}') // 1
 */
export function countGenerics(content: string): number {
  const m = content.match(/<\w+>/g)
  return m ? m.length : 0
}

/**
 * Count arrow functions
 * @example
 * countArrowFunctions('const f = () => 1') // 1
 */
export function countArrowFunctions(content: string): number {
  const m = content.match(/=>/g)
  return m ? m.length : 0
}

/**
 * Count async keywords
 * @example
 * countAsync('async function foo() {}') // 1
 */
export function countAsync(content: string): number {
  const m = content.match(/\basync\b/g)
  return m ? m.length : 0
}

/**
 * Count await keywords
 * @example
 * countAwait('await foo()') // 1
 */
export function countAwait(content: string): number {
  const m = content.match(/\bawait\b/g)
  return m ? m.length : 0
}

// ─── Soil Measurement ───────────────────────────────────

/**
 * Measure foundation quality
 * @example
 * measureSoil('interface Foo { x: number }') // { quality, type, hasMineralComplexity, ... }
 */
export function measureSoil(content: string): SoilMeasure {
  const loc = countLoc(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const errors = countErrorHandling(content)
  const todos = countTodos(content)
  const deprecated = countDeprecated(content)
  const consoleCalls = countConsole(content)

  const quality = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (interfaces > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0) +
    (errors > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (todos === 0 ? 10 : 0) +
    (consoleCalls === 0 ? 5 : 0),
  )))

  const hasMineralComplexity = interfaces > 0 && countGenerics(content) > 0
  const hasGoodDrainage = imports > 0 && exports > 0
  const hasDeepTopsoil = loc > 30 && countFunctions(content) > 0
  const hasProperPH = types > 0 && countBranches(content) < types * 3
  const hasTerroirCharacter = interfaces > 0 && types > 0 && countDescriptiveNames(content) > 0
  const erosionCount = todos + deprecated + consoleCalls
  const hasErosion = erosionCount > 0
  const hasCompaction = countBranches(content) > countFunctions(content) * 5 && countFunctions(content) > 0
  const hasNutrientBalance = imports > 0 && exports > 0 && interfaces > 0
  const hasLivingSoil = countJSDoc(content) > 0 && types > 0

  let type: SoilMeasure['type'] = 'dirt'
  if (quality >= 75) type = 'limestone'
  else if (quality >= 55 && hasMineralComplexity) type = 'clay'
  else if (quality >= 45 && hasGoodDrainage) type = 'gravel'
  else if (quality >= 30 && hasNutrientBalance) type = 'loam'
  else if (quality >= 20) type = 'sand'

  return {
    quality,
    type,
    hasMineralComplexity,
    hasGoodDrainage,
    hasDeepTopsoil,
    hasProperPH,
    hasTerroirCharacter,
    hasErosion,
    hasCompaction,
    hasNutrientBalance,
    hasLivingSoil,
    erosionCount,
  }
}

// ─── Grape Measurement ──────────────────────────────────

/**
 * Measure code variety and patterns
 * @example
 * measureGrape('export function foo(): void {}') // { variety, type, isNobleVariety, ... }
 */
export function measureGrape(content: string): GrapeMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypes(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const async = countAsync(content)
  const generics = countGenerics(content)
  const arrow = countArrowFunctions(content)
  const errors = countErrorHandling(content)

  const palette: string[] = []
  if (functions > 0) palette.push('function')
  if (classes > 0) palette.push('class')
  if (interfaces > 0) palette.push('interface')
  if (types > 0) palette.push('type')
  if (exports > 0) palette.push('export')
  if (imports > 0) palette.push('import')
  if (async > 0) palette.push('async')
  if (generics > 0) palette.push('generic')
  if (arrow > 0) palette.push('arrow')

  const variety = loc === 0 ? 5 : Math.min(100, Math.max(0, Math.round(
    (palette.length * 9) +
    (functions > 0 ? 4 : 0) +
    (classes > 0 ? 4 : 0) +
    (interfaces > 0 ? 4 : 0),
  )))

  const isNobleVariety = interfaces > 0 && exports > 0 && errors > 0
  const hasGeneticPurity = palette.length > 0 && !hasConflictingPatterns(content)
  const hasDiseaseResistance = errors > 0 && countTypeAnnotations(content) > 0
  const hasOptimalRipeness = countJSDoc(content) > 0 && countReturnTypes(content) > 0
  const hasBunchSpacing = functions > 0 && functions <= 10
  const hasCanopyManagement = countBranches(content) <= functions * 3 && functions > 0
  const hasGreenHarvest = countTodos(content) === 0 && countDeprecated(content) === 0
  const hasLateHarvest = countDescriptiveNames(content) > 3
  const hasIceWine = generics > 0 && async > 0
  const isOrganic = countDescriptiveNames(content) > 0 && countJSDoc(content) > 0

  let type: GrapeMeasure['type'] = 'table-grape'
  if (isNobleVariety && variety >= 50) type = 'cabernet-sauvignon'
  else if (hasGeneticPurity && variety >= 40) type = 'pinot-noir'
  else if (hasOptimalRipeness && variety >= 35) type = 'chardonnay'
  else if (variety >= 30 && functions > 0) type = 'merlot'
  else if (generics > 0 || async > 0) type = 'riesling'

  return {
    variety,
    type,
    isNobleVariety,
    hasGeneticPurity,
    hasDiseaseResistance,
    hasOptimalRipeness,
    hasBunchSpacing,
    hasCanopyManagement,
    hasGreenHarvest,
    hasLateHarvest,
    hasIceWine,
    isOrganic,
  }
}

/**
 * Check for conflicting patterns
 * @example
 * hasConflictingPatterns('var x = 1; let y = 2') // true
 */
export function hasConflictingPatterns(content: string): boolean {
  const hasVar = /\bvar\b/g.test(content)
  const hasLet = /\blet\b/g.test(content)
  const hasConst = /\bconst\b/g.test(content)
  return (hasVar && hasLet) || (hasVar && hasConst)
}

// ─── Vintage Measurement ────────────────────────────────

/**
 * Measure code maturity
 * @example
 * measureVintage('export function foo(): void {}') // { character, year, isReadyToDrink, ... }
 */
export function measureVintage(content: string): VintageMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const returns = countReturnTypes(content)
  const errors = countErrorHandling(content)
  const descriptives = countDescriptiveNames(content)

  const character = loc === 0 ? 5 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (returns > 0 ? 10 : 0) +
    (errors > 0 ? 10 : 0) +
    (descriptives > 0 ? 10 : 0) +
    (countComments(content) > 0 ? 5 : 0) +
    (loc < 100 ? 5 : 0),
  )))

  let year: VintageMeasure['year'] = 'poor'
  if (character >= 85) year = 'legendary'
  else if (character >= 70) year = 'exceptional'
  else if (character >= 55) year = 'excellent'
  else if (character >= 40) year = 'good'
  else if (character >= 20) year = 'average'

  const isReadyToDrink = exports > 0 && types > 0 && jsdoc > 0
  const hasAging = countAsync(content) > 0 || countAwait(content) > 0
  const hasVintageVariation = countBranches(content) > 2
  const hasReserveQuality = errors > 0 && descriptives > 0
  const hasGrandCru = character >= 80 && jsdoc >= 2 && types > 3
  const hasPremierCru = character >= 60 && jsdoc > 0 && types > 0
  const hasTableWine = loc > 0 && jsdoc === 0 && types === 0
  const hasVintageChart = countComments(content) > 0 && jsdoc > 0
  const agingYears = Math.min(20, Math.max(0, Math.round(character / 5)))

  return {
    character,
    year,
    isReadyToDrink,
    hasAging,
    hasVintageVariation,
    hasReserveQuality,
    hasGrandCru,
    hasPremierCru,
    hasTableWine,
    hasVintageChart,
    agingYears,
  }
}

// ─── Aging Measurement ──────────────────────────────────

/**
 * Measure maintainability
 * @example
 * measureAging('try { foo() } catch(e) {}') // { potential, cellar, hasProperTannins, ... }
 */
export function measureAging(content: string): AgingMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const errors = countErrorHandling(content)
  const jsdoc = countJSDoc(content)
  const generics = countGenerics(content)
  const returns = countReturnTypes(content)

  const potential = loc === 0 ? 5 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 15 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (errors > 0 ? 15 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (returns > 0 ? 10 : 0) +
    (generics > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))

  const hasProperTannins = interfaces > 0 && types > 0
  const hasAcidBalance = errors > 0 && types > 0
  const hasOakTreatment = jsdoc > 0 && returns > 0
  const hasMalolactic = errors > 0 && countDefaults(content) > 0
  const hasLeesContact = countAsync(content) > 0 || countAwait(content) > 0
  const hasBottleAge = loc > 20 && jsdoc > 0
  const hasCorkQuality = interfaces > 0 && exports > 0
  const hasSulfiteProtection = errors > 0 && types > 0
  const cellarWorthy = potential >= 50
  const hasCellarWorthiness = cellarWorthy

  let cellar: AgingMeasure['cellar'] = 'box-wine'
  if (generics > 0 && interfaces > 0) cellar = 'oak-barrel'
  else if (errors > 0 && types > 0) cellar = 'stainless-steel'
  else if (interfaces > 0 && jsdoc > 0) cellar = 'concrete-egg'
  else if (types > 0 && exports > 0) cellar = 'amphora'
  else if (potential >= 30) cellar = 'bottle'

  return {
    potential,
    cellar,
    hasProperTannins,
    hasAcidBalance,
    hasOakTreatment,
    hasMalolactic,
    hasLeesContact,
    hasBottleAge,
    hasCellarWorthiness,
    hasCorkQuality,
    hasSulfiteProtection,
    cellarWorthy,
  }
}

// ─── Aroma Measurement ──────────────────────────────────

/**
 * Measure code elegance
 * @example
 * measureAroma('function getData(): string {}') // { quality, bouquet, hasPrimaryAromas, ... }
 */
export function measureAroma(content: string): AromaMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const descriptives = countDescriptiveNames(content)
  const errors = countErrorHandling(content)
  const todos = countTodos(content)
  const consoleCalls = countConsole(content)
  const deprecated = countDeprecated(content)

  const quality = loc === 0 ? 5 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 25 : 0) +
    (comments > 0 ? 10 : 0) +
    (types > 0 ? 15 : 0) +
    (descriptives > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (countReturnTypes(content) > 0 ? 10 : 0) +
    (errors > 0 ? 10 : 0) +
    (todos === 0 ? 5 : 0),
  )))

  const hasPrimaryAromas = exports > 0 || countImports(content) > 0
  const hasSecondaryAromas = countFunctions(content) > 0 || countClasses(content) > 0
  const hasTertiaryAromas = jsdoc > 0 && types > 0 && countGenerics(content) > 0
  const hasFloralNotes = descriptives > 0 && jsdoc > 0
  const hasFruityCharacter = countFunctions(content) > 0 && exports > 0
  const hasMineralNotes = countInterfaces(content) > 0 && types > 0
  const hasSpiceComplexity = errors > 0 && countBranches(content) > 0
  const hasOakInfluence = jsdoc > 0 && countReturnTypes(content) > 0
  const corkTaintCount = todos + consoleCalls + deprecated
  const hasCorkTaint = corkTaintCount > 0
  const hasVolatileAcidity = consoleCalls > 3 || todos > 3

  let bouquet: AromaMeasure['bouquet'] = 'simple'
  if (hasTertiaryAromas && quality >= 70) bouquet = 'complex'
  else if (hasFloralNotes && quality >= 55) bouquet = 'elegant'
  else if (hasFruityCharacter && quality >= 40) bouquet = 'fruity'
  else if (hasMineralNotes && quality >= 30) bouquet = 'earthy'
  else if (hasCorkTaint && quality < 25) bouquet = 'corked'

  return {
    quality,
    bouquet,
    hasPrimaryAromas,
    hasSecondaryAromas,
    hasTertiaryAromas,
    hasFloralNotes,
    hasFruityCharacter,
    hasMineralNotes,
    hasSpiceComplexity,
    hasOakInfluence,
    hasCorkTaint,
    hasVolatileAcidity,
    corkTaintCount,
  }
}

// ─── Body Measurement ───────────────────────────────────

/**
 * Measure code weight and substance
 * @example
 * measureBody('class Handler { process() {} cleanup() {} }') // { weight, character, hasProperStructure, ... }
 */
export function measureBody(content: string): BodyMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const branches = countBranches(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const errors = countErrorHandling(content)

  const weight = loc === 0 ? 5 : Math.min(100, Math.max(0, Math.round(
    (functions * 6) +
    (classes * 10) +
    (interfaces * 5) +
    (branches * 3) +
    (countEnums(content) * 4) +
    (countTypes(content) * 3),
  )))

  const hasProperStructure = imports > 0 && exports > 0
  const hasBalancedTannins = functions > 0 && branches <= functions * 4
  const hasSmoothFinish = errors > 0 && countReturnTypes(content) > 0
  const hasLongFinish = countDescriptiveNames(content) > 2 && countJSDoc(content) > 0
  const hasLegs = classes > 0 && functions > 0
  const hasTexture = countAsync(content) > 0 || countGenerics(content) > 0
  const hasWeightOnPalate = functions > 3 || classes > 1
  const hasAlcoholBalance = weight > 20 && hasBalancedTannins
  const hasResidualSugar = countJSDoc(content) > 0 && countComments(content) > 0
  const finishLength = Math.min(100, Math.max(0, Math.round(
    (countJSDoc(content) > 0 ? 30 : 0) +
    (exports > 0 ? 20 : 0) +
    (errors > 0 ? 20 : 0) +
    (countDescriptiveNames(content) > 0 ? 20 : 0) +
    (countReturnTypes(content) > 0 ? 10 : 0),
  )))

  let char: BodyMeasure['character'] = 'watery'
  if (weight >= 70) char = 'full-bodied'
  else if (weight >= 45) char = 'medium-bodied'
  else if (weight >= 25) char = 'light-bodied'
  else if (weight >= 50 && branches > functions * 5) char = 'syrupy'
  else if (weight < 10 && loc > 10) char = 'vinegar'

  return {
    weight,
    character: char,
    hasProperStructure,
    hasBalancedTannins,
    hasSmoothFinish,
    hasLongFinish,
    hasLegs,
    hasTexture,
    hasWeightOnPalate,
    hasAlcoholBalance,
    hasResidualSugar,
    finishLength,
  }
}

// ─── Plot Analysis ──────────────────────────────────────

/**
 * Analyze a single file as a vineyard plot
 * @example
 * analyzeVineyardPlot(content, filePath) // VineyardPlot
 */
export function analyzeVineyardPlot(content: string, filePath: string): VineyardPlot {
  const soil = measureSoil(content)
  const grape = measureGrape(content)
  const vintage = measureVintage(content)
  const aging = measureAging(content)
  const aroma = measureAroma(content)
  const body = measureBody(content)

  const soilQuality = soil.quality
  const grapeVariety = grape.variety
  const vintageCharacter = vintage.character
  const agingPotential = aging.potential
  const bouquet = aroma.quality
  const bodyScore = body.weight

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (soilQuality * 0.20) +
    (grapeVariety * 0.15) +
    (vintageCharacter * 0.20) +
    (agingPotential * 0.15) +
    (bouquet * 0.15) +
    (bodyScore * 0.15),
  )))

  const condition = classifyCondition(qualityScore, soil, vintage)

  return {
    file: filePath,
    soilQuality,
    grapeVariety,
    vintageCharacter,
    agingPotential,
    bouquet,
    bodyScore: bodyScore,
    soil,
    grape,
    vintage,
    aging,
    aroma,
    body,
    condition,
    qualityScore,
  }
}

/**
 * Classify plot condition
 * @example
 * classifyCondition(90, soil, vintage) // 'grand-cru'
 */
export function classifyCondition(
  score: number,
  soil: SoilMeasure,
  vintage: VintageMeasure,
): VineyardPlot['condition'] {
  if (score >= 80 && soil.hasMineralComplexity && vintage.isReadyToDrink) return 'grand-cru'
  if (score >= 65 && soil.hasTerroirCharacter) return 'premier-cru'
  if (score >= 50) return 'cru-bourgeois'
  if (score >= 35) return 'vin-de-pays'
  if (score >= 20) return 'table-wine'
  return 'vinegar'
}

// ─── Region Analysis ────────────────────────────────────

/**
 * Analyze a directory as a wine region
 * @example
 * analyzeWineRegion(plots, dirPath) // WineRegion
 */
export function analyzeWineRegion(plots: VineyardPlot[], dirPath: string): WineRegion {
  const count = plots.length
  if (count === 0) {
    return {
      directory: dirPath,
      plots: [],
      avgSoilQuality: 0,
      avgVintageCharacter: 0,
      avgAgingPotential: 0,
      grandCruCount: 0,
      vinegarCount: 0,
      readyToDrinkCount: 0,
      cellarWorthyCount: 0,
      regionType: 'backyard',
      condition: 'wasteland',
    }
  }

  const avgSoilQuality = Math.round(plots.reduce((s, p) => s + p.soilQuality, 0) / count)
  const avgVintageCharacter = Math.round(plots.reduce((s, p) => s + p.vintageCharacter, 0) / count)
  const avgAgingPotential = Math.round(plots.reduce((s, p) => s + p.agingPotential, 0) / count)

  const grandCruCount = plots.filter(p => p.condition === 'grand-cru').length
  const vinegarCount = plots.filter(p => p.condition === 'vinegar').length
  const readyToDrinkCount = plots.filter(p => p.vintage.isReadyToDrink).length
  const cellarWorthyCount = plots.filter(p => p.aging.cellarWorthy).length

  const regionType = classifyRegionType(plots, avgSoilQuality)
  const condition = classifyRegionCondition(avgSoilQuality)

  return {
    directory: dirPath,
    plots,
    avgSoilQuality,
    avgVintageCharacter,
    avgAgingPotential,
    grandCruCount,
    vinegarCount,
    readyToDrinkCount,
    cellarWorthyCount,
    regionType,
    condition,
  }
}

/**
 * Classify region type
 * @example
 * classifyRegionType(plots, 80) // 'bordeaux'
 */
export function classifyRegionType(plots: VineyardPlot[], avgSoil: number): WineRegion['regionType'] {
  if (plots.length === 0) return 'backyard'
  const grandRatio = plots.filter(p => p.condition === 'grand-cru').length / plots.length
  const allGood = plots.every(p => p.qualityScore >= 50)

  if (grandRatio >= 0.5 && avgSoil >= 70) return 'bordeaux'
  if (allGood && avgSoil >= 55) return 'burgundy'
  if (avgSoil >= 50) return 'napa-valley'
  if (avgSoil >= 35) return 'rhine'
  if (avgSoil >= 20) return 'tuscany'
  return 'backyard'
}

/**
 * Classify region condition
 * @example
 * classifyRegionCondition(80) // 'legendary-region'
 */
export function classifyRegionCondition(avgSoil: number): WineRegion['condition'] {
  if (avgSoil >= 75) return 'legendary-region'
  if (avgSoil >= 60) return 'premium-appellation'
  if (avgSoil >= 45) return 'quality-region'
  if (avgSoil >= 30) return 'growing-region'
  if (avgSoil >= 15) return 'emerging'
  return 'wasteland'
}

// ─── Sommelier Grade ────────────────────────────────────

/**
 * Classify sommelier grade from terroir
 * @example
 * classifySommelierGrade(90) // 'master-sommelier'
 */
export function classifySommelierGrade(avgTerroir: number): VineyardTerroirStats['sommelierGrade'] {
  if (avgTerroir >= 75) return 'master-sommelier'
  if (avgTerroir >= 60) return 'advanced-sommelier'
  if (avgTerroir >= 45) return 'sommelier'
  if (avgTerroir >= 30) return 'wine-steward'
  if (avgTerroir >= 15) return 'enthusiast'
  return 'box-wine-drinker'
}

// ─── Recommendations ────────────────────────────────────

/**
 * Generate terroir recommendations
 * @example
 * generateRecommendations(plots, regions, estate, stats) // ['Add interfaces...']
 */
export function generateRecommendations(
  _plots: VineyardPlot[],
  _regions: WineRegion[],
  _estate: EstateMeasure,
  stats: VineyardTerroirStats,
): string[] {
  const recs: string[] = []

  if (stats.vinegarCount > 0) {
    recs.push('Add documentation and type annotations to restore vinegar plots')
  }
  if (stats.hasCorkTaintCount > stats.totalFiles * 0.3) {
    recs.push('Remove TODOs, console calls, and deprecated markers to eliminate cork taint')
  }
  if (stats.hasErosionCount > stats.totalFiles * 0.4) {
    recs.push('Address technical debt to prevent soil erosion')
  }
  if (stats.avgSoilQuality < 35) {
    recs.push('Define interfaces and type annotations to enrich soil quality')
  }
  if (stats.avgAgingPotential < 35) {
    recs.push('Add error handling and JSDoc to improve aging potential')
  }
  if (stats.isNobleVarietyCount < stats.totalFiles * 0.2) {
    recs.push('Adopt interfaces, exports, and error handling for noble grape varieties')
  }
  if (stats.hasProperStructureCount < stats.totalFiles * 0.3) {
    recs.push('Balance imports and exports for proper structural body')
  }
  if (stats.hasSmoothFinishCount < stats.totalFiles * 0.3) {
    recs.push('Add error handling and return types for a smoother finish')
  }

  if (recs.length === 0) {
    recs.push('This vineyard produces exceptional terroir — maintain current practices')
  }

  return recs
}

// ─── Orchestrator ───────────────────────────────────────

/**
 * Build the full vineyard terroir result
 * @example
 * buildVineyardTerroirResult(files, contents, {}) // VineyardTerroirResult
 */
export function buildVineyardTerroirResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown> = {},
): VineyardTerroirResult {
  const plots: VineyardPlot[] = files.map((file, i) =>
    analyzeVineyardPlot(contents[i] ?? '', file),
  )

  const regionMap = new Map<string, VineyardPlot[]>()
  for (const plot of plots) {
    const dir = plot.file.includes('/') ? plot.file.substring(0, plot.file.lastIndexOf('/')) : '.'
    const existing = regionMap.get(dir)
    if (existing) {
      existing.push(plot)
    } else {
      regionMap.set(dir, [plot])
    }
  }

  const regions: WineRegion[] = Array.from(regionMap.entries()).map(([dir, rPlots]) =>
    analyzeWineRegion(rPlots, dir),
  )

  const totalFiles = plots.length
  const avg = (fn: (p: VineyardPlot) => number) =>
    totalFiles === 0 ? 0 : Math.round(plots.reduce((s, p) => s + fn(p), 0) / totalFiles)

  const overallTerroir = avg(p => p.qualityScore)

  const estate: EstateMeasure = {
    avgSoilQuality: avg(p => p.soilQuality),
    avgVintageCharacter: avg(p => p.vintageCharacter),
    avgAgingPotential: avg(p => p.agingPotential),
    isGrandCru: overallTerroir >= 75,
    overallTerroir,
  }

  const bestPlot = plots.length > 0
    ? plots.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best, plots[0] as typeof plots[number]).file
    : ''
  const bestSoil = plots.length > 0
    ? plots.reduce((best, p) => p.soilQuality > best.soilQuality ? p : best, plots[0] as typeof plots[number]).file
    : ''
  const bestVintage = plots.length > 0
    ? plots.reduce((best, p) => p.vintageCharacter > best.vintageCharacter ? p : best, plots[0] as typeof plots[number]).file
    : ''
  const bestAging = plots.length > 0
    ? plots.reduce((best, p) => p.agingPotential > best.agingPotential ? p : best, plots[0] as typeof plots[number]).file
    : ''
  const bestBouquet = plots.length > 0
    ? plots.reduce((best, p) => p.bouquet > best.bouquet ? p : best, plots[0] as typeof plots[number]).file
    : ''

  const stats: VineyardTerroirStats = {
    totalFiles,
    totalRegions: regions.length,
    avgSoilQuality: estate.avgSoilQuality,
    avgGrapeVariety: avg(p => p.grapeVariety),
    avgVintageCharacter: estate.avgVintageCharacter,
    avgAgingPotential: estate.avgAgingPotential,
    avgBouquet: avg(p => p.bouquet),
    avgBody: avg(p => p.bodyScore),
    grandCruCount: plots.filter(p => p.condition === 'grand-cru').length,
    premierCruCount: plots.filter(p => p.condition === 'premier-cru').length,
    cruBourgeoisCount: plots.filter(p => p.condition === 'cru-bourgeois').length,
    vinDePaysCount: plots.filter(p => p.condition === 'vin-de-pays').length,
    tableWineCount: plots.filter(p => p.condition === 'table-wine').length,
    vinegarCount: plots.filter(p => p.condition === 'vinegar').length,
    hasMineralComplexityCount: plots.filter(p => p.soil.hasMineralComplexity).length,
    hasGoodDrainageCount: plots.filter(p => p.soil.hasGoodDrainage).length,
    hasErosionCount: plots.filter(p => p.soil.hasErosion).length,
    isNobleVarietyCount: plots.filter(p => p.grape.isNobleVariety).length,
    isReadyToDrinkCount: plots.filter(p => p.vintage.isReadyToDrink).length,
    hasGrandCruCount: plots.filter(p => p.vintage.hasGrandCru).length,
    hasProperTanninsCount: plots.filter(p => p.aging.hasProperTannins).length,
    hasCellarWorthinessCount: plots.filter(p => p.aging.cellarWorthy).length,
    hasComplexBouquetCount: plots.filter(p => p.aroma.bouquet === 'complex').length,
    hasCorkTaintCount: plots.filter(p => p.aroma.hasCorkTaint).length,
    hasProperStructureCount: plots.filter(p => p.body.hasProperStructure).length,
    hasSmoothFinishCount: plots.filter(p => p.body.hasSmoothFinish).length,
    overallTerroir,
    sommelierGrade: classifySommelierGrade(overallTerroir),
    bestPlot,
    bestSoil,
    bestVintage,
    bestAging,
    bestBouquet,
  }

  const recommendations = generateRecommendations(plots, regions, estate, stats)

  return { plots, regions, estate, stats, recommendations }
}
