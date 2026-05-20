// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Organism {
  file: string
  species: 'producer' | 'primary-consumer' | 'secondary-consumer' | 'apex-predator' | 'decomposer' | 'parasite' | 'symbiont'
  kingdom: 'animalia' | 'plantae' | 'fungi' | 'bacteria' | 'archaea' | 'protista'
  fitness: number
  adaptability: number
  reproduction: number
  diet: string[]
  predators: string[]
  prey: string[]
  symbionts: string[]
  parasites: string[]
  habitat: string
  niche: string
  population: number
  biomass: number
  trophicLevel: number
  extinctionRisk: 'none' | 'low' | 'moderate' | 'high' | 'critical' | 'extinct'
  invasivePotential: number
  keystone: boolean
  native: boolean
  health: 'thriving' | 'healthy' | 'stressed' | 'declining' | 'endangered' | 'extinct'
  mutations: number
  lifespan: 'ephemeral' | 'annual' | 'perennial' | 'ancient' | 'fossil'
}

export interface Biome {
  directory: string
  organisms: Organism[]
  biomeType: 'rainforest' | 'temperate-forest' | 'grassland' | 'desert' | 'tundra' | 'wetland' | 'coral-reef' | 'deep-sea' | 'volcanic'
  biodiversity: number
  speciesCount: number
  keystoneCount: number
  producerCount: number
  consumerCount: number
  decomposerCount: number
  parasiteCount: number
  avgFitness: number
  avgAdaptability: number
  trophicEfficiency: number
  nutrientCycling: number
  ecologicalBalance: number
  hasInvasiveSpecies: boolean
  invasiveCount: number
  endangeredCount: number
  extinctCount: number
  foodChainDepth: number
  stability: 'climax' | 'mature' | 'succession' | 'pioneer' | 'disturbed' | 'barren'
  health: 'pristine' | 'healthy' | 'fair' | 'stressed' | 'degraded' | 'collapsed'
}

export interface FoodWeb {
  links: number
  avgChainLength: number
  maxChainLength: number
  cycles: number
  keystoneNodes: number
  apexNodes: number
  basalNodes: number
}

export interface TerrariumStats {
  totalFiles: number
  totalBiomes: number
  totalOrganisms: number
  avgFitness: number
  avgAdaptability: number
  avgReproduction: number
  biodiversity: number
  avgTrophicEfficiency: number
  avgNutrientCycling: number
  avgEcologicalBalance: number
  thrivingCount: number
  endangeredCount: number
  extinctCount: number
  keystoneCount: number
  parasiteCount: number
  invasiveCount: number
  foodChainCycles: number
  foodChainDepth: number
  climaxBiomes: number
  barrenBiomes: number
  ecologicalHealth: number
  ecosystemGrade: 'thriving' | 'balanced' | 'stressed' | 'fragile' | 'collapsing' | 'dead'
  dominantBiome: string
  mostDiverse: string
  leastDiverse: string
  keystoneFile: string
  parasiteFile: string
}

