// ─── Types ─────────────────────────────────────────────────────────────────────

export type PlantSpecies = 'tree' | 'shrub' | 'flower' | 'vine' | 'weed' | 'cactus'
export type AttentionType = 'watering' | 'weeding' | 'pruning' | 'fertilizing' | 'transplanting' | 'staking'
export type BedCondition = 'thriving' | 'healthy' | 'needs-work' | 'overgrown' | 'barren'

export interface Attention {
  type: AttentionType
  urgency: 'low' | 'medium' | 'high'
  description: string
  action: string
}

export interface Plant {
  file: string
  species: PlantSpecies
  health: number
  age: number
  height: number
  rootDepth: number
  fruitCount: number
  needsAttention: Attention[]
}

export interface GardenBed {
  name: string
  plants: Plant[]
  soil: number
  biodiversity: number
  density: number
  condition: BedCondition
}

export interface GardenerStats {
  totalPlants: number
  thrivingCount: number
  needsAttentionCount: number
  weedCount: number
  avgHealth: number
  gardenDiversity: number
  tallestPlant: string
  deepestRoots: string
  mostFruitful: string
  bedsNeedingWork: number
  overallGardenHealth: number
}

export interface GardenerResult {
  plants: Plant[]
  beds: GardenBed[]
  stats: GardenerStats
  recommendations: string[]
}

// ─── Species Classification ───────────────────────────────────────────────────

/**
 * Classify a file as a plant species.
 *
 * @example
 * classifyPlant('a.ts', content, 2, 3)
 */
export function classifyPlant(
  _file: string,
  content: string,
  importCount: number,
  exportCount: number,
): PlantSpecies {
  const lines = content.split('\n').filter((l) => l.trim().length > 0).length

  const unusedExports = detectUnusedExports(content)
  const commentedOut = detectCommentedOutCode(content)
  if (unusedExports.length > 0 || commentedOut) return 'weed'

  if (importCount > 5 && exportCount > 5) return 'vine'

  if (lines > 200) return 'tree'
  if (lines >= 50) return 'shrub'
  if (lines < 20 && importCount <= 1) return 'cactus'
  return 'flower'
}

// ─── Helper Detection Functions ────────────────────────────────────────────────

/**
 * Detect unused exports in content.
 *
 * @example
 * detectUnusedExports('export function foo() {}')
 */
export function detectUnusedExports(content: string): string[] {
  const exports: string[] = []
  const m = content.match(/^export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+(\w+)/gm)
  if (!m) return []
  for (const exp of m) {
    const nameMatch = exp.match(/(\w+)$/)
    if (nameMatch) exports.push(nameMatch[1] ?? '')
  }

  const internalRefs = content.replace(/^export\s+/gm, '')
  return exports.filter((name) => {
    const re = new RegExp(`\\b${name}\\b`)
    const matches = internalRefs.match(re)
    return !matches || matches.length === 0
  })
}

/**
 * Detect commented-out code blocks.
 *
 * @example
 * detectCommentedOutCode('// const x = 1\n// const y = 2\n// const z = 3')
 */
export function detectCommentedOutCode(content: string): boolean {
  const lines = content.split('\n')
  let consecutive = 0
  for (const line of lines) {
    if (/^\s*\/\/\s*(const|let|var|function|class|import|export|return|if|for|while)/.test(line)) {
      consecutive++
      if (consecutive >= 3) return true
    } else {
      consecutive = 0
    }
  }
  return false
}

/**
 * Count imports in content.
 *
 * @example
 * countImports("import { a } from 'x'")
 */
export function countImports(content: string): number {
  const m = content.match(/^import\s+/gm)
  return m ? m.length : 0
}

/**
 * Count exports in content.
 *
 * @example
 * countExports('export function foo() {}')
 */
export function countExports(content: string): number {
  const m = content.match(/^export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+/gm)
  return m ? m.length : 0
}

