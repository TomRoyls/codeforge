// ─── Interfaces ──────────────────────────────────────────────────────────────

/** @example { quality: 100, clarity: 'crystal', isClean: true } */
export interface WaterMeasure {
  quality: number
  clarity: 'crystal' | 'clear' | 'cloudy' | 'murky' | 'polluted' | 'toxic'
  isClean: boolean
  hasProperPH: boolean
  hasOxygenated: boolean
  hasNoAlgaeBloom: boolean
  hasNoPollutants: boolean
  hasNaturalFiltration: boolean
  hasAeration: boolean
  hasProperTemperature: boolean
  hasSedimentControl: boolean
  pollutantCount: number
}

/** @example { diversity: 80, role: 'producer', isNative: true } */
export interface SpeciesMeasure {
  diversity: number
  role: 'producer' | 'primary-consumer' | 'secondary-consumer' | 'decomposer' | 'predator' | 'parasite'
  isNative: boolean
  isInvasive: boolean
  isKeystone: boolean
  hasSymbiosis: boolean
  hasMutualism: boolean
  hasCommensalism: boolean
  hasParasitism: boolean
  hasAdaptation: boolean
  hasEvolution: boolean
  hasExtinction: boolean
  symbiosisCount: number
  parasitismCount: number
}

/** @example { health: 80, trophicLevel: 3, position: 'middle' } */
export interface ChainMeasure {
  health: number
  trophicLevel: number
  position: 'apex' | 'top' | 'middle' | 'bottom' | 'base' | 'sediment'
  hasBalancedDiet: boolean
  hasNoOverpopulation: boolean
  hasNoStarvation: boolean
  hasEfficientTransfer: boolean
  hasEnergyConservation: boolean
  hasNoBioaccumulation: boolean
  hasDecompositionPath: boolean
  hasNutrientRecycling: boolean
  hasTopDownControl: boolean
  hasBottomUpControl: boolean
  dependencyCount: number
  dependentCount: number
}

/** @example { level: 90, state: 'saturated', isFresh: true } */
export interface OxygenMeasure {
  level: number
  state: 'saturated' | 'healthy' | 'adequate' | 'low' | 'hypoxic' | 'anoxic'
  isFresh: boolean
  hasDissolvedOxygen: boolean
  hasSurfaceAgitation: boolean
  hasPhotosynthesis: boolean
  hasRespiration: boolean
  hasDecomposition: boolean
  hasAlgaeContribution: boolean
  hasNighttimeDrop: boolean
  hasStratification: boolean
  hasThermalPollution: boolean
  pollutionCount: number
}

/** @example { cycle: 80, efficiency: 'efficient', hasNitrogenCycle: true } */
export interface NutrientMeasure {
  cycle: number
  efficiency: 'closed-loop' | 'efficient' | 'moderate' | 'leaky' | 'broken' | 'absent'
  hasNitrogenCycle: boolean
  hasCarbonCycle: boolean
  hasPhosphorusCycle: boolean
  hasDecomposition: boolean
  hasUptake: boolean
  hasRelease: boolean
  hasFixation: boolean
  hasDenitrification: boolean
  hasEutrophication: boolean
  hasNutrientLoading: boolean
  cycleCount: number
}

/** @example { score: 85, state: 'equilibrium', isBalanced: true } */
export interface BalanceMeasure {
  score: number
  state: 'equilibrium' | 'stable' | 'shifting' | 'unstable' | 'collapsing' | 'dead'
  isBalanced: boolean
  hasPredatorPreyBalance: boolean
  hasCompetitiveExclusion: boolean
  hasResourcePartitioning: boolean
  hasEcologicalNiche: boolean
  hasCarryingCapacity: boolean
  hasSuccession: boolean
  hasDisturbance: boolean
  hasResilience: boolean
  hasResistance: boolean
  nicheCount: number
}

export type OrganismCondition =
  | 'pristine-ecosystem'
  | 'healthy-pond'
  | 'balanced-habitat'
  | 'stressed-pond'
  | 'polluted-water'
  | 'dead-zone'

/** @example { file: 'a.ts', waterQuality: 95, qualityScore: 92 } */
export interface PondOrganism {
  file: string
  waterQuality: number
  biodiversity: number
  foodChain: number
  oxygenLevel: number
  nutrientCycle: number
  ecosystemBalance: number
  water: WaterMeasure
  species: SpeciesMeasure
  chain: ChainMeasure
  oxygen: OxygenMeasure
  nutrient: NutrientMeasure
  balance: BalanceMeasure
  condition: OrganismCondition
  qualityScore: number
}

export type HabitatType =
  | 'mountain-lake'
  | 'koi-pond'
  | 'garden-pond'
  | 'retention-pond'
  | 'drainage-ditch'
  | 'cesspool'

export type HabitatCondition =
  | 'nature-reserve'
  | 'botanical-garden'
  | 'park-pond'
  | 'farm-pond'
  | 'drainage-basin'
  | 'toxic-dump'

