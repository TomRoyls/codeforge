// ─── Types ─────────────────────────────────────────────────────────────────────

export type SpeciesType = 'producer' | 'primary-consumer' | 'secondary-consumer' | 'apex' | 'decomposer' | 'parasite'

export type HabitatCondition = 'pristine' | 'healthy' | 'stressed' | 'degraded' | 'barren'

export type KeystoneRisk = 'low' | 'medium' | 'high'

export interface Organism {
  file: string
  species: SpeciesType
  habitat: string
  fitness: number
  diet: string[]
  predators: string[]
  role: string
  population: number
  endangered: boolean
}

export interface FoodWeb {
  producers: string[]
  consumers: string[]
  apex: string[]
  decomposers: string[]
  parasites: string[]
}

export interface Habitat {
  name: string
  organisms: Organism[]
  carrying: number
  biodiversity: number
  stability: number
  condition: HabitatCondition
}

export interface KeystoneSpecies {
  file: string
  dependents: number
  uniqueness: number
  impact: number
  risk: KeystoneRisk
}

export interface EcosystemStats {
  totalOrganisms: number
  speciesDiversity: number
  foodChainLength: number
  keystoneCount: number
  endangeredCount: number
  producerCount: number
  consumerCount: number
  apexCount: number
  decomposerCount: number
  parasiteCount: number
  ecosystemStability: number
  habitatCount: number
  avgBiodiversity: number
  trophicEfficiency: number
}

export interface EcosystemResult {
  organisms: Organism[]
  foodWeb: FoodWeb
  habitats: Habitat[]
  keystones: KeystoneSpecies[]
  stats: EcosystemStats
  recommendations: string[]
}

// ─── Import/Export Extraction ──────────────────────────────────────────────────

/**
 * Extract import paths from file content.
 *
 * @example
 * extractImports('import { x } from "./foo"')
 */
export function extractImports(content: string): string[] {
  const imports: string[] = []
  const patterns = [
    /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]
  for (const pat of patterns) {
    let m: RegExpExecArray | null
    while ((m = pat.exec(content)) !== null) {
      const match = m[1]
      if (match) imports.push(match)
    }
  }
  return [...new Set(imports)]
}

/**
 * Extract export names from file content.
 *
 * @example
 * extractExports('export const x = 1')
 */
export function extractExports(content: string): string[] {
  const exports: string[] = []
  const patterns = [
    /export\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+(\w+)/g,
    /export\s+\{([^}]+)\}/g,
  ]
  for (const pat of patterns) {
    let m: RegExpExecArray | null
    while ((m = pat.exec(content)) !== null) {
      if (pat.source.startsWith('export\\s+\\{')) {
        const captured = m[1]
        if (captured) {
          const names = captured.split(',').map((n) => {
            const parts = n.trim().split(/\s+as\s+/)
            return (parts.at(-1) ?? '').trim()
          }).filter(Boolean)
          exports.push(...names)
        }
      } else {
        const match = m[1]
        if (match) exports.push(match)
      }
    }
  }
  return [...new Set(exports)]
}

/**
 * Get directory from file path.
 *
 * @example
 * getHabitat('src/commands/foo.ts')
 */
export function getHabitat(filePath: string): string {
  const lastSlash = filePath.lastIndexOf('/')
  return lastSlash >= 0 ? filePath.substring(0, lastSlash) : '.'
}

// ─── Species Classification ────────────────────────────────────────────────────

/**
 * Classify a file's ecological species type.
 *
 * @example
 * classifySpecies('test.ts', ['a', 'b'], ['x'], ['c'], true)
 */
export function classifySpecies(
  _file: string,
  imports: string[],
  exports: string[],
  importedBy: string[],
  isTest: boolean,
): SpeciesType {
  if (isTest) return 'decomposer'
  if (imports.length > 0 && importedBy.length === 0) return 'apex'
  if (imports.length > 0 && exports.length === 0) return 'parasite'
  if (imports.length === 0 && exports.length > 0) return 'producer'
  if (imports.length > 0 && exports.length > 0 && importedBy.length > 0) {
    const hasProducerDeps = false
    if (!hasProducerDeps || importedBy.length >= imports.length) return 'primary-consumer'
    return 'secondary-consumer'
  }
  return 'producer'
}