/**
 * Count JSDoc blocks.
 *
 * @example
 * countJSDoc('/** docs *\\/ export function foo() {}')
 */
export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

/**
 * Compute cyclomatic complexity.
 *
 * @example
 * computeComplexity('if (x) { for (let i = 0; i < 10; i++) {} }')
 */
export function computeComplexity(content: string): number {
  const patterns = [/\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcatch\b/g, /&&/g, /\|\|/g]
  let total = 1
  for (const pat of patterns) {
    const m = content.match(pat)
    if (m) total += m.length
  }
  return total
}

/**
 * Count TODO/FIXME markers.
 *
 * @example
 * countTodoMarkers('// TODO: fix')
 */
export function countTodoMarkers(content: string): number {
  const m = content.match(/\/\/\s*(TODO|FIXME|HACK|XXX)[\s:]/gi)
  return m ? m.length : 0
}

// ─── Plant Health ──────────────────────────────────────────────────────────────

/**
 * Compute plant health score (0-100).
 *
 * @example
 * computePlantHealth(content, 2, 3)
 */
export function computePlantHealth(content: string, _importCount: number, exportCount: number): number {
  let score = 60

  const jsdoc = countJSDoc(content)
  if (exportCount > 0 && jsdoc >= exportCount) score += 15
  else if (jsdoc > 0) score += 5

  const complexity = computeComplexity(content)
  if (complexity <= 5) score += 10
  else if (complexity > 20) score -= 15
  else if (complexity > 10) score -= 5

  const lines = content.split('\n').filter((l) => l.trim().length > 0).length
  if (lines > 0 && lines <= 50) score += 5
  if (lines > 300) score -= 10

  const unusedExports = detectUnusedExports(content)
  score -= unusedExports.length * 5

  if (detectCommentedOutCode(content)) score -= 10

  const todos = countTodoMarkers(content)
  if (todos > 5) score -= 10
  else if (todos > 2) score -= 5

  const goodNames = content.match(/(?:const|let|function|class)\s+[a-z][a-zA-Z0-9]{2,}/g)
  if (goodNames && goodNames.length > 3) score += 5

  const catches = content.match(/\bcatch\s*\(/g)
  if (catches && catches.length > 0 && exportCount > 0) score += 5

  return Math.max(0, Math.min(100, score))
}

// ─── Attention Needs ──────────────────────────────────────────────────────────

/**
 * Identify what attention a plant needs.
 *
 * @example
 * identifyAttentionNeeds(plant, content)
 */
export function identifyAttentionNeeds(plant: Plant, content: string): Attention[] {
  const needs: Attention[] = []

  const exports = countExports(content)
  const jsdoc = countJSDoc(content)
  if (exports > 0 && jsdoc < exports * 0.7) {
    needs.push({
      type: 'watering',
      urgency: jsdoc === 0 ? 'high' : 'medium',
      description: `${exports - jsdoc} exports lack JSDoc documentation`,
      action: 'Add documentation to exported functions and types',
    })
  }

  const unusedExports = detectUnusedExports(content)
  if (unusedExports.length > 0 || detectCommentedOutCode(content)) {
    needs.push({
      type: 'weeding',
      urgency: unusedExports.length > 3 ? 'high' : 'medium',
      description: `${unusedExports.length} unused exports or commented-out code`,
      action: 'Remove dead code and unused exports',
    })
  }

  const complexity = computeComplexity(content)
  if (complexity > 15) {
    needs.push({
      type: 'pruning',
      urgency: complexity > 25 ? 'high' : 'medium',
      description: `Complexity ${complexity} — needs simplification`,
      action: 'Break down into smaller, focused functions',
    })
  }

  const isTestFile = /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(plant.file)
  if (!isTestFile && exports > 0 && plant.species !== 'weed') {
    needs.push({
      type: 'fertilizing',
      urgency: 'low',
      description: 'No corresponding test file detected',
      action: 'Add test coverage for this module',
    })
  }

  const catches = content.match(/\bcatch\s*\(/g)
  const functions = content.match(/\bfunction\b|=>\s*[{(]/g)
  const fnCount = functions ? functions.length : 0
  if (fnCount > 3 && (!catches || catches.length === 0)) {
    needs.push({
      type: 'staking',
      urgency: 'medium',
      description: `${fnCount} functions with no error handling`,
      action: 'Add try/catch blocks for error-prone operations',
    })
  }

  return needs
}

// ─── Garden Bed Assessment ────────────────────────────────────────────────────

/**
 * Group plants into garden beds by directory.
 *
 * @example
 * groupIntoBeds(plants)
 */
export function groupIntoBeds(plants: Plant[]): GardenBed[] {
  const bedMap = new Map<string, Plant[]>()

  for (const p of plants) {
    const dir = p.file.includes('/') ? p.file.substring(0, p.file.lastIndexOf('/')) : '.'
    const arr = bedMap.get(dir) ?? []
    arr.push(p)
    bedMap.set(dir, arr)
  }

  const beds: GardenBed[] = []
  for (const [name, bedPlants] of bedMap) {
    beds.push(assessBed(name, bedPlants))
  }

  return beds
}

/**
 * Assess a garden bed's condition.
 *
 * @example
 * assessBed('src/core', plants)
 */
export function assessBed(name: string, plants: Plant[]): GardenBed {
  const species = new Set(plants.map((p) => p.species))
  const biodiversity = Math.round((species.size / 6) * 100)

  const avgHealth = plants.length > 0
    ? Math.round(plants.reduce((s, p) => s + p.health, 0) / plants.length)
    : 100

  const soil = Math.max(0, Math.min(100, avgHealth + (biodiversity > 30 ? 10 : 0)))

  let condition: BedCondition = 'thriving'
  if (plants.length === 0) condition = 'barren'
  else if (avgHealth >= 80) condition = 'thriving'
  else if (avgHealth >= 60) condition = 'healthy'
  else if (avgHealth >= 40) condition = 'needs-work'
  else condition = 'overgrown'

  return {
    name,
    plants,
    soil,
    biodiversity,
    density: plants.length,
    condition,
  }
}

// ─── Garden Diversity ─────────────────────────────────────────────────────────

/**
 * Compute garden diversity (species variety).
 *
 * @example
 * computeGardenDiversity(plants)
 */
export function computeGardenDiversity(plants: Plant[]): number {
  if (plants.length === 0) return 0
  const species = new Set(plants.map((p) => p.species))
  return Math.round((species.size / 6) * 100)
}

// ─── Overall Health ────────────────────────────────────────────────────────────

/**
 * Compute overall garden health.
 *
 * @example
 * computeOverallHealth(plants, beds)
 */
export function computeOverallHealth(plants: Plant[], beds: GardenBed[]): number {
  if (plants.length === 0) return 100

  const avgPlantHealth = plants.reduce((s, p) => s + p.health, 0) / plants.length
  const weedPenalty = plants.filter((p) => p.species === 'weed').length * 3
  const bedHealth = beds.length > 0
    ? beds.reduce((s, b) => s + b.soil, 0) / beds.length
    : 100

  return Math.max(0, Math.round((avgPlantHealth * 0.6 + bedHealth * 0.4) - weedPenalty))
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate gardening recommendations.
 *
 * @example
 * generateRecommendations(plants, beds, stats)
 */
export function generateRecommendations(
  plants: Plant[],
  beds: GardenBed[],
  stats: GardenerStats,
): string[] {
  const recs: string[] = []

  const weeds = plants.filter((p) => p.species === 'weed')
  if (weeds.length > 0) {
    recs.push(`WEED: Remove ${weeds.length} weed(s) — dead code needs cleanup`)
  }

  const needsWater = plants.filter((p) => p.needsAttention.some((a) => a.type === 'watering'))
  if (needsWater.length > 0) {
    recs.push(`WATER: ${needsWater.length} plant(s) need documentation`)
  }

  const needsPruning = plants.filter((p) => p.needsAttention.some((a) => a.type === 'pruning'))
  if (needsPruning.length > 0) {
    recs.push(`PRUNE: ${needsPruning.length} plant(s) are over-complex — simplify`)
  }

  const needsStaking = plants.filter((p) => p.needsAttention.some((a) => a.type === 'staking'))
  if (needsStaking.length > 0) {
    recs.push(`STAKE: ${needsStaking.length} plant(s) need error handling support`)
  }

  const needsFertilizing = plants.filter((p) => p.needsAttention.some((a) => a.type === 'fertilizing'))
  if (needsFertilizing.length > 0) {
    recs.push(`FERTILIZE: ${needsFertilizing.length} plant(s) need test coverage`)
  }

  const barrenBeds = beds.filter((b) => b.condition === 'barren')
  if (barrenBeds.length > 0) {
    recs.push(`BARREN: ${barrenBeds.length} bed(s) are empty — consider consolidating`)
  }

  const overgrownBeds = beds.filter((b) => b.condition === 'overgrown')
  if (overgrownBeds.length > 0) {
    recs.push(`OVERGROWN: ${overgrownBeds.length} bed(s) need major cleanup`)
  }

  if (stats.gardenDiversity < 30) {
    recs.push(`Low diversity (${stats.gardenDiversity}%) — codebase is homogeneous`)
  }

  if (recs.length === 0) {
    recs.push('Garden is thriving — all plants are healthy and well-tended')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build complete gardener result from files and contents.
 *
 * @example
 * buildGardenerResult(['a.ts'], ['const x = 1'], { maxDepth: 50 })
 */
export function buildGardenerResult(
  files: string[],
  contents: string[],
  options: { maxDepth: number },
): GardenerResult {
  const plants: Plant[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    const importCount = countImports(content)
    const exportCount = countExports(content)
    const species = classifyPlant(file, content, importCount, exportCount)
    const health = computePlantHealth(content, importCount, exportCount)

    const plant: Plant = {
      file,
      species,
      health,
      age: options.maxDepth,
      height: content.split('\n').filter((l) => l.trim().length > 0).length,
      rootDepth: importCount,
      fruitCount: exportCount,
      needsAttention: [],
    }

    plant.needsAttention = identifyAttentionNeeds(plant, content)
    return plant
  })

  const beds = groupIntoBeds(plants)

  const thrivingCount = plants.filter((p) => p.health >= 80).length
  const needsAttentionCount = plants.filter((p) => p.needsAttention.length > 0).length
  const weedCount = plants.filter((p) => p.species === 'weed').length
  const avgHealth = plants.length > 0
    ? Math.round(plants.reduce((s, p) => s + p.health, 0) / plants.length * 100) / 100
    : 0

  const tallest = [...plants].sort((a, b) => b.height - a.height)
  const deepest = [...plants].sort((a, b) => b.rootDepth - a.rootDepth)
  const fruitful = [...plants].sort((a, b) => b.fruitCount - a.fruitCount)

  const stats: GardenerStats = {
    totalPlants: plants.length,
    thrivingCount,
    needsAttentionCount,
    weedCount,
    avgHealth,
    gardenDiversity: computeGardenDiversity(plants),
    tallestPlant: tallest[0]?.file ?? 'none',
    deepestRoots: deepest[0]?.file ?? 'none',
    mostFruitful: fruitful[0]?.file ?? 'none',
    bedsNeedingWork: beds.filter((b) => b.condition === 'needs-work' || b.condition === 'overgrown').length,
    overallGardenHealth: computeOverallHealth(plants, beds),
  }

  const recommendations = generateRecommendations(plants, beds, stats)

  return { plants, beds, stats, recommendations }
}