/** @example { directory: 'src', avgWaterQuality: 85 } */
export interface PondHabitat {
  directory: string
  organisms: PondOrganism[]
  avgWaterQuality: number
  avgBiodiversity: number
  avgBalance: number
  pristineCount: number
  deadZoneCount: number
  balancedCount: number
  nativeCount: number
  habitatType: HabitatType
  condition: HabitatCondition
}

export type EcologistGrade =
  | 'chief-ecologist'
  | 'senior-ecologist'
  | 'ecologist'
  | 'naturalist'
  | 'angler'
  | 'polluter'

/** @example { totalFiles: 5, overallHealth: 78, ecologistGrade: 'ecologist' } */
export interface EcosystemPondStats {
  totalFiles: number
  totalHabitats: number
  avgWaterQuality: number
  avgBiodiversity: number
  avgFoodChain: number
  avgOxygenLevel: number
  avgNutrientCycle: number
  avgEcosystemBalance: number
  pristineEcosystemCount: number
  healthyPondCount: number
  balancedHabitatCount: number
  stressedPondCount: number
  pollutedWaterCount: number
  deadZoneCount: number
  isCleanCount: number
  hasNoPollutantsCount: number
  isNativeCount: number
  isInvasiveCount: number
  hasSymbiosisCount: number
  hasParasitismCount: number
  hasBalancedDietCount: number
  isFreshCount: number
  hasEutrophicationCount: number
  isBalancedCount: number
  hasResilienceCount: number
  hasEcologicalNicheCount: number
  overallHealth: number
  ecologistGrade: EcologistGrade
  bestOrganism: string
  cleanestWater: string
  mostDiverse: string
  healthiestChain: string
  freshestCode: string
}

export interface EcosystemPondResult {
  organisms: PondOrganism[]
  habitats: PondHabitat[]
  watershed: {
    avgWaterQuality: number
    avgBiodiversity: number
    avgBalance: number
    isHealthy: boolean
    overallHealth: number
  }
  stats: EcosystemPondStats
  recommendations: string[]
}

// ─── Counting Helpers ────────────────────────────────────────────────────────

/** @example countLoc('a\nb\nc') returns 3 */
export function countLoc(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter((l) => l.trim().length > 0).length
}

/** @example countFunctions('function foo() {}') returns 1 */
export function countFunctions(content: string): number {
  const matches = content.match(/(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:\([^)]*\)|[^=])\s*=>)/g)
  return matches ? matches.length : 0
}

/** @example countClasses('class A {}') returns 1 */
export function countClasses(content: string): number {
  const matches = content.match(/\bclass\s+\w+/g)
  return matches ? matches.length : 0
}

/** @example countInterfaces('interface Foo {}') returns 1 */
export function countInterfaces(content: string): number {
  const matches = content.match(/\binterface\s+\w+/g)
  return matches ? matches.length : 0
}

/** @example countTypes('type X = string') returns 1 */
export function countTypes(content: string): number {
  const matches = content.match(/\btype\s+\w+\s*=/g)
  return matches ? matches.length : 0
}

/** @example countExports('export const a = 1') returns 1 */
export function countExports(content: string): number {
  const matches = content.match(/\bexport\s+/g)
  return matches ? matches.length : 0
}

/** @example countImports("import { x } from 'y'") returns 1 */
export function countImports(content: string): number {
  const matches = content.match(/\bimport\s+/g)
  return matches ? matches.length : 0
}

