// ─── Interfaces ──────────────────────────────────────────────────────────────

export type PolypCondition = 'thriving' | 'healthy' | 'stressed' | 'bleaching' | 'damaged' | 'dead'
export type SpeciesVariety = 'mono-culture' | 'low-diversity' | 'moderate' | 'diverse' | 'rich' | 'thriving'
export type GrowthForm = 'branching' | 'massive' | 'encrusting' | 'table' | 'free-living' | 'columnar'
export type ZoneType = 'reef-crest' | 'fore-reef' | 'back-reef' | 'lagoon' | 'atoll' | 'dead-zone'
export type ReefCondition = 'pristine-reef' | 'healthy-reef' | 'stressed-reef' | 'degraded-reef' | 'bleached-reef' | 'dead-reef'
export type MarineBiologistGrade = 'marine-biologist' | 'reef-scientist' | 'aquarist' | 'diver' | 'tourist' | 'polluter'

export interface SpeciesInfo {
  constructors: number
  functions: number
  classes: number
  interfaces: number
  types: number
  enums: number
  total: number
  dominant: string
  variety: SpeciesVariety
}

export interface SymbiosisInfo {
  mutualismCount: number
  commensalismCount: number
  parasitismCount: number
  hasZooxanthellae: boolean
  mutualism: number
  parasitism: number
  symbiosisScore: number
}

export interface ReefGrowth {
  isFoundation: boolean
  isBranching: boolean
  isMassive: boolean
  isEncrusting: boolean
  isTable: boolean
  isFreeLiving: boolean
  growthForm: GrowthForm
}

export interface WaterQuality {
  temperature: number
  acidity: number
  turbidity: number
  oxygenLevel: number
  isClean: boolean
  isPolluted: boolean
  pollutionSources: string[]
}

export interface BleachingInfo {
  risk: number
  isBleaching: boolean
  hasRecovered: boolean
  hasNecrosis: boolean
  deadPortions: number
  bleachingCauses: string[]
}

export interface EcosystemInfo {
  providesHabitat: boolean
  habitatComplexity: number
  hasNursery: boolean
  nurseryQuality: number
  supportsSpecies: number
  isKeystone: boolean
  isIndicator: boolean
}

export interface CoralPolyp {
  file: string
  coralHealth: number
  speciesDiversity: number
  symbiosisQuality: number
  waterClarity: number
  biodiversityIndex: number
  reefResilience: number
  species: SpeciesInfo
  symbiosis: SymbiosisInfo
  reef: ReefGrowth
  water: WaterQuality
  bleaching: BleachingInfo
  ecosystem: EcosystemInfo
  condition: PolypCondition
  qualityScore: number
}

export interface ReefZone {
  directory: string
  polyps: CoralPolyp[]
  avgHealth: number
  avgDiversity: number
  avgSymbiosis: number
  avgClarity: number
  thrivingCount: number
  bleachingCount: number
  deadCount: number
  totalSpecies: number
  zoneType: ZoneType
  biodiversity: number
  condition: ReefCondition
}

export interface OceanInfo {
  avgHealth: number
  avgDiversity: number
  avgSymbiosis: number
  avgClarity: number
  totalBiodiversity: number
  isHealthy: boolean
  overallReefHealth: number
}

export interface CoralReefStats {
  totalFiles: number
  totalZones: number
  avgCoralHealth: number
  avgSpeciesDiversity: number
  avgSymbiosisQuality: number
  avgWaterClarity: number
  avgBiodiversityIndex: number
  avgReefResilience: number
  thrivingCount: number
  healthyCount: number
  stressedCount: number
  bleachingCount: number
  damagedCount: number
  deadCount: number
  totalSpecies: number
  avgMutualism: number
  avgParasitism: number
  foundationModules: number
  keystoneModules: number
  isCleanCount: number
  isPollutedCount: number
  hasZooxanthellaeCount: number
  providesHabitatCount: number
  overallReefHealth: number
  marineBiologistGrade: MarineBiologistGrade
  healthiestPolyp: string
  mostDiverse: string
  bestSymbiosis: string
  mostPolluted: string
  mostBleached: string
}