export interface TerrariumResult {
  organisms: Organism[]
  biomes: Biome[]
  foodWeb: FoodWeb
  stats: TerrariumStats
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────────────────────────

const EXPORT_RE = /export\s+(?:default\s+)?(?:function|class|const|let|interface|type)/g
const IMPORT_FROM_RE = /import\s+.*?from\s+['"]([^'"]+)['"]/g
const FUNCTION_RE = /(?:export\s+)?(?:async\s+)?function\s+\w+/g
const CLASS_RE = /(?:export\s+)?(?:abstract\s+)?class\s+\w+/g
const INTERFACE_RE = /(?:export\s+)?interface\s+\w+/g
const TYPE_RE = /(?:export\s+)?type\s+\w+/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const TODO_RE = /\/\/\s*(TODO|FIXME|HACK|XXX)/gi
const ANY_RE = /:\s*any\b/g
const CONSOLE_RE = /console\.\w+\(/g
const TEST_RE = /(?:describe|it|test)\s*\(/g

// ─── Species Classification ─────────────────────────────────────────────────

/**
 * Classify organism species based on content and relationships
 * @example
 * classifySpecies({ exports: 5, imports: 0, isTest: false }) // 'producer'
 */
export function classifySpecies(info: { exports: number; imports: number; isTest: boolean; isCommand: boolean }): Organism['species'] {
  if (info.isTest) return 'decomposer'
  if (info.isCommand) return 'apex-predator'
  if (info.exports >= 3 && info.imports <= 2) return 'producer'
  if (info.exports >= 1 && info.imports >= 3) return 'symbiont'
  if (info.imports >= 5 && info.exports === 0) return 'parasite'
  if (info.exports >= 2 && info.imports >= 2) return 'primary-consumer'
  return 'secondary-consumer'
}

/**
 * Classify organism kingdom based on code characteristics
 * @example
 * classifyKingdom({ hasClasses: true, hasFunctions: false }) // 'animalia'
 */
export function classifyKingdom(info: { hasClasses: boolean; hasFunctions: boolean; hasInterfaces: boolean; hasTypes: boolean; isTest: boolean }): Organism['kingdom'] {
  if (info.isTest) return 'fungi'
  if (info.hasInterfaces || info.hasTypes) return 'plantae'
  if (info.hasClasses && info.hasFunctions) return 'animalia'
  if (info.hasClasses) return 'archaea'
  if (info.hasFunctions) return 'bacteria'
  return 'protista'
}

/**
 * Classify extinction risk based on fitness and dependencies
 * @example
 * classifyExtinctionRisk(90, 10) // 'none'
 */
export function classifyExtinctionRisk(fitness: number, population: number): Organism['extinctionRisk'] {
  if (fitness >= 70 && population >= 3) return 'none'
  if (fitness >= 60 && population >= 1) return 'low'
  if (fitness >= 40) return 'moderate'
  if (fitness >= 25) return 'high'
  if (fitness >= 10) return 'critical'
  return 'extinct'
}

/**
 * Classify organism health from fitness score
 * @example
 * classifyOrganismHealth(85) // 'thriving'
 */
export function classifyOrganismHealth(fitness: number): Organism['health'] {
  if (fitness >= 80) return 'thriving'
  if (fitness >= 60) return 'healthy'
  if (fitness >= 40) return 'stressed'
  if (fitness >= 25) return 'declining'
  if (fitness >= 10) return 'endangered'
  return 'extinct'
}

/**
 * Classify biome type based on organism composition
 * @example
 * classifyBiomeType({ speciesCount: 20, biodiversity: 85, producerCount: 8 }) // 'rainforest'
 */
export function classifyBiomeType(info: { speciesCount: number; biodiversity: number; producerCount: number; parasiteCount: number; endangeredCount: number }): Biome['biomeType'] {
  if (info.biodiversity >= 70 && info.speciesCount >= 10 && info.producerCount >= 3) return 'rainforest'
  if (info.biodiversity >= 50 && info.speciesCount >= 5) return 'temperate-forest'
  if (info.biodiversity >= 40 && info.producerCount >= 2) return 'grassland'
  if (info.parasiteCount >= 3) return 'volcanic'
  if (info.speciesCount <= 2) return 'tundra'
  if (info.producerCount >= 4 && info.biodiversity >= 30) return 'coral-reef'
  if (info.endangeredCount >= 3) return 'deep-sea'
  if (info.biodiversity >= 30) return 'wetland'
  return 'desert'
}

/**
 * Classify biome stability
 * @example
 * classifyStability(80, true) // 'climax'
 */
export function classifyStability(ecologicalBalance: number, hasKeystone: boolean): Biome['stability'] {
  if (ecologicalBalance >= 70 && hasKeystone) return 'climax'
  if (ecologicalBalance >= 55) return 'mature'
  if (ecologicalBalance >= 35) return 'succession'
  if (ecologicalBalance >= 20) return 'pioneer'
  if (ecologicalBalance >= 5) return 'disturbed'
  return 'barren'
}

/**
 * Classify biome health
 * @example
 * classifyBiomeHealth(75) // 'healthy'
 */
export function classifyBiomeHealth(avgFitness: number): Biome['health'] {
  if (avgFitness >= 75) return 'pristine'
  if (avgFitness >= 60) return 'healthy'
  if (avgFitness >= 45) return 'fair'
  if (avgFitness >= 30) return 'stressed'
  if (avgFitness >= 15) return 'degraded'
  return 'collapsed'
}

/**
 * Classify ecosystem grade from ecological health
 * @example
 * classifyEcosystemGrade(85) // 'thriving'
 */
export function classifyEcosystemGrade(health: number): TerrariumStats['ecosystemGrade'] {
  if (health >= 80) return 'thriving'
  if (health >= 60) return 'balanced'
  if (health >= 40) return 'stressed'
  if (health >= 20) return 'fragile'
  if (health >= 5) return 'collapsing'
  return 'dead'
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as an organism
 * @example
 * analyzeOrganism('export function add(a: number, b: number) { return a + b }', 'add.ts', [], []) // Organism
 */
export function analyzeOrganism(content: string, filePath: string, imports: string[], dependents: string[]): Organism {
  const codeLines = content.split('\n').filter(l => l.trim().length > 0)

  const exports = (content.match(EXPORT_RE) ?? []).length
  const importCount = imports.length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const todos = (content.match(TODO_RE) ?? []).length
  const testMatches = (content.match(TEST_RE) ?? []).length
  const isTest = testMatches > 0
  const isCommand = filePath.includes('commands/') && !filePath.includes('-helpers') && !filePath.includes('-format-helpers')

  const species = classifySpecies({ exports, imports: importCount, isTest, isCommand })
  const kingdom = classifyKingdom({ hasClasses: classes > 0, hasFunctions: functions > 0, hasInterfaces: interfaces > 0, hasTypes: types > 0, isTest })

  const fitness = computeFitness(exports, functions + classes, interfaces + types, jsdoc, anys, todos, codeLines.length)
  const adaptability = computeAdaptability(exports, interfaces + types, anys, codeLines.length)
  const reproduction = computeReproduction(exports, functions + classes, codeLines.length)

  const normalized = filePath.replace(/\\/g, '/')
  const habitat = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '.'

  const niche = identifyNiche(species, exports, functions, classes, interfaces)
  const population = dependents.length
  const biomass = codeLines.length
  const trophicLevel = computeTrophicLevel(species, importCount, population)
  const extinctionRisk = classifyExtinctionRisk(fitness, population)
  const invasivePotential = computeInvasivePotential(importCount, exports, codeLines.length)
  const keystone = population >= 3 && fitness >= 50
  const native = true
  const health = classifyOrganismHealth(fitness)
  const mutations = computeMutations(anys, todos, codeLines.length)
  const lifespan = classifyLifespan(biomass, exports)

  const prey = imports
  const predators = dependents
  const symbionts = findSymbionts(imports, dependents)
  const parasites = findParasites(imports, dependents, exports)

  return {
    file: filePath,
    species,
    kingdom,
    fitness,
    adaptability,
    reproduction,
    diet: imports,
    predators: dependents,
    prey,
    symbionts,
    parasites,
    habitat,
    niche,
    population,
    biomass,
    trophicLevel,
    extinctionRisk,
    invasivePotential,
    keystone,
    native,
    health,
    mutations,
    lifespan,
  }
}

// ─── Metric Computations ─────────────────────────────────────────────────────

function computeFitness(exports: number, constructs: number, structural: number, jsdoc: number, anys: number, todos: number, lines: number): number {
  if (lines === 0) return 0
  let score = 35
  score += Math.min(20, exports * 3)
  score += Math.min(10, structural * 3)
  score += Math.min(10, jsdoc * 2)
  score -= anys * 10
  score -= todos * 8
  if (constructs > 0 && constructs <= 8) score += 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeAdaptability(exports: number, structural: number, anys: number, lines: number): number {
  if (lines === 0) return 0
  let score = 40
  if (exports >= 1 && exports <= 5) score += 20
  else if (exports > 5 && exports <= 10) score += 10
  if (structural >= 1) score += 15
  score -= anys * 8
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeReproduction(exports: number, constructs: number, lines: number): number {
  if (lines === 0) return 0
  let score = 30
  score += Math.min(25, exports * 4)
  if (constructs >= 1 && constructs <= 6) score += 20
  else if (constructs > 6) score += 10
  if (exports > 0 && constructs > 0) score += 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeTrophicLevel(species: Organism['species'], imports: number, population: number): number {
  switch (species) {
    case 'producer': return 1
    case 'decomposer': return 2
    case 'primary-consumer': return 2
    case 'secondary-consumer': return 3
    case 'apex-predator': return 5
    case 'symbiont': return Math.min(4, Math.max(2, Math.round((imports + population) / 2)))
    case 'parasite': return 4
    default: return 2
  }
}

function computeInvasivePotential(imports: number, exports: number, lines: number): number {
  if (lines === 0) return 0
  const ratio = imports > 0 ? exports / imports : exports
  return Math.min(100, Math.round(Math.max(0, 50 - ratio * 10 + imports * 5)))
}

function computeMutations(anys: number, todos: number, lines: number): number {
  if (lines === 0) return 0
  return anys * 3 + todos * 2 + Math.floor(lines / 50)
}

function classifyLifespan(biomass: number, exports: number): Organism['lifespan'] {
  if (biomass > 300 && exports > 5) return 'ancient'
  if (biomass > 150 && exports > 2) return 'perennial'
  if (biomass > 30) return 'annual'
  if (biomass > 0) return 'ephemeral'
  return 'fossil'
}

function identifyNiche(species: Organism['species'], exports: number, functions: number, classes: number, interfaces: number): string {
  switch (species) {
    case 'producer': return interfaces > 0 ? 'type-provider' : 'utility-source'
    case 'primary-consumer': return 'middleware-processor'
    case 'secondary-consumer': return classes > 0 ? 'service-handler' : 'logic-processor'
    case 'apex-predator': return 'entry-point'
    case 'decomposer': return 'test-validator'
    case 'parasite': return 'dependency-drain'
    case 'symbiont': return 'mutual-exchanger'
    default: return 'generalist'
  }
}

function findSymbionts(imports: string[], dependents: string[], exports: number): string[] {
  if (exports === 0) return []
  const importSet = new Set(imports)
  const result: string[] = []
  for (const dep of dependents) {
    if (importSet.has(dep)) result.push(dep)
  }
  return result
}

function findParasites(imports: string[], dependents: string[], exports: number): string[] {
  if (exports > 0 || imports.length === 0) return []
  return imports.slice(0, 5)
}

// ─── Import Extraction ───────────────────────────────────────────────────────

/**
 * Extract import paths from file content
 * @example
 * extractImportPaths('import { x } from "./helper"') // ['./helper']
 */
export function extractImportPaths(content: string): string[] {
  const paths: string[] = []
  let match: RegExpExecArray | null
  const re = new RegExp(IMPORT_FROM_RE.source, 'g')
  while ((match = re.exec(content)) !== null) {
    paths.push(match[1])
  }
  return paths
}

// ─── Biome Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a directory as a biome
 * @example
 * analyzeBiome(organisms, 'src') // Biome
 */
export function analyzeBiome(organisms: Organism[], dirPath: string): Biome {
  if (organisms.length === 0) {
    return {
      directory: dirPath,
      organisms: [],
      biomeType: 'tundra',
      biodiversity: 0,
      speciesCount: 0,
      keystoneCount: 0,
      producerCount: 0,
      consumerCount: 0,
      decomposerCount: 0,
      parasiteCount: 0,
      avgFitness: 0,
      avgAdaptability: 0,
      trophicEfficiency: 0,
      nutrientCycling: 0,
      ecologicalBalance: 0,
      hasInvasiveSpecies: false,
      invasiveCount: 0,
      endangeredCount: 0,
      extinctCount: 0,
      foodChainDepth: 0,
      stability: 'barren',
      health: 'collapsed',
    }
  }

  const speciesCount = Array.from(new Set(organisms.map(o => o.species))).length
  const kingdomCount = Array.from(new Set(organisms.map(o => o.kingdom))).length
  const biodiversity = Math.min(100, Math.round((speciesCount * 10 + kingdomCount * 15) / 2))

  const keystoneCount = organisms.filter(o => o.keystone).length
  const producerCount = organisms.filter(o => o.species === 'producer').length
  const consumerCount = organisms.filter(o => o.species === 'primary-consumer' || o.species === 'secondary-consumer').length
  const decomposerCount = organisms.filter(o => o.species === 'decomposer').length
  const parasiteCount = organisms.filter(o => o.species === 'parasite').length

  const avgFitness = Math.round(organisms.reduce((s, o) => s + o.fitness, 0) / organisms.length)
  const avgAdaptability = Math.round(organisms.reduce((s, o) => s + o.adaptability, 0) / organisms.length)

  const trophicEfficiency = computeTrophicEfficiency(organisms)
  const nutrientCycling = computeNutrientCycling(organisms)

  const ecologicalBalance = Math.round((avgFitness + biodiversity + trophicEfficiency + nutrientCycling) / 4)
  const invasiveCount = organisms.filter(o => o.invasivePotential >= 60).length
  const hasInvasiveSpecies = invasiveCount > 0
  const endangeredCount = organisms.filter(o => o.extinctionRisk === 'high' || o.extinctionRisk === 'critical' || o.extinctionRisk === 'extinct').length
  const extinctCount = organisms.filter(o => o.extinctionRisk === 'extinct').length
  const foodChainDepth = Math.max(...organisms.map(o => o.trophicLevel))

  const biomeType = classifyBiomeType({ speciesCount: organisms.length, biodiversity, producerCount, parasiteCount, endangeredCount })
  const hasKeystone = keystoneCount > 0
  const stability = classifyStability(ecologicalBalance, hasKeystone)
  const health = classifyBiomeHealth(avgFitness)

  return {
    directory: dirPath,
    organisms,
    biomeType,
    biodiversity,
    speciesCount,
    keystoneCount,
    producerCount,
    consumerCount,
    decomposerCount,
    parasiteCount,
    avgFitness,
    avgAdaptability,
    trophicEfficiency,
    nutrientCycling,
    ecologicalBalance,
    hasInvasiveSpecies,
    invasiveCount,
    endangeredCount,
    extinctCount,
    foodChainDepth,
    stability,
    health,
  }
}

function computeTrophicEfficiency(organisms: Organism[]): number {
  if (organisms.length === 0) return 0
  const withPrey = organisms.filter(o => o.prey.length > 0)
  if (withPrey.length === 0) return 50
  const avgRatio = withPrey.reduce((s, o) => {
    const usefulPrey = o.prey.filter(p => o.predators.length > 0 || o.exports > 0)
    return s + (usefulPrey.length / (o.prey.length || 1))
  }, 0) / withPrey.length
  return Math.min(100, Math.round(avgRatio * 100))
}

function computeNutrientCycling(organisms: Organism[]): number {
  if (organisms.length === 0) return 0
  const totalFlow = organisms.reduce((s, o) => s + o.prey.length + o.predators.length, 0)
  const maxFlow = organisms.length * 10
  return Math.min(100, Math.round((totalFlow / (maxFlow || 1)) * 100))
}

// ─── Food Web ────────────────────────────────────────────────────────────────

/**
 * Build food web analysis from organisms
 * @example
 * buildFoodWeb(organisms) // FoodWeb
 */
export function buildFoodWeb(organisms: Organism[]): FoodWeb {
  const links = organisms.reduce((s, o) => s + o.prey.length, 0)
  const chainLengths = organisms.map(o => o.trophicLevel)
  const avgChainLength = chainLengths.length > 0 ? Math.round(chainLengths.reduce((s, l) => s + l, 0) / chainLengths.length * 10) / 10 : 0
  const maxChainLength = chainLengths.length > 0 ? Math.max(...chainLengths) : 0

  const cycles = detectCycles(organisms)
  const keystoneNodes = organisms.filter(o => o.keystone).length
  const apexNodes = organisms.filter(o => o.species === 'apex-predator').length
  const basalNodes = organisms.filter(o => o.trophicLevel === 1).length

  return { links, avgChainLength, maxChainLength, cycles, keystoneNodes, apexNodes, basalNodes }
}

function detectCycles(organisms: Organism[]): number {
  const fileSet = new Set(organisms.map(o => o.file))
  let cycles = 0
  for (const org of organisms) {
    for (const prey of org.prey) {
      const preyOrg = organisms.find(o => o.file === prey)
      if (preyOrg && preyOrg.prey.includes(org.file)) {
        cycles++
      }
    }
  }
  return Math.floor(cycles / 2)
}

// ─── Ecological Health ───────────────────────────────────────────────────────

/**
 * Compute overall ecological health
 * @example
 * computeEcologicalHealth(biomes, organisms) // 75
 */
export function computeEcologicalHealth(biomes: Biome[], organisms: Organism[]): number {
  if (organisms.length === 0) return 0
  const avgFitness = organisms.reduce((s, o) => s + o.fitness, 0) / organisms.length
  const avgBalance = biomes.length > 0 ? biomes.reduce((s, b) => s + b.ecologicalBalance, 0) / biomes.length : 0
  const parasiteRatio = organisms.filter(o => o.species === 'parasite').length / organisms.length
  const parasitePenalty = parasiteRatio * 30
  return Math.min(100, Math.max(0, Math.round((avgFitness * 0.5 + avgBalance * 0.5) - parasitePenalty)))
}

/**
 * Identify keystone file
 * @example
 * identifyKeystoneFile(organisms) // 'src/core.ts'
 */
export function identifyKeystoneFile(organisms: Organism[]): string {
  const keystones = organisms.filter(o => o.keystone)
  if (keystones.length === 0) return organisms.length > 0 ? organisms[0].file : 'none'
  keystones.sort((a, b) => (b.population * b.fitness) - (a.population * a.fitness))
  return keystones[0].file
}

/**
 * Identify parasite file
 * @example
 * identifyParasiteFile(organisms) // 'src/bloat.ts'
 */
export function identifyParasiteFile(organisms: Organism[]): string {
  const parasites = organisms.filter(o => o.species === 'parasite')
  if (parasites.length === 0) return 'none'
  parasites.sort((a, b) => b.invasivePotential - a.invasivePotential)
  return parasites[0].file
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations for improving ecosystem health
 * @example
 * generateTerrariumRecommendations(organisms, biomes, foodWeb, stats) // string[]
 */
export function generateTerrariumRecommendations(
  organisms: Organism[],
  biomes: Biome[],
  foodWeb: FoodWeb,
  stats: TerrariumStats,
): string[] {
  const recs: string[] = []

  if (stats.parasiteCount > 0) recs.push(`${stats.parasiteCount} parasite file(s) detected - refactor to contribute exports`)
  if (stats.endangeredCount > 2) recs.push(`${stats.endangeredCount} endangered organism(s) - stabilize critical files`)
  if (foodWeb.cycles > 0) recs.push(`${foodWeb.cycles} circular dependency cycle(s) detected - break food chain loops`)
  if (stats.barrenBiomes > 0) recs.push(`${stats.barrenBiomes} barren biome(s) - populate empty directories`)
  if (stats.avgFitness < 40) recs.push('Low average fitness - improve code quality across ecosystem')
  if (stats.biodiversity < 30) recs.push('Low biodiversity - introduce more code construct variety')
  if (stats.avgEcologicalBalance < 40) recs.push('Ecological imbalance - restructure dependency hierarchy')
  if (stats.foodChainCycles > 0) recs.push(`Break ${stats.foodChainCycles} food chain cycle(s) for stability`)
  if (stats.invasiveCount > 0) recs.push(`${stats.invasiveCount} invasive species - contain spreading dependencies`)
  if (stats.extinctCount > 0) recs.push(`${stats.extinctCount} extinct file(s) - consider removal or revival`)

  const climaxBiomes = biomes.filter(b => b.stability === 'climax')
  if (climaxBiomes.length === biomes.length && biomes.length > 0) recs.push('All biomes at climax stability - ecosystem is mature and healthy')

  if (recs.length === 0) recs.push('Thriving ecosystem - all organisms healthy and balanced')
  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete terrarium analysis result
 * @example
 * buildTerrariumResult(files, contents, {}) // TerrariumResult
 */
export function buildTerrariumResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): TerrariumResult {
  const importMap = new Map<string, string[]>()
  for (let i = 0; i < files.length; i++) {
    const rawImports = extractImportPaths(contents[i])
    const resolvedImports = resolveImports(files[i], rawImports, files)
    importMap.set(files[i], resolvedImports)
  }

  const dependentMap = new Map<string, string[]>()
  for (const file of files) {
    if (!dependentMap.has(file)) dependentMap.set(file, [])
  }
  for (const [file, imports] of importMap) {
    for (const imp of imports) {
      const deps = dependentMap.get(imp)
      if (deps) deps.push(file)
    }
  }

  const organisms: Organism[] = []
  for (let i = 0; i < files.length; i++) {
    const imports = importMap.get(files[i]) ?? []
    const dependents = dependentMap.get(files[i]) ?? []
    organisms.push(analyzeOrganism(contents[i], files[i], imports, dependents))
  }

  const dirMap = new Map<string, Organism[]>()
  for (const org of organisms) {
    const existing = dirMap.get(org.habitat)
    if (existing) existing.push(org)
    else dirMap.set(org.habitat, [org])
  }

  const biomes: Biome[] = []
  for (const [dir, dirOrganisms] of dirMap) {
    biomes.push(analyzeBiome(dirOrganisms, dir))
  }

  const foodWeb = buildFoodWeb(organisms)
  const stats = computeTerrariumStats(organisms, biomes, foodWeb)
  const recommendations = generateTerrariumRecommendations(organisms, biomes, foodWeb, stats)

  return { organisms, biomes, foodWeb, stats, recommendations }
}

function resolveImports(fromFile: string, rawImports: string[], allFiles: string[]): string[] {
  const fromDir = fromFile.includes('/') ? fromFile.substring(0, fromFile.lastIndexOf('/')) : '.'
  const resolved: string[] = []
  for (const imp of rawImports) {
    if (imp.startsWith('.')) {
      const resolvedPath = resolveRelative(fromDir, imp)
      const match = allFiles.find(f => {
        const norm = f.replace(/\\/g, '/')
        return norm === resolvedPath || norm === resolvedPath + '.ts' || norm === resolvedPath + '.js' || norm.startsWith(resolvedPath + '/')
      })
      if (match) resolved.push(match)
    }
  }
  return resolved
}

function resolveRelative(fromDir: string, relativePath: string): string {
  const parts = fromDir.split('/')
  const relParts = relativePath.split('/')
  for (const part of relParts) {
    if (part === '..') parts.pop()
    else if (part !== '.') parts.push(part)
  }
  return parts.join('/')
}

function computeTerrariumStats(organisms: Organism[], biomes: Biome[], foodWeb: FoodWeb): TerrariumStats {
  const totalFiles = organisms.length
  const totalBiomes = biomes.length
  const totalOrganisms = organisms.length

  const avgFitness = totalFiles > 0 ? Math.round(organisms.reduce((s, o) => s + o.fitness, 0) / totalFiles) : 0
  const avgAdaptability = totalFiles > 0 ? Math.round(organisms.reduce((s, o) => s + o.adaptability, 0) / totalFiles) : 0
  const avgReproduction = totalFiles > 0 ? Math.round(organisms.reduce((s, o) => s + o.reproduction, 0) / totalFiles) : 0

  const speciesSet = new Set(organisms.map(o => o.species))
  const kingdomSet = new Set(organisms.map(o => o.kingdom))
  const biodiversity = Math.min(100, speciesSet.size * 8 + kingdomSet.size * 10)

  const avgTrophicEfficiency = biomes.length > 0 ? Math.round(biomes.reduce((s, b) => s + b.trophicEfficiency, 0) / biomes.length) : 0
  const avgNutrientCycling = biomes.length > 0 ? Math.round(biomes.reduce((s, b) => s + b.nutrientCycling, 0) / biomes.length) : 0
  const avgEcologicalBalance = biomes.length > 0 ? Math.round(biomes.reduce((s, b) => s + b.ecologicalBalance, 0) / biomes.length) : 0

  const thrivingCount = organisms.filter(o => o.health === 'thriving' || o.health === 'healthy').length
  const endangeredCount = organisms.filter(o => o.extinctionRisk === 'high' || o.extinctionRisk === 'critical' || o.extinctionRisk === 'extinct').length
  const extinctCount = organisms.filter(o => o.extinctionRisk === 'extinct').length
  const keystoneCount = organisms.filter(o => o.keystone).length
  const parasiteCount = organisms.filter(o => o.species === 'parasite').length
  const invasiveCount = organisms.filter(o => o.invasivePotential >= 60).length

  const ecologicalHealth = computeEcologicalHealth(biomes, organisms)
  const ecosystemGrade = classifyEcosystemGrade(ecologicalHealth)

  const foodChainCycles = foodWeb.cycles
  const foodChainDepth = foodWeb.maxChainLength

  const climaxBiomes = biomes.filter(b => b.stability === 'climax').length
  const barrenBiomes = biomes.filter(b => b.stability === 'barren').length

  const biomeCounts = new Map<string, number>()
  for (const b of biomes) {
    biomeCounts.set(b.biomeType, (biomeCounts.get(b.biomeType) ?? 0) + 1)
  }
  let dominantBiome = 'desert'
  let maxBiome = 0
  for (const [bt, count] of biomeCounts) {
    if (count > maxBiome) { maxBiome = count; dominantBiome = bt }
  }

  const sortedByDiversity = [...biomes].sort((a, b) => b.biodiversity - a.biodiversity)
  const mostDiverse = sortedByDiversity.length > 0 ? sortedByDiversity[0].directory : 'none'
  const leastDiverse = sortedByDiversity.length > 0 ? sortedByDiversity[sortedByDiversity.length - 1].directory : 'none'

  const keystoneFile = identifyKeystoneFile(organisms)
  const parasiteFile = identifyParasiteFile(organisms)

  return {
    totalFiles,
    totalBiomes,
    totalOrganisms,
    avgFitness,
    avgAdaptability,
    avgReproduction,
    biodiversity,
    avgTrophicEfficiency,
    avgNutrientCycling,
    avgEcologicalBalance,
    thrivingCount,
    endangeredCount,
    extinctCount,
    keystoneCount,
    parasiteCount,
    invasiveCount,
    foodChainCycles,
    foodChainDepth,
    climaxBiomes,
    barrenBiomes,
    ecologicalHealth,
    ecosystemGrade,
    dominantBiome,
    mostDiverse,
    leastDiverse,
    keystoneFile,
    parasiteFile,
  }
}