/** @example countJSDoc('/** doc *\/') returns 1 */
export function countJSDoc(content: string): number {
  const matches = content.match(/\/\*\*[\s\S]*?\*\//g)
  return matches ? matches.length : 0
}

/** @example countComments('// inline\n/* block *\/') returns 2 */
export function countComments(content: string): number {
  let count = 0
  const inline = content.match(/\/\/.*/g)
  if (inline) count += inline.length
  const block = content.match(/\/\*[\s\S]*?\*\//g)
  if (block) count += block.length
  return count
}

/** @example countErrorHandling('try {} catch(e) {}') returns 1 */
export function countErrorHandling(content: string): number {
  const matches = content.match(/\btry\s*\{/g)
  return matches ? matches.length : 0
}

/** @example countTypeAnnotations('const x: number = 1') returns 1 */
export function countTypeAnnotations(content: string): number {
  const matches = content.match(/:\s*(?:string|number|boolean|void|any|unknown|never|object|null|undefined|readonly)/g)
  return matches ? matches.length : 0
}

/** @example countTodos('// TODO: fix') returns 1 */
export function countTodos(content: string): number {
  const matches = content.match(/TODO/g)
  return matches ? matches.length : 0
}

/** @example countConsole('console.log(1)') returns 1 */
export function countConsole(content: string): number {
  const matches = content.match(/\bconsole\.\w+/g)
  return matches ? matches.length : 0
}

/** @example countBranches('if (x) {}') returns 1 */
export function countBranches(content: string): number {
  const matches = content.match(/\bif\s*\(/g)
  return matches ? matches.length : 0
}

/** @example countDescriptiveNames('function getData() {}') returns 1 */
export function countDescriptiveNames(content: string): number {
  const matches = content.match(/\b(?:get|set|is|has|can|should|will|handle|process|validate|check|parse|format|transform|build|create|read|write|update|delete|remove|add|find|search|filter|sort|compute|calculate|generate|extract|convert|merge|split)\w+/gi)
  return matches ? matches.length : 0
}

/** @example countDefaults('export default class {}') returns 1 */
export function countDefaults(content: string): number {
  const matches = content.match(/\bexport\s+default\b/g)
  return matches ? matches.length : 0
}

/** @example countDeprecated('@deprecated') returns 1 */
export function countDeprecated(content: string): number {
  const matches = content.match(/@deprecated/g)
  return matches ? matches.length : 0
}

/** @example countReturnTypes('function foo(): string {}') returns 1 */
export function countReturnTypes(content: string): number {
  const matches = content.match(/\)\s*:\s*(?:string|number|boolean|void|any|unknown|never|object)/g)
  return matches ? matches.length : 0
}

/** @example countGenerics('function foo<T>() {}') returns 1 */
export function countGenerics(content: string): number {
  const matches = content.match(/<[A-Z]\w*>/g)
  return matches ? matches.length : 0
}

/** @example countPrivateMembers('private x: number') returns 1 */
export function countPrivateMembers(content: string): number {
  const matches = content.match(/\bprivate\s+\w+/g)
  return matches ? matches.length : 0
}

/** @example countAsync("async function foo() {}") returns 1 */
export function countAsync(content: string): number {
  const matches = content.match(/\basync\s+/g)
  return matches ? matches.length : 0
}

/** @example countAwait('await foo()') returns 1 */
export function countAwait(content: string): number {
  const matches = content.match(/\bawait\s+/g)
  return matches ? matches.length : 0
}

/** @example countReturns('return x') returns 1 */
export function countReturns(content: string): number {
  const matches = content.match(/\breturn\b/g)
  return matches ? matches.length : 0
}

/** @example countThrow('throw new Error()') returns 1 */
export function countThrow(content: string): number {
  const matches = content.match(/\bthrow\s+/g)
  return matches ? matches.length : 0
}

/** @example countLoops('for (let i = 0; i < n; i++) {}') returns 1 */
export function countLoops(content: string): number {
  const matches = content.match(/\b(?:for|while|do)\s*[\({]/g)
  return matches ? matches.length : 0
}

/** @example countImplements('class A implements B') returns 1 */
export function countImplements(content: string): number {
  const matches = content.match(/\bimplements\s+/g)
  return matches ? matches.length : 0
}

// ─── Water Measurement ───────────────────────────────────────────────────────

/** @example measureWater('export function add(a: number, b: number): number { return a + b; }') */
export function measureWater(content: string): WaterMeasure {
  const base = 10
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const typeAnnotations = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const errorHandling = countErrorHandling(content)
  const comments = countComments(content)
  const privateMembers = countPrivateMembers(content)

  let quality = base
  if (loc > 0) quality += 8
  if (functions > 0) quality += 8
  if (classes > 0) quality += 6
  if (interfaces > 0) quality += 6
  if (exports > 0) quality += 5
  if (imports > 0) quality += 5
  if (typeAnnotations > 0) quality += 8
  if (jsdoc > 0) quality += 8
  if (errorHandling > 0) quality += 8
  if (comments > 0) quality += 4
  if (privateMembers > 0) quality += 4
  if (loc > 10) quality += 5
  if (loc > 25) quality += 5
  if (functions > 1) quality += 5
  if (classes > 1) quality += 3

  quality = Math.min(100, quality)

  const todos = countTodos(content)
  const deprecated = countDeprecated(content)
  const consoleCalls = countConsole(content)

  let pollutantCount = 0
  if (todos > 0) pollutantCount++
  if (deprecated > 0) pollutantCount++
  if (consoleCalls > 0) pollutantCount++
  if (loc > 0 && functions === 0 && classes === 0) pollutantCount++

  let clarity: WaterMeasure['clarity'] = 'toxic'
  if (quality >= 85) clarity = 'crystal'
  else if (quality >= 70) clarity = 'clear'
  else if (quality >= 55) clarity = 'cloudy'
  else if (quality >= 40) clarity = 'murky'
  else if (quality >= 25) clarity = 'polluted'

  const hasNoPollutants = pollutantCount === 0
  const hasNoAlgaeBloom = loc <= 100

  return {
    quality,
    clarity,
    isClean: quality >= 70,
    hasProperPH: branches(countBranches(content)) <= 10,
    hasOxygenated: functions > 0 || classes > 0,
    hasNoAlgaeBloom,
    hasNoPollutants,
    hasNaturalFiltration: errorHandling > 0,
    hasAeration: comments > 0,
    hasProperTemperature: loc > 0 && loc <= 50,
    hasSedimentControl: privateMembers > 0,
    pollutantCount,
  }
}

function branches(count: number): number {
  return count
}

// ─── Species Measurement ─────────────────────────────────────────────────────

/** @example measureSpecies('export function add(a: number, b: number): number { return a + b; }') */
export function measureSpecies(content: string): SpeciesMeasure {
  const base = 10
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypes(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const implements_ = countImplements(content)
  const generics = countGenerics(content)
  const descriptiveNames = countDescriptiveNames(content)
  const defaults = countDefaults(content)
  const asyncCount = countAsync(content)

  let diversity = base
  if (functions > 0) diversity += 8
  if (classes > 0) diversity += 8
  if (interfaces > 0) diversity += 6
  if (types > 0) diversity += 5
  if (exports > 0) diversity += 5
  if (imports > 0) diversity += 5
  if (implements_ > 0) diversity += 6
  if (generics > 0) diversity += 5
  if (descriptiveNames > 0) diversity += 5
  if (defaults > 0) diversity += 3
  if (asyncCount > 0) diversity += 5
  if (functions > 1) diversity += 4
  if (classes > 1) diversity += 3
  if (interfaces > 1) diversity += 3

  diversity = Math.min(100, diversity)

  let role: SpeciesMeasure['role'] = 'parasite'
  if (exports > 0 && imports > 0) role = 'producer'
  else if (exports > 0) role = 'primary-consumer'
  else if (imports > 0) role = 'secondary-consumer'
  else if (functions > 0 || classes > 0) role = 'decomposer'
  else if (countLoc(content) > 0) role = 'predator'

  const isNative = descriptiveNames > 0
  const isInvasive = todos_and_deprecated(content) > 2
  const isKeystone = exports > 2
  const hasMutualism = imports > 0 && exports > 0
  const hasCommensalism = imports > 0
  const hasParasitism = todos_and_deprecated(content) > 0

  let symbiosisCount = 0
  if (hasMutualism) symbiosisCount++
  if (hasCommensalism) symbiosisCount++
  if (isNative) symbiosisCount++
  if (implements_ > 0) symbiosisCount++

  const parasitismCount = hasParasitism ? todos_and_deprecated(content) : 0

  return {
    diversity,
    role,
    isNative,
    isInvasive,
    isKeystone,
    hasSymbiosis: symbiosisCount > 0,
    hasMutualism,
    hasCommensalism,
    hasParasitism,
    hasAdaptation: typeAnnotations_in(content) > 0,
    hasEvolution: comments_in(content) > 0,
    hasExtinction: countDeprecated(content) > 0,
    symbiosisCount,
    parasitismCount,
  }
}

function todos_and_deprecated(content: string): number {
  return countTodos(content) + countDeprecated(content)
}

function typeAnnotations_in(content: string): number {
  return countTypeAnnotations(content)
}

function comments_in(content: string): number {
  return countComments(content)
}

// ─── Chain Measurement ───────────────────────────────────────────────────────

/** @example measureChain('export function add(a: number, b: number): number { return a + b; }') */
export function measureChain(content: string): ChainMeasure {
  const base = 10
  const imports = countImports(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const errorHandling = countErrorHandling(content)
  const typeAnnotations = countTypeAnnotations(content)
  const returns = countReturns(content)
  const loc = countLoc(content)

  let health = base
  if (imports > 0) health += 8
  if (exports > 0) health += 8
  if (functions > 0) health += 6
  if (classes > 0) health += 6
  if (interfaces > 0) health += 5
  if (errorHandling > 0) health += 8
  if (typeAnnotations > 0) health += 6
  if (returns > 0) health += 5
  if (loc > 5) health += 4
  if (loc > 15) health += 4
  if (imports > 1) health += 4
  if (exports > 1) health += 4
  if (errorHandling > 1) health += 5

  health = Math.min(100, health)

  const trophicLevel = Math.min(6, imports + exports)
  let position: ChainMeasure['position'] = 'sediment'
  if (trophicLevel >= 5) position = 'apex'
  else if (trophicLevel >= 4) position = 'top'
  else if (trophicLevel >= 3) position = 'middle'
  else if (trophicLevel >= 2) position = 'bottom'
  else if (trophicLevel >= 1) position = 'base'

  return {
    health,
    trophicLevel,
    position,
    hasBalancedDiet: imports > 0 && exports > 0,
    hasNoOverpopulation: imports <= 5,
    hasNoStarvation: functions > 0 || classes > 0,
    hasEfficientTransfer: typeAnnotations > 0,
    hasEnergyConservation: errorHandling > 0,
    hasNoBioaccumulation: loc <= 80,
    hasDecompositionPath: errorHandling > 0,
    hasNutrientRecycling: interfaces > 0,
    hasTopDownControl: exports > 0,
    hasBottomUpControl: imports > 0,
    dependencyCount: imports,
    dependentCount: exports,
  }
}

// ─── Oxygen Measurement ──────────────────────────────────────────────────────

/** @example measureOxygen('export function add(a: number, b: number): number { return a + b; }') */
export function measureOxygen(content: string): OxygenMeasure {
  const base = 10
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const errorHandling = countErrorHandling(content)
  const asyncCount = countAsync(content)
  const awaitCount = countAwait(content)
  const descriptiveNames = countDescriptiveNames(content)
  const typeAnnotations = countTypeAnnotations(content)
  const exports = countExports(content)
  const branches_ = countBranches(content)

  let level = base
  if (loc > 0) level += 5
  if (loc > 10) level += 5
  if (loc > 25) level += 5
  if (functions > 0) level += 8
  if (comments > 0) level += 5
  if (jsdoc > 0) level += 6
  if (errorHandling > 0) level += 6
  if (asyncCount > 0) level += 5
  if (awaitCount > 0) level += 5
  if (descriptiveNames > 0) level += 5
  if (typeAnnotations > 0) level += 5
  if (exports > 0) level += 4
  if (functions > 1) level += 4
  if (comments > 1) level += 3

  level = Math.min(100, level)

  const consoleCalls = countConsole(content)
  const todos = countTodos(content)
  let pollutionCount = 0
  if (consoleCalls > 0) pollutionCount++
  if (todos > 0) pollutionCount++
  if (branches_ > 10) pollutionCount++

  let state: OxygenMeasure['state'] = 'anoxic'
  if (level >= 80) state = 'saturated'
  else if (level >= 65) state = 'healthy'
  else if (level >= 50) state = 'adequate'
  else if (level >= 35) state = 'low'
  else if (level >= 20) state = 'hypoxic'

  return {
    level,
    state,
    isFresh: jsdoc > 0 || comments > 0,
    hasDissolvedOxygen: loc > 0 && loc < 100,
    hasSurfaceAgitation: functions > 1,
    hasPhotosynthesis: exports > 0,
    hasRespiration: functions > 0,
    hasDecomposition: errorHandling > 0,
    hasAlgaeContribution: descriptiveNames > 0,
    hasNighttimeDrop: asyncCount > 0,
    hasStratification: countClasses(content) > 0 && functions > 0,
    hasThermalPollution: branches_ > 8,
    pollutionCount,
  }
}

// ─── Nutrient Measurement ────────────────────────────────────────────────────

/** @example measureNutrient('export function add(a: number, b: number): number { return a + b; }') */
export function measureNutrient(content: string): NutrientMeasure {
  const base = 10
  const errorHandling = countErrorHandling(content)
  const typeAnnotations = countTypeAnnotations(content)
  const interfaces = countInterfaces(content)
  const types = countTypes(content)
  const privateMembers = countPrivateMembers(content)
  const returns = countReturns(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const generics = countGenerics(content)
  const loc = countLoc(content)
  const functions = countFunctions(content)

  let cycle = base
  if (errorHandling > 0) cycle += 8
  if (typeAnnotations > 0) cycle += 7
  if (interfaces > 0) cycle += 6
  if (types > 0) cycle += 5
  if (privateMembers > 0) cycle += 5
  if (returns > 0) cycle += 5
  if (imports > 0) cycle += 5
  if (exports > 0) cycle += 5
  if (generics > 0) cycle += 5
  if (loc > 5) cycle += 4
  if (loc > 15) cycle += 4
  if (functions > 0) cycle += 5
  if (errorHandling > 1) cycle += 4

  cycle = Math.min(100, cycle)

  let efficiency: NutrientMeasure['efficiency'] = 'absent'
  if (cycle >= 80) efficiency = 'closed-loop'
  else if (cycle >= 65) efficiency = 'efficient'
  else if (cycle >= 50) efficiency = 'moderate'
  else if (cycle >= 35) efficiency = 'leaky'
  else if (cycle >= 20) efficiency = 'broken'

  let cycleCount = 0
  if (errorHandling > 0) cycleCount++
  if (typeAnnotations > 0) cycleCount++
  if (interfaces > 0) cycleCount++
  if (types > 0) cycleCount++
  if (generics > 0) cycleCount++

  const imports_ = countImports(content)
  const hasEutrophication = imports_ > 5
  const hasNutrientLoading = imports_ > 8

  return {
    cycle,
    efficiency,
    hasNitrogenCycle: errorHandling > 0,
    hasCarbonCycle: interfaces > 0,
    hasPhosphorusCycle: types > 0,
    hasDecomposition: errorHandling > 0,
    hasUptake: imports > 0,
    hasRelease: exports > 0,
    hasFixation: privateMembers > 0,
    hasDenitrification: generics > 0,
    hasEutrophication,
    hasNutrientLoading,
    cycleCount,
  }
}

// ─── Balance Measurement ─────────────────────────────────────────────────────

/** @example measureBalance('export function add(a: number, b: number): number { return a + b; }') */
export function measureBalance(content: string): BalanceMeasure {
  const base = 10
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const errorHandling = countErrorHandling(content)
  const typeAnnotations = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const branches_ = countBranches(content)
  const descriptiveNames = countDescriptiveNames(content)
  const privateMembers = countPrivateMembers(content)

  let score = base
  if (loc > 0) score += 5
  if (loc > 10) score += 5
  if (functions > 0) score += 8
  if (classes > 0) score += 6
  if (interfaces > 0) score += 6
  if (exports > 0) score += 5
  if (imports > 0) score += 5
  if (errorHandling > 0) score += 6
  if (typeAnnotations > 0) score += 6
  if (jsdoc > 0) score += 5
  if (descriptiveNames > 0) score += 5
  if (privateMembers > 0) score += 4
  if (functions > 1) score += 4
  if (branches_ > 0 && branches_ <= 5) score += 5
  if (errorHandling > 1) score += 4

  score = Math.min(100, score)

  let state: BalanceMeasure['state'] = 'dead'
  if (score >= 80) state = 'equilibrium'
  else if (score >= 65) state = 'stable'
  else if (score >= 50) state = 'shifting'
  else if (score >= 35) state = 'unstable'
  else if (score >= 20) state = 'collapsing'

  let nicheCount = 0
  if (functions > 0) nicheCount++
  if (classes > 0) nicheCount++
  if (interfaces > 0) nicheCount++
  if (exports > 0) nicheCount++
  if (imports > 0) nicheCount++

  return {
    score,
    state,
    isBalanced: score >= 60,
    hasPredatorPreyBalance: exports > 0 && imports > 0,
    hasCompetitiveExclusion: privateMembers > 0,
    hasResourcePartitioning: interfaces > 0,
    hasEcologicalNiche: nicheCount >= 3,
    hasCarryingCapacity: loc > 0 && loc <= 100,
    hasSuccession: jsdoc > 0,
    hasDisturbance: errorHandling > 0,
    hasResilience: errorHandling > 0 && typeAnnotations > 0,
    hasResistance: descriptiveNames > 0,
    nicheCount,
  }
}

// ─── Organism Analysis ───────────────────────────────────────────────────────

/** @example classifyOrganismCondition(90, water, balance) returns 'pristine-ecosystem' */
export function classifyOrganismCondition(
  score: number,
  water: WaterMeasure,
  balance: BalanceMeasure,
): OrganismCondition {
  if (score >= 85 && water.isClean && balance.isBalanced) return 'pristine-ecosystem'
  if (score >= 70 && water.isClean) return 'healthy-pond'
  if (score >= 50 && balance.hasEcologicalNiche) return 'balanced-habitat'
  if (score >= 35) return 'stressed-pond'
  if (score >= 20) return 'polluted-water'
  return 'dead-zone'
}

/** @example analyzePondOrganism('export function add(a: number, b: number): number { return a + b; }', 'file.ts') */
export function analyzePondOrganism(content: string, filePath: string): PondOrganism {
  const water = measureWater(content)
  const species = measureSpecies(content)
  const chain = measureChain(content)
  const oxygen = measureOxygen(content)
  const nutrient = measureNutrient(content)
  const balance = measureBalance(content)

  const qualityScore = Math.round(
    (water.quality + species.diversity + chain.health + oxygen.level + nutrient.cycle + balance.score) / 6,
  )

  const condition = classifyOrganismCondition(qualityScore, water, balance)

  return {
    file: filePath,
    waterQuality: water.quality,
    biodiversity: species.diversity,
    foodChain: chain.health,
    oxygenLevel: oxygen.level,
    nutrientCycle: nutrient.cycle,
    ecosystemBalance: balance.score,
    water,
    species,
    chain,
    oxygen,
    nutrient,
    balance,
    condition,
    qualityScore,
  }
}

// ─── Habitat Analysis ────────────────────────────────────────────────────────

/** @example classifyHabitatType(organisms, 80) returns 'mountain-lake' */
export function classifyHabitatType(
  organisms: PondOrganism[],
  avgWater: number,
): HabitatType {
  if (organisms.length === 0) return 'cesspool'
  const hasPristine = organisms.some((o) => o.condition === 'pristine-ecosystem')
  if (hasPristine && avgWater >= 70) return 'mountain-lake'
  if (avgWater >= 60) return 'koi-pond'
  if (avgWater >= 45) return 'garden-pond'
  if (avgWater >= 30) return 'retention-pond'
  if (avgWater >= 15) return 'drainage-ditch'
  return 'cesspool'
}

/** @example classifyHabitatCondition(80) returns 'nature-reserve' */
export function classifyHabitatCondition(avgWater: number): HabitatCondition {
  if (avgWater >= 80) return 'nature-reserve'
  if (avgWater >= 65) return 'botanical-garden'
  if (avgWater >= 50) return 'park-pond'
  if (avgWater >= 35) return 'farm-pond'
  if (avgWater >= 20) return 'drainage-basin'
  return 'toxic-dump'
}

/** @example analyzePondHabitat(organisms, 'src') */
export function analyzePondHabitat(organisms: PondOrganism[], dirPath: string): PondHabitat {
  const count = organisms.length
  const avgWaterQuality = count > 0 ? Math.round(organisms.reduce((s, o) => s + o.waterQuality, 0) / count) : 0
  const avgBiodiversity = count > 0 ? Math.round(organisms.reduce((s, o) => s + o.biodiversity, 0) / count) : 0
  const avgBalance = count > 0 ? Math.round(organisms.reduce((s, o) => s + o.ecosystemBalance, 0) / count) : 0

  const pristineCount = organisms.filter((o) => o.condition === 'pristine-ecosystem').length
  const deadZoneCount = organisms.filter((o) => o.condition === 'dead-zone').length
  const balancedCount = organisms.filter((o) => o.balance.isBalanced).length
  const nativeCount = organisms.filter((o) => o.species.isNative).length

  const habitatType = classifyHabitatType(organisms, avgWaterQuality)
  const condition = classifyHabitatCondition(avgWaterQuality)

  return {
    directory: dirPath,
    organisms,
    avgWaterQuality,
    avgBiodiversity,
    avgBalance,
    pristineCount,
    deadZoneCount,
    balancedCount,
    nativeCount,
    habitatType,
    condition,
  }
}

// ─── Ecologist Grade ─────────────────────────────────────────────────────────

/** @example classifyEcologistGrade(90) returns 'chief-ecologist' */
export function classifyEcologistGrade(avgHealth: number): EcologistGrade {
  if (avgHealth >= 85) return 'chief-ecologist'
  if (avgHealth >= 70) return 'senior-ecologist'
  if (avgHealth >= 50) return 'ecologist'
  if (avgHealth >= 30) return 'naturalist'
  if (avgHealth >= 15) return 'angler'
  return 'polluter'
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/** @example generateRecommendations(water, species, chain, oxygen, nutrient, balance) */
export function generateRecommendations(
  water: WaterMeasure,
  species: SpeciesMeasure,
  chain: ChainMeasure,
  oxygen: OxygenMeasure,
  nutrient: NutrientMeasure,
  balance: BalanceMeasure,
): string[] {
  const recommendations: string[] = []

  if (water.pollutantCount > 0) {
    recommendations.push('Remove pollutants (TODOs, deprecated markers, console calls) to improve water quality')
  }
  if (!water.hasOxygenated) {
    recommendations.push('Add functions or classes to oxygenate stagnant code')
  }
  if (!species.isNative) {
    recommendations.push('Use descriptive names to make organisms native to the ecosystem')
  }
  if (species.isInvasive) {
    recommendations.push('Reduce excessive TODOs and deprecated markers to prevent invasive species')
  }
  if (!chain.hasBalancedDiet) {
    recommendations.push('Balance imports and exports for a healthy food chain')
  }
  if (!oxygen.hasDecomposition) {
    recommendations.push('Add error handling to enable decomposition processes')
  }
  if (nutrient.hasEutrophication) {
    recommendations.push('Reduce excessive imports to prevent nutrient eutrophication')
  }
  if (!balance.hasResilience) {
    recommendations.push('Add error handling and type annotations for ecosystem resilience')
  }
  if (!balance.hasEcologicalNiche) {
    recommendations.push('Diversify code with functions, classes, and interfaces to fill ecological niches')
  }
  if (!water.hasNaturalFiltration) {
    recommendations.push('Add error handling to provide natural filtration')
  }

  if (recommendations.length === 0) {
    recommendations.push('Ecosystem is in pristine condition — maintain current biodiversity and balance')
  }

  return recommendations
}

// ─── Build Result ────────────────────────────────────────────────────────────

/** @example buildEcosystemPondResult(['a.ts'], ['export function foo(): void {}']) */
export function buildEcosystemPondResult(
  files: string[],
  contents: string[],
  _options?: { ignore?: string[]; ext?: string[] },
): EcosystemPondResult {

  const organisms: PondOrganism[] = files.map((file, i) =>
    analyzePondOrganism(contents[i] ?? '', file),
  )

  const habitatMap = new Map<string, PondOrganism[]>()
  for (const org of organisms) {
    const dir = org.file.includes('/') ? org.file.substring(0, org.file.lastIndexOf('/')) : '.'
    const existing = habitatMap.get(dir)
    if (existing) {
      existing.push(org)
    } else {
      habitatMap.set(dir, [org])
    }
  }

  const habitats: PondHabitat[] = Array.from(habitatMap.entries()).map(([dir, orgs]) =>
    analyzePondHabitat(orgs, dir),
  )

  const count = organisms.length
  const avgWaterQuality = count > 0 ? Math.round(organisms.reduce((s, o) => s + o.waterQuality, 0) / count) : 0
  const avgBiodiversity = count > 0 ? Math.round(organisms.reduce((s, o) => s + o.biodiversity, 0) / count) : 0
  const avgFoodChain = count > 0 ? Math.round(organisms.reduce((s, o) => s + o.foodChain, 0) / count) : 0
  const avgOxygenLevel = count > 0 ? Math.round(organisms.reduce((s, o) => s + o.oxygenLevel, 0) / count) : 0
  const avgNutrientCycle = count > 0 ? Math.round(organisms.reduce((s, o) => s + o.nutrientCycle, 0) / count) : 0
  const avgEcosystemBalance = count > 0 ? Math.round(organisms.reduce((s, o) => s + o.ecosystemBalance, 0) / count) : 0

  const overallHealth = Math.round(
    (avgWaterQuality + avgBiodiversity + avgFoodChain + avgOxygenLevel + avgNutrientCycle + avgEcosystemBalance) / 6,
  )
  const ecologistGrade = classifyEcologistGrade(overallHealth)

  const conditionCounts = {
    pristineEcosystem: organisms.filter((o) => o.condition === 'pristine-ecosystem').length,
    healthyPond: organisms.filter((o) => o.condition === 'healthy-pond').length,
    balancedHabitat: organisms.filter((o) => o.condition === 'balanced-habitat').length,
    stressedPond: organisms.filter((o) => o.condition === 'stressed-pond').length,
    pollutedWater: organisms.filter((o) => o.condition === 'polluted-water').length,
    deadZone: organisms.filter((o) => o.condition === 'dead-zone').length,
  }

  const stats: EcosystemPondStats = {
    totalFiles: count,
    totalHabitats: habitats.length,
    avgWaterQuality,
    avgBiodiversity,
    avgFoodChain,
    avgOxygenLevel,
    avgNutrientCycle,
    avgEcosystemBalance,
    pristineEcosystemCount: conditionCounts.pristineEcosystem,
    healthyPondCount: conditionCounts.healthyPond,
    balancedHabitatCount: conditionCounts.balancedHabitat,
    stressedPondCount: conditionCounts.stressedPond,
    pollutedWaterCount: conditionCounts.pollutedWater,
    deadZoneCount: conditionCounts.deadZone,
    isCleanCount: organisms.filter((o) => o.water.isClean).length,
    hasNoPollutantsCount: organisms.filter((o) => o.water.hasNoPollutants).length,
    isNativeCount: organisms.filter((o) => o.species.isNative).length,
    isInvasiveCount: organisms.filter((o) => o.species.isInvasive).length,
    hasSymbiosisCount: organisms.filter((o) => o.species.hasSymbiosis).length,
    hasParasitismCount: organisms.filter((o) => o.species.hasParasitism).length,
    hasBalancedDietCount: organisms.filter((o) => o.chain.hasBalancedDiet).length,
    isFreshCount: organisms.filter((o) => o.oxygen.isFresh).length,
    hasEutrophicationCount: organisms.filter((o) => o.nutrient.hasEutrophication).length,
    isBalancedCount: organisms.filter((o) => o.balance.isBalanced).length,
    hasResilienceCount: organisms.filter((o) => o.balance.hasResilience).length,
    hasEcologicalNicheCount: organisms.filter((o) => o.balance.hasEcologicalNiche).length,
    overallHealth,
    ecologistGrade,
    bestOrganism: count > 0 ? organisms.reduce((best, o) => (o.qualityScore > best.qualityScore ? o : best)).file : '',
    cleanestWater: count > 0 ? organisms.reduce((best, o) => (o.waterQuality > best.waterQuality ? o : best)).file : '',
    mostDiverse: count > 0 ? organisms.reduce((best, o) => (o.biodiversity > best.biodiversity ? o : best)).file : '',
    healthiestChain: count > 0 ? organisms.reduce((best, o) => (o.foodChain > best.foodChain ? o : best)).file : '',
    freshestCode: count > 0 ? organisms.reduce((best, o) => (o.oxygenLevel > best.oxygenLevel ? o : best)).file : '',
  }

  const watershed = {
    avgWaterQuality,
    avgBiodiversity,
    avgBalance: avgEcosystemBalance,
    isHealthy: overallHealth >= 50,
    overallHealth,
  }


  const recWater = count > 0 ? (organisms[0]?.water ?? measureWater('')) : measureWater('')
  const recSpecies = count > 0 ? (organisms[0]?.species ?? measureSpecies('')) : measureSpecies('')
  const recChain = count > 0 ? (organisms[0]?.chain ?? measureChain('')) : measureChain('')
  const recOxygen = count > 0 ? (organisms[0]?.oxygen ?? measureOxygen('')) : measureOxygen('')
  const recNutrient = count > 0 ? (organisms[0]?.nutrient ?? measureNutrient('')) : measureNutrient('')
  const recBalance = count > 0 ? (organisms[0]?.balance ?? measureBalance('')) : measureBalance('')

  const recommendations = generateRecommendations(recWater, recSpecies, recChain, recOxygen, recNutrient, recBalance)

  return { organisms, habitats, watershed, stats, recommendations }
}