export interface CoralReefResult {
  polyps: CoralPolyp[]
  zones: ReefZone[]
  ocean: OceanInfo
  stats: CoralReefStats
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
 * Count interfaces
 * @example
 * countInterfaces('interface Foo {}') // 1
 */
export function countInterfaces(content: string): number {
  return (content.match(/\binterface\s+\w+/g) ?? []).length
}

/**
 * Count type aliases
 * @example
 * countTypeAliases('type Foo = string') // 1
 */
export function countTypeAliases(content: string): number {
  return (content.match(/\btype\s+\w+\s*=/g) ?? []).length
}

/**
 * Count enums
 * @example
 * countEnums('enum Dir { N, S }') // 1
 */
export function countEnums(content: string): number {
  return (content.match(/\benum\s+\w+/g) ?? []).length
}

/**
 * Count constructors
 * @example
 * countConstructors('constructor() {}') // 1
 */
export function countConstructors(content: string): number {
  return (content.match(/\bconstructor\s*\(/g) ?? []).length
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

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify polyp condition from quality score
 * @example
 * classifyPolypCondition(90) // 'thriving'
 */
export function classifyPolypCondition(qualityScore: number): PolypCondition {
  if (qualityScore >= 80) return 'thriving'
  if (qualityScore >= 60) return 'healthy'
  if (qualityScore >= 40) return 'stressed'
  if (qualityScore >= 20) return 'bleaching'
  if (qualityScore >= 5) return 'damaged'
  return 'dead'
}

/**
 * Classify species variety from species count
 * @example
 * classifySpeciesVariety(5) // 'thriving'
 */
export function classifySpeciesVariety(uniqueTypes: number): SpeciesVariety {
  if (uniqueTypes >= 5) return 'thriving'
  if (uniqueTypes >= 4) return 'rich'
  if (uniqueTypes >= 3) return 'diverse'
  if (uniqueTypes >= 2) return 'moderate'
  if (uniqueTypes >= 1) return 'low-diversity'
  return 'mono-culture'
}

/**
 * Classify growth form from code characteristics
 * @example
 * classifyGrowthForm('export function a() {}') // GrowthForm
 */
export function classifyGrowthForm(content: string): GrowthForm {
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFunctions(content)
  const types = countTypeAliases(content) + countInterfaces(content)
  const nest = maxNesting(content)

  if (nest >= 5) return 'columnar'
  if (exports >= 4) return 'branching'
  if (funcs >= 3 && types >= 2) return 'massive'
  if (exports >= 2 && funcs <= 1) return 'table'
  if (imports >= 3 && exports === 0) return 'encrusting'
  return 'free-living'
}

/**
 * Classify zone type from polyps
 * @example
 * classifyZoneType([]) // 'atoll'
 */
export function classifyZoneType(polyps: CoralPolyp[]): ZoneType {
  if (polyps.length === 0) return 'atoll'
  const n = polyps.length
  const thriving = polyps.filter(p => p.condition === 'thriving' || p.condition === 'healthy').length
  const dead = polyps.filter(p => p.condition === 'dead' || p.condition === 'damaged').length

  if (dead > n * 0.6) return 'dead-zone'
  if (thriving > n * 0.7) return 'reef-crest'
  if (thriving > n * 0.4) return 'fore-reef'
  if (dead > n * 0.3) return 'lagoon'
  if (thriving > 0) return 'back-reef'
  return 'atoll'
}

/**
 * Classify reef condition from average health
 * @example
 * classifyReefCondition(85) // 'pristine-reef'
 */
export function classifyReefCondition(avgHealth: number): ReefCondition {
  if (avgHealth >= 80) return 'pristine-reef'
  if (avgHealth >= 60) return 'healthy-reef'
  if (avgHealth >= 40) return 'stressed-reef'
  if (avgHealth >= 20) return 'degraded-reef'
  if (avgHealth >= 5) return 'bleached-reef'
  return 'dead-reef'
}

/**
 * Classify marine biologist grade from average reef health
 * @example
 * classifyMarineBiologistGrade(85) // 'marine-biologist'
 */
export function classifyMarineBiologistGrade(avgHealth: number): MarineBiologistGrade {
  if (avgHealth >= 80) return 'marine-biologist'
  if (avgHealth >= 65) return 'reef-scientist'
  if (avgHealth >= 45) return 'aquarist'
  if (avgHealth >= 30) return 'diver'
  if (avgHealth >= 15) return 'tourist'
  return 'polluter'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure species diversity in code
 * @example
 * measureSpecies('export function a(): number { return 1 }') // SpeciesInfo
 */
export function measureSpecies(content: string): SpeciesInfo {
  const constructors = countConstructors(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const enums = countEnums(content)
  const total = constructors + functions + classes + interfaces + types + enums

  const counts: Record<string, number> = { constructors, functions, classes, interfaces, types, enums }
  let dominant = 'none'
  let maxCount = 0
  for (const [name, count] of Object.entries(counts)) {
    if (count > maxCount) { maxCount = count; dominant = name }
  }

  const uniqueTypes = [constructors, functions, classes, interfaces, types, enums].filter(c => c > 0).length
  const variety = classifySpeciesVariety(uniqueTypes)

  return { constructors, functions, classes, interfaces, types, enums, total, dominant, variety }
}

/**
 * Measure symbiosis quality (mutualism, commensalism, parasitism)
 * @example
 * measureSymbiosis('import { x } from "y"\nexport function a() { return x }') // SymbiosisInfo
 */
export function measureSymbiosis(content: string): SymbiosisInfo {
  const imports = countImports(content)
  const exports = countExports(content)
  const errors = countErrorHandling(content)
  const todos = countTodos(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)

  const mutualismCount = (exports > 0 && errors > 0 ? 1 : 0) + (comments > 0 && types > 0 ? 1 : 0)
  const commensalismCount = imports > 0 ? Math.min(imports, 3) : 0
  const parasitismCount = (todos > 2 ? 1 : 0) + (countConsole(content) > 3 ? 1 : 0) + (imports > 5 ? 1 : 0)

  const hasZooxanthellae = /import.*(?:helper|util|service|tool)/i.test(content)

  const mutualism = Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 25 : 0) +
    (errors > 0 ? 20 : 0) +
    (comments > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (mutualismCount * 10),
  )))

  const parasitism = Math.min(100, Math.max(0, Math.round(
    (todos > 0 ? 20 : 0) +
    (countConsole(content) > 2 ? 15 : 0) +
    (imports > 4 ? 15 : 0) +
    (parasitismCount * 15),
  )))

  const symbiosisScore = Math.min(100, Math.max(0, Math.round(
    mutualism * 0.6 + (100 - parasitism) * 0.4,
  )))

  return { mutualismCount, commensalismCount, parasitismCount, hasZooxanthellae, mutualism, parasitism, symbiosisScore }
}

/**
 * Measure water quality (clarity, pollution)
 * @example
 * measureWaterQuality('const x = 1') // WaterQuality
 */
export function measureWaterQuality(content: string): WaterQuality {
  const loc = countLoc(content)
  const todos = countTodos(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const nest = maxNesting(content)
  const branches = countBranches(content)

  const temperature = Math.min(100, Math.round(
    loc * 0.5 + countConsole(content) * 5 + branches * 3,
  ))

  const acidity = Math.min(100, Math.round(
    todos * 15 + countConsole(content) * 5 + (nest > 4 ? 15 : 0),
  ))

  const turbidity = Math.min(100, Math.round(
    (nest > 3 ? 25 : nest > 2 ? 15 : 0) +
    (branches > 5 ? 20 : branches > 3 ? 10 : 0) +
    (comments === 0 && loc > 10 ? 15 : 0) +
    (types === 0 && loc > 5 ? 10 : 0),
  ))

  const oxygenLevel = Math.min(100, Math.round(
    (comments > 0 ? 30 : 0) +
    (types > 0 ? 25 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countExports(content) > 0 ? 15 : 0) +
    (loc > 0 ? 10 : 0),
  ))

  const isClean = turbidity < 30 && acidity < 20
  const isPolluted = acidity > 50 || turbidity > 50

  const pollutionSources: string[] = []
  if (todos > 0) pollutionSources.push('TODO/FIXME markers')
  if (countConsole(content) > 3) pollutionSources.push('Excessive console output')
  if (nest > 4) pollutionSources.push('Deep nesting')
  if (branches > 6 && countErrorHandling(content) === 0) pollutionSources.push('Complex branches without error handling')

  return { temperature, acidity, turbidity, oxygenLevel, isClean, isPolluted, pollutionSources }
}

/**
 * Measure bleaching risk (dead code, loss of diversity)
 * @example
 * measureBleaching('') // BleachingInfo
 */
export function measureBleaching(content: string): BleachingInfo {
  const loc = countLoc(content)
  const species = measureSpecies(content)
  const todos = countTodos(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)

  const risk = Math.min(100, Math.max(0, Math.round(
    (loc === 0 ? 80 : 0) +
    (species.total === 0 ? 30 : species.total <= 1 ? 15 : 0) +
    (todos > 2 ? 20 : todos > 0 ? 10 : 0) +
    (types === 0 && loc > 10 ? 15 : 0) +
    (errors === 0 && loc > 20 ? 10 : 0),
  )))

  const isBleaching = species.variety === 'mono-culture' && loc > 5
  const hasNecrosis = todos > 0
  const deadPortions = Math.min(100, Math.round(
    (loc === 0 ? 100 : 0) +
    (todos * 5) +
    (species.total === 0 && loc > 0 ? 30 : 0),
  ))

  const hasRecovered = errors > 0 && types > 0 && comments > 0 && species.total >= 3

  const bleachingCauses: string[] = []
  if (loc === 0) bleachingCauses.push('Empty file - no life')
  if (species.variety === 'mono-culture' && loc > 3) bleachingCauses.push('Mono-culture code - low diversity')
  if (todos > 2) bleachingCauses.push('Decaying markers (TODO/FIXME)')
  if (errors === 0 && loc > 20) bleachingCauses.push('No error handling - vulnerability')

  return { risk, isBleaching, hasRecovered, hasNecrosis, deadPortions, bleachingCauses }
}

/**
 * Measure ecosystem role (habitat, nursery, keystone)
 * @example
 * measureEcosystem('export function a() {}') // EcosystemInfo
 */
export function measureEcosystem(content: string): EcosystemInfo {
  const exports = countExports(content)
  const imports = countImports(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const funcs = countFunctions(content)

  const providesHabitat = exports > 0
  const habitatComplexity = Math.min(100, Math.round(
    interfaces * 15 + types * 10 + exports * 10 + funcs * 5,
  ))

  const hasNursery = /(?:describe|it|test|expect|assert)\s*\(/i.test(content)
  const nurseryQuality = hasNursery
    ? Math.min(100, Math.round(
        (content.match(/expect\s*\(/g) ?? []).length * 10 +
        (content.match(/describe\s*\(/g) ?? []).length * 15 +
        (content.match(/it\s*\(/g) ?? []).length * 10,
      ))
    : 0

  const supportsSpecies = exports
  const isKeystone = exports >= 3 && imports >= 2
  const isIndicator = exports > 0 && countErrorHandling(content) > 0 && countTypeAnnotations(content) > 0

  return { providesHabitat, habitatComplexity, hasNursery, nurseryQuality, supportsSpecies, isKeystone, isIndicator }
}

// ─── Reef Growth Measurement ─────────────────────────────────────────────────

/**
 * Measure reef growth characteristics
 * @example
 * measureReefGrowth('export function a() {}') // ReefGrowth
 */
export function measureReefGrowth(content: string): ReefGrowth {
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFunctions(content)
  const types = countInterfaces(content) + countTypeAliases(content)
  const loc = countLoc(content)

  const isFoundation = exports >= 3
  const isBranching = exports >= 4
  const isMassive = funcs >= 3 && types >= 2
  const isEncrusting = imports >= 3 && exports === 0
  const isTable = exports >= 2 && funcs <= 1
  const isFreeLiving = imports === 0 && exports <= 1

  const growthForm = classifyGrowthForm(content)

  void loc

  return { isFoundation, isBranching, isMassive, isEncrusting, isTable, isFreeLiving, growthForm }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a coral polyp
 * @example
 * analyzeCoralPolyp('export function calc(): number { return 1 }', 'calc.ts') // CoralPolyp
 */
export function analyzeCoralPolyp(content: string, filePath: string): CoralPolyp {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      coralHealth: 0, speciesDiversity: 0, symbiosisQuality: 0,
      waterClarity: 0, biodiversityIndex: 0, reefResilience: 0,
      species: { constructors: 0, functions: 0, classes: 0, interfaces: 0, types: 0, enums: 0, total: 0, dominant: 'none', variety: 'mono-culture' },
      symbiosis: { mutualismCount: 0, commensalismCount: 0, parasitismCount: 0, hasZooxanthellae: false, mutualism: 0, parasitism: 0, symbiosisScore: 0 },
      reef: { isFoundation: false, isBranching: false, isMassive: false, isEncrusting: false, isTable: false, isFreeLiving: true, growthForm: 'free-living' },
      water: { temperature: 0, acidity: 0, turbidity: 0, oxygenLevel: 0, isClean: true, isPolluted: false, pollutionSources: [] },
      bleaching: { risk: 100, isBleaching: false, hasRecovered: false, hasNecrosis: false, deadPortions: 100, bleachingCauses: ['Empty file - no life'] },
      ecosystem: { providesHabitat: false, habitatComplexity: 0, hasNursery: false, nurseryQuality: 0, supportsSpecies: 0, isKeystone: false, isIndicator: false },
      condition: 'dead',
      qualityScore: 0,
    }
  }

  const species = measureSpecies(content)
  const symbiosis = measureSymbiosis(content)
  const water = measureWaterQuality(content)
  const bleaching = measureBleaching(content)
  const ecosystem = measureEcosystem(content)
  const reef = measureReefGrowth(content)

  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const exports = countExports(content)

  const coralHealth = Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (comments > 0 ? 15 : 0) +
    (exports > 0 ? 15 : 0) +
    (species.total > 0 ? 10 : 0) +
    (countLoc(content) > 5 ? 10 : 0) +
    (species.variety === 'thriving' || species.variety === 'rich' ? 5 : 0),
  )))

  const uniqueTypes = [species.constructors, species.functions, species.classes, species.interfaces, species.types, species.enums].filter(c => c > 0).length
  const speciesDiversity = Math.min(100, Math.round(uniqueTypes * 20 + Math.min(species.total, 6) * 5))

  const symbiosisQuality = symbiosis.symbiosisScore

  const waterClarity = Math.min(100, Math.max(0, Math.round(
    water.oxygenLevel * 0.4 +
    (100 - water.turbidity) * 0.3 +
    (100 - water.acidity) * 0.3,
  )))

  const biodiversityIndex = Math.min(100, Math.round(
    speciesDiversity * 0.35 +
    symbiosisQuality * 0.25 +
    waterClarity * 0.2 +
    coralHealth * 0.2,
  ))

  const reefResilience = Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (species.variety === 'thriving' || species.variety === 'rich' ? 20 : species.variety === 'diverse' ? 15 : 5) +
    (water.isClean ? 15 : 0) +
    (ecosystem.providesHabitat ? 10 : 0) +
    (bleaching.hasRecovered ? 10 : 0),
  )))

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    coralHealth * 0.2 +
    speciesDiversity * 0.15 +
    symbiosisQuality * 0.15 +
    waterClarity * 0.15 +
    biodiversityIndex * 0.15 +
    reefResilience * 0.1 +
    (100 - bleaching.risk) * 0.1,
  )))

  const condition = classifyPolypCondition(qualityScore)

  return {
    file: filePath,
    coralHealth, speciesDiversity, symbiosisQuality,
    waterClarity, biodiversityIndex, reefResilience,
    species, symbiosis, reef, water, bleaching, ecosystem,
    condition, qualityScore,
  }
}