/**
 * Determine ecological role description.
 *
 * @example
 * determineRole('producer', 50, 10)
 */
export function determineRole(species: SpeciesType, fitness: number, population: number): string {
  if (species === 'producer') return 'Foundation module providing core exports'
  if (species === 'apex') return 'Entry point consuming modules without being consumed'
  if (species === 'decomposer') return 'Test utility breaking down and validating code'
  if (species === 'parasite') return 'Consumer module providing no exports to ecosystem'
  if (population > 5) return `Key intermediary depended on by ${population} modules`
  if (fitness > 70) return 'High-quality intermediary module'
  return 'Standard intermediary module'
}

// ─── Fitness ───────────────────────────────────────────────────────────────────

/**
 * Compute fitness score (code quality) from content.
 *
 * @example
 * computeFitness('export function clean() { return 1 }')
 */
export function computeFitness(content: string): number {
  if (content.length === 0) return 0
  const lines = content.split('\n')
  const nonBlank = lines.filter((l) => l.trim().length > 0)
  if (nonBlank.length === 0) return 0

  let score = 50
  const hasExports = /export\s/.test(content)
  const hasTypes = /(interface|type)\s+\w/.test(content)
  const hasDocs = /\/\*\*|\*\s+@/.test(content)
  const hasErrorHandling = /try\s*\{|catch\s*\(/.test(content)
  const commentRatio = (content.match(/\/\/.*$/gm) || []).length / nonBlank.length

  if (hasExports) score += 10
  if (hasTypes) score += 10
  if (hasDocs) score += 10
  if (hasErrorHandling) score += 5
  if (commentRatio > 0.1 && commentRatio < 0.4) score += 5

  const hasAny = /any/.test(content)
  const hasTsIgnore = /\/\/\s*@ts-ignore|\/\/\s*@ts-expect-error/.test(content)
  if (hasAny) score -= 10
  if (hasTsIgnore) score -= 10

  const lineLengths = nonBlank.map((l) => l.length)
  const avgLen = lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length
  if (avgLen > 120) score -= 5

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ─── Population & Endangerment ─────────────────────────────────────────────────

/**
 * Compute population (how many files depend on this one).
 *
 * @example
 * computePopulation(['a.ts', 'b.ts', 'c.ts'])
 */
export function computePopulation(importedBy: string[]): number {
  return importedBy.length
}

/**
 * Check if an organism is endangered.
 *
 * @example
 * isEndangered({ fitness: 30, population: 10, species: 'producer', ... })
 */
export function isEndangered(organism: { fitness: number; population: number; species: SpeciesType }): boolean {
  return organism.fitness < 40 && organism.population >= 3
}

// ─── Build Organism ────────────────────────────────────────────────────────────

/**
 * Build an Organism from file data.
 *
 * @example
 * buildOrganism('mod.ts', content, allImports, allExportedBy)
 */
export function buildOrganism(
  file: string,
  content: string,
  imports: string[],
  exportedBy: string[],
): Organism {
  const isTest = /\.(test|spec)\.[jt]sx?$/.test(file)
  const exports = extractExports(content)
  const species = classifySpecies(file, imports, exports, exportedBy, isTest)
  const fitness = computeFitness(content)
  const population = computePopulation(exportedBy)
  const endangered = isEndangered({ fitness, population, species })
  const role = determineRole(species, fitness, population)

  return {
    file,
    species,
    habitat: getHabitat(file),
    fitness,
    diet: imports,
    predators: exportedBy,
    role,
    population,
    endangered,
  }
}

// ─── Food Web ──────────────────────────────────────────────────────────────────

/**
 * Build the food web from all organisms.
 *
 * @example
 * buildFoodWeb(organisms)
 */
export function buildFoodWeb(organisms: Organism[]): FoodWeb {
  return {
    producers: organisms.filter((o) => o.species === 'producer').map((o) => o.file),
    consumers: organisms.filter((o) => o.species === 'primary-consumer' || o.species === 'secondary-consumer').map((o) => o.file),
    apex: organisms.filter((o) => o.species === 'apex').map((o) => o.file),
    decomposers: organisms.filter((o) => o.species === 'decomposer').map((o) => o.file),
    parasites: organisms.filter((o) => o.species === 'parasite').map((o) => o.file),
  }
}

// ─── Habitats ──────────────────────────────────────────────────────────────────

/**
 * Group organisms into habitats by directory.
 *
 * @example
 * groupIntoHabitats(organisms)
 */
export function groupIntoHabitats(organisms: Organism[]): Map<string, Organism[]> {
  const habitats = new Map<string, Organism[]>()
  for (const org of organisms) {
    const hab = org.habitat
    if (!habitats.has(hab)) habitats.set(hab, [])
    habitats.get(hab)!.push(org)
  }
  return habitats
}

/**
 * Compute Shannon biodiversity for a habitat.
 *
 * @example
 * computeBiodiversity(organisms)
 */
export function computeBiodiversity(organisms: Organism[]): number {
  if (organisms.length === 0) return 0
  const counts = new Map<string, number>()
  for (const o of organisms) {
    counts.set(o.species, (counts.get(o.species) || 0) + 1)
  }
  if (counts.size <= 1) return 0
  const total = organisms.length
  let entropy = 0
  for (const count of counts.values()) {
    const p = count / total
    if (p > 0) entropy -= p * Math.log2(p)
  }
  const maxEntropy = Math.log2(counts.size)
  return maxEntropy > 0 ? Math.round((entropy / maxEntropy) * 100) : 0
}

/**
 * Compute habitat stability from its organisms.
 *
 * @example
 * computeHabitatStability(organisms)
 */
export function computeHabitatStability(organisms: Organism[]): number {
  if (organisms.length === 0) return 0
  const avgFitness = organisms.reduce((s, o) => s + o.fitness, 0) / organisms.length
  const endangeredRatio = organisms.filter((o) => o.endangered).length / organisms.length
  const parasiteRatio = organisms.filter((o) => o.species === 'parasite').length / organisms.length
  const score = avgFitness * 0.6 + (1 - endangeredRatio) * 20 + (1 - parasiteRatio) * 20
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Classify habitat condition from stability and biodiversity.
 *
 * @example
 * classifyHabitatCondition(80, 70)
 */
export function classifyHabitatCondition(stability: number, biodiversity: number): HabitatCondition {
  const avg = (stability + biodiversity) / 2
  if (avg >= 80) return 'pristine'
  if (avg >= 60) return 'healthy'
  if (avg >= 40) return 'stressed'
  if (avg >= 20) return 'degraded'
  return 'barren'
}

/**
 * Build a Habitat object from organisms.
 *
 * @example
 * buildHabitat('src/commands', organisms)
 */
export function buildHabitat(name: string, organisms: Organism[]): Habitat {
  const biodiversity = computeBiodiversity(organisms)
  const stability = computeHabitatStability(organisms)
  const carrying = Math.max(1, Math.round(organisms.reduce((s, o) => s + o.fitness, 0) / organisms.length * 0.5))
  return {
    name,
    organisms,
    carrying,
    biodiversity,
    stability,
    condition: classifyHabitatCondition(stability, biodiversity),
  }
}

// ─── Keystone Species ──────────────────────────────────────────────────────────

/**
 * Identify keystone species in the ecosystem.
 *
 * @example
 * identifyKeystones(organisms)
 */
export function identifyKeystones(organisms: Organism[]): KeystoneSpecies[] {
  return organisms
    .filter((o) => o.population >= 2)
    .map((o) => {
      const uniqueness = Math.min(100, Math.round(o.fitness * 0.5 + (o.diet.length === 0 ? 50 : 0)))
      const impact = o.population * 10
      const risk: KeystoneRisk = impact > 50 ? 'high' : impact > 20 ? 'medium' : 'low'
      return {
        file: o.file,
        dependents: o.population,
        uniqueness,
        impact,
        risk,
      }
    })
    .filter((k) => k.dependents >= 2)
    .sort((a, b) => b.impact - a.impact)
}

// ─── Ecosystem Metrics ─────────────────────────────────────────────────────────

/**
 * Compute food chain length (max import depth).
 *
 * @example
 * computeFoodChainLength(organisms)
 */
export function computeFoodChainLength(organisms: Organism[]): number {
  if (organisms.length === 0) return 0
  const fileMap = new Map(organisms.map((o) => [o.file, o]))
  const memo = new Map<string, number>()

  function depth(file: string): number {
    if (memo.has(file)) return memo.get(file)!
    const org = fileMap.get(file)
    if (!org || org.diet.length === 0) {
      memo.set(file, 0)
      return 0
    }
    const maxChild = Math.max(...org.diet.map((d) => depth(d)))
    const result = maxChild + 1
    memo.set(file, result)
    return result
  }

  return Math.max(0, ...organisms.map((o) => depth(o.file)))
}

/**
 * Compute trophic efficiency (how well information flows).
 *
 * @example
 * computeTrophicEfficiency(foodWeb, organisms)
 */
export function computeTrophicEfficiency(foodWeb: FoodWeb, organisms: Organism[]): number {
  const totalOrganisms = organisms.length
  if (totalOrganisms === 0) return 0

  const productiveCount = foodWeb.producers.length + foodWeb.consumers.length
  const parasiteCount = foodWeb.parasites.length
  const ratio = productiveCount / totalOrganisms
  const penalty = parasiteCount / totalOrganisms
  return Math.max(0, Math.min(100, Math.round((ratio - penalty * 0.5) * 100)))
}

/**
 * Compute overall ecosystem stability.
 *
 * @example
 * computeEcosystemStability(habitats, keystones)
 */
export function computeEcosystemStability(habitats: Habitat[], keystones: KeystoneSpecies[]): number {
  if (habitats.length === 0) return 0
  const avgStability = habitats.reduce((s, h) => s + h.stability, 0) / habitats.length
  const highRisk = keystones.filter((k) => k.risk === 'high').length
  const keystonePenalty = Math.min(30, highRisk * 10)
  return Math.max(0, Math.min(100, Math.round(avgStability - keystonePenalty)))
}

/**
 * Compute Shannon species diversity.
 *
 * @example
 * computeSpeciesDiversity(organisms)
 */
export function computeSpeciesDiversity(organisms: Organism[]): number {
  if (organisms.length === 0) return 0
  const counts = new Map<string, number>()
  for (const o of organisms) {
    counts.set(o.species, (counts.get(o.species) || 0) + 1)
  }
  if (counts.size <= 1) return 0
  const total = organisms.length
  let entropy = 0
  for (const count of counts.values()) {
    const p = count / total
    if (p > 0) entropy -= p * Math.log2(p)
  }
  const maxEntropy = Math.log2(counts.size)
  return maxEntropy > 0 ? Math.round((entropy / maxEntropy) * 100) : 0
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate ecosystem recommendations.
 *
 * @example
 * generateRecommendations(organisms, habitats, keystones, stats)
 */
export function generateRecommendations(
  organisms: Organism[],
  habitats: Habitat[],
  keystones: KeystoneSpecies[],
  stats: EcosystemStats,
): string[] {
  const recs: string[] = []

  const endangered = organisms.filter((o) => o.endangered)
  if (endangered.length > 0) {
    recs.push(`${endangered.length} endangered species detected — refactor carefully: ${endangered.slice(0, 3).map((e) => e.file).join(', ')}`)
  }

  const highRiskKeystones = keystones.filter((k) => k.risk === 'high')
  if (highRiskKeystones.length > 0) {
    recs.push(`${highRiskKeystones.length} high-risk keystone species — protect with comprehensive tests: ${highRiskKeystones.slice(0, 2).map((k) => k.file).join(', ')}`)
  }

  const parasites = organisms.filter((o) => o.species === 'parasite')
  if (parasites.length > 0) {
    recs.push(`${parasites.length} parasite modules found — add exports or remove: ${parasites.slice(0, 3).map((p) => p.file).join(', ')}`)
  }

  const degraded = habitats.filter((h) => h.condition === 'degraded' || h.condition === 'barren')
  if (degraded.length > 0) {
    recs.push(`${degraded.length} degraded habitats — rehabilitate: ${degraded.map((h) => h.name).join(', ')}`)
  }

  if (stats.avgBiodiversity < 30) {
    recs.push('Low average biodiversity — introduce more varied architectural patterns')
  }

  if (stats.trophicEfficiency < 40) {
    recs.push('Low trophic efficiency — reduce parasitic modules and strengthen producer chain')
  }

  if (stats.ecosystemStability > 70) {
    recs.push(`Ecosystem stability is ${stats.ecosystemStability}% — healthy ecological balance`)
  }

  if (recs.length === 0) {
    recs.push('Ecosystem shows balanced ecological structure with healthy species distribution')
  }

  return recs
}

// ─── Build Ecosystem Result ────────────────────────────────────────────────────

/**
 * Build complete ecosystem result.
 *
 * @example
 * buildEcosystemResult(['a.ts'], ['code'], {})
 */
export function buildEcosystemResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): EcosystemResult {
  if (files.length === 0) {
    const emptyStats: EcosystemStats = {
      totalOrganisms: 0, speciesDiversity: 0, foodChainLength: 0,
      keystoneCount: 0, endangeredCount: 0, producerCount: 0,
      consumerCount: 0, apexCount: 0, decomposerCount: 0, parasiteCount: 0,
      ecosystemStability: 0, habitatCount: 0, avgBiodiversity: 0, trophicEfficiency: 0,
    }
    const emptyWeb: FoodWeb = { producers: [], consumers: [], apex: [], decomposers: [], parasites: [] }
    return { organisms: [], foodWeb: emptyWeb, habitats: [], keystones: [], stats: emptyStats, recommendations: ['No files to analyze'] }
  }

  const fileImports = new Map<string, string[]>()
  const fileExports = new Map<string, string[]>()

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    fileImports.set(files[i] ?? '', extractImports(content))
    fileExports.set(files[i] ?? '', extractExports(content))
  }

  const exportedBy = new Map<string, string[]>()
  for (const file of files) {
    exportedBy.set(file, [])
  }
  for (const file of files) {
    const imports = fileImports.get(file) ?? []
    for (const imp of imports) {
      const normalized = imp.startsWith('./') ? imp.slice(2) : imp
      for (const candidate of [imp, normalized, imp + '.ts', imp + '.js', imp + '.tsx', imp + '.jsx', normalized + '.ts', normalized + '.js', normalized + '.tsx', normalized + '.jsx']) {
        if (files.includes(candidate)) {
          const list = exportedBy.get(candidate)
          if (list && !list.includes(file)) list.push(file)
          break
        }
      }
    }
  }

  const organisms: Organism[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    const imports = fileImports.get(file) ?? []
    const deps = exportedBy.get(file) ?? []
    return buildOrganism(file, content, imports, deps)
  })

  const foodWeb = buildFoodWeb(organisms)

  const habitatMap = groupIntoHabitats(organisms)
  const habitats = Array.from(habitatMap.entries()).map(([name, orgs]) => buildHabitat(name, orgs))

  const keystones = identifyKeystones(organisms)

  const foodChainLength = computeFoodChainLength(organisms)
  const trophicEfficiency = computeTrophicEfficiency(foodWeb, organisms)
  const ecosystemStability = computeEcosystemStability(habitats, keystones)
  const speciesDiversity = computeSpeciesDiversity(organisms)
  const avgBiodiversity = habitats.length > 0
    ? Math.round(habitats.reduce((s, h) => s + h.biodiversity, 0) / habitats.length)
    : 0

  const stats: EcosystemStats = {
    totalOrganisms: organisms.length,
    speciesDiversity,
    foodChainLength,
    keystoneCount: keystones.length,
    endangeredCount: organisms.filter((o) => o.endangered).length,
    producerCount: foodWeb.producers.length,
    consumerCount: foodWeb.consumers.length,
    apexCount: foodWeb.apex.length,
    decomposerCount: foodWeb.decomposers.length,
    parasiteCount: foodWeb.parasites.length,
    ecosystemStability,
    habitatCount: habitats.length,
    avgBiodiversity,
    trophicEfficiency,
  }

  const recommendations = generateRecommendations(organisms, habitats, keystones, stats)

  return { organisms, foodWeb, habitats, keystones, stats, recommendations }
}