// ─── Reef Zone Analysis ──────────────────────────────────────────────────────

/**
 * Analyze a directory as a reef zone
 * @example
 * analyzeReefZone(polyps, 'src') // ReefZone
 */
export function analyzeReefZone(polyps: CoralPolyp[], dirPath: string): ReefZone {
  if (polyps.length === 0) {
    return {
      directory: dirPath, polyps: [],
      avgHealth: 100, avgDiversity: 100, avgSymbiosis: 100, avgClarity: 100,
      thrivingCount: 0, bleachingCount: 0, deadCount: 0, totalSpecies: 0,
      zoneType: 'atoll', biodiversity: 100, condition: 'pristine-reef',
    }
  }

  const n = polyps.length
  const avgHealth = Math.round(polyps.reduce((s, p) => s + p.coralHealth, 0) / n)
  const avgDiversity = Math.round(polyps.reduce((s, p) => s + p.speciesDiversity, 0) / n)
  const avgSymbiosis = Math.round(polyps.reduce((s, p) => s + p.symbiosisQuality, 0) / n)
  const avgClarity = Math.round(polyps.reduce((s, p) => s + p.waterClarity, 0) / n)

  const thrivingCount = polyps.filter(p => p.condition === 'thriving' || p.condition === 'healthy').length
  const bleachingCount = polyps.filter(p => p.condition === 'bleaching' || p.condition === 'stressed').length
  const deadCount = polyps.filter(p => p.condition === 'dead' || p.condition === 'damaged').length
  const totalSpecies = polyps.reduce((s, p) => s + p.species.total, 0)

  const zoneType = classifyZoneType(polyps)
  const biodiversity = Math.min(100, Math.round(
    avgDiversity * 0.35 + avgSymbiosis * 0.25 + avgClarity * 0.2 + avgHealth * 0.2,
  ))
  const condition = classifyReefCondition(avgHealth)

  return {
    directory: dirPath, polyps,
    avgHealth, avgDiversity, avgSymbiosis, avgClarity,
    thrivingCount, bleachingCount, deadCount, totalSpecies,
    zoneType, biodiversity, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate coral reef recommendations
 * @example
 * generateRecommendations(polyps, zones, ocean, stats) // string[]
 */
export function generateRecommendations(
  _polyps: CoralPolyp[],
  _zones: ReefZone[],
  _ocean: OceanInfo,
  stats: CoralReefStats,
): string[] {
  void _polyps
  void _zones
  void _ocean
  const recs: string[] = []

  if (stats.deadCount > 0) {
    recs.push(`Dead zones: ${stats.deadCount} files have no signs of life`)
  }
  if (stats.bleachingCount > 0) {
    recs.push(`Bleaching risk: ${stats.bleachingCount} files are losing diversity`)
  }
  if (stats.isPollutedCount > 0) {
    recs.push(`Pollution detected: ${stats.isPollutedCount} files have corrosive patterns`)
  }
  if (stats.avgParasitism > 40) {
    recs.push('High parasitism: reduce tight coupling and technical debt')
  }
  if (stats.overallReefHealth >= 70) {
    recs.push('Healthy reef: ecosystem biodiversity is thriving')
  }
  if (stats.keystoneModules > 0) {
    recs.push(`Keystone modules: ${stats.keystoneModules} critical modules identified`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete coral reef result from files and contents
 * @example
 * buildCoralReefResult(['a.ts'], ['export function a() {}'], {}) // CoralReefResult
 */
export function buildCoralReefResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): CoralReefResult {
  void options

  const polyps: CoralPolyp[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeCoralPolyp(content, file)
    } catch {
      return analyzeCoralPolyp('', file)
    }
  })

  const dirMap = new Map<string, CoralPolyp[]>()
  for (const p of polyps) {
    const dir = p.file.includes('/') ? p.file.slice(0, p.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(p) } else { dirMap.set(dir, [p]) }
  }

  const zones: ReefZone[] = Array.from(dirMap.entries()).map(([dir, ps]) =>
    analyzeReefZone(ps, dir),
  )

  const n = polyps.length || 1
  const avgHealth = Math.round(polyps.reduce((s, p) => s + p.coralHealth, 0) / n)
  const avgDiversity = Math.round(polyps.reduce((s, p) => s + p.speciesDiversity, 0) / n)
  const avgSymbiosis = Math.round(polyps.reduce((s, p) => s + p.symbiosisQuality, 0) / n)
  const avgClarity = Math.round(polyps.reduce((s, p) => s + p.waterClarity, 0) / n)
  const totalBiodiversity = Math.round(polyps.reduce((s, p) => s + p.biodiversityIndex, 0) / n)

  const overallReefHealth = Math.min(100, Math.max(0, Math.round(
    avgHealth * 0.25 +
    avgDiversity * 0.2 +
    avgSymbiosis * 0.2 +
    avgClarity * 0.2 +
    totalBiodiversity * 0.15,
  )))

  const ocean: OceanInfo = {
    avgHealth, avgDiversity, avgSymbiosis, avgClarity,
    totalBiodiversity, isHealthy: overallReefHealth >= 60, overallReefHealth,
  }

  const stats: CoralReefStats = {
    totalFiles: files.length,
    totalZones: zones.length,
    avgCoralHealth: avgHealth,
    avgSpeciesDiversity: avgDiversity,
    avgSymbiosisQuality: avgSymbiosis,
    avgWaterClarity: avgClarity,
    avgBiodiversityIndex: totalBiodiversity,
    avgReefResilience: Math.round(polyps.reduce((s, p) => s + p.reefResilience, 0) / n),
    thrivingCount: polyps.filter(p => p.condition === 'thriving').length,
    healthyCount: polyps.filter(p => p.condition === 'healthy').length,
    stressedCount: polyps.filter(p => p.condition === 'stressed').length,
    bleachingCount: polyps.filter(p => p.condition === 'bleaching').length,
    damagedCount: polyps.filter(p => p.condition === 'damaged').length,
    deadCount: polyps.filter(p => p.condition === 'dead').length,
    totalSpecies: polyps.reduce((s, p) => s + p.species.total, 0),
    avgMutualism: Math.round(polyps.reduce((s, p) => s + p.symbiosis.mutualism, 0) / n),
    avgParasitism: Math.round(polyps.reduce((s, p) => s + p.symbiosis.parasitism, 0) / n),
    foundationModules: polyps.filter(p => p.reef.isFoundation).length,
    keystoneModules: polyps.filter(p => p.ecosystem.isKeystone).length,
    isCleanCount: polyps.filter(p => p.water.isClean).length,
    isPollutedCount: polyps.filter(p => p.water.isPolluted).length,
    hasZooxanthellaeCount: polyps.filter(p => p.symbiosis.hasZooxanthellae).length,
    providesHabitatCount: polyps.filter(p => p.ecosystem.providesHabitat).length,
    overallReefHealth,
    marineBiologistGrade: classifyMarineBiologistGrade(overallReefHealth),
    healthiestPolyp: polyps.length > 0
      ? polyps.reduce((a, b) => b.coralHealth > a.coralHealth ? b : a, polyps[0]).file : 'none',
    mostDiverse: polyps.length > 0
      ? polyps.reduce((a, b) => b.speciesDiversity > a.speciesDiversity ? b : a, polyps[0]).file : 'none',
    bestSymbiosis: polyps.length > 0
      ? polyps.reduce((a, b) => b.symbiosisQuality > a.symbiosisQuality ? b : a, polyps[0]).file : 'none',
    mostPolluted: polyps.length > 0
      ? polyps.reduce((a, b) => b.water.acidity > a.water.acidity ? b : a, polyps[0]).file : 'none',
    mostBleached: polyps.length > 0
      ? polyps.reduce((a, b) => b.bleaching.risk > a.bleaching.risk ? b : a, polyps[0]).file : 'none',
  }

  const recommendations = generateRecommendations(polyps, zones, ocean, stats)

  return { polyps, zones, ocean, stats, recommendations }
}
