// ─── Types ──────────────────────────────────────────────────────────────────────

export type TraitType = 'method' | 'property' | 'pattern' | 'convention' | 'style'
export type TraitExpression = 'consistent' | 'variable' | 'suppressed'
export type MutationType = 'override' | 'enhancement' | 'reduction' | 'adaptation' | 'degeneration'
export type MutationBenefit = 'positive' | 'neutral' | 'negative'
export type LineageHealth = 'thriving' | 'healthy' | 'stable' | 'stressed' | 'inbred'
export type OverallHealth = 'robust' | 'healthy' | 'stable' | 'fragile' | 'degenerate'

export interface CodeTrait {
  name: string
  type: TraitType
  origin: string
  carriers: string[]
  isDominant: boolean
  isMutated: boolean
  expression: TraitExpression
}

export interface CodeMutation {
  trait: string
  type: MutationType
  from: string
  to: string
  file: string
  benefit: MutationBenefit
}

export interface GenePool {
  file: string
  traits: CodeTrait[]
  dominantTraits: string[]
  recessiveTraits: string[]
  mutations: CodeMutation[]
  fitness: number
}

export interface Lineage {
  root: string
  descendants: string[]
  depth: number
  breadth: number
  totalTraits: number
  sharedTraits: number
  uniqueTraits: number
  health: LineageHealth
  diversity: number
}

export interface HeredityStats {
  totalTraits: number
  dominantTraits: number
  recessiveTraits: number
  totalMutations: number
  positiveMutations: number
  negativeMutations: number
  totalLineages: number
  thrivingLineages: number
  inbredLineages: number
  avgDiversity: number
  avgFitness: number
  maxLineageDepth: number
  traitCoverage: number
  mutationRate: number
  overallHealth: OverallHealth
}

export interface HeredityResult {
  pools: GenePool[]
  traits: CodeTrait[]
  mutations: CodeMutation[]
  lineages: Lineage[]
  stats: HeredityStats
  recommendations: string[]
}

export interface HeredityOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Trait Extraction ───────────────────────────────────────────────────────────

/**
 * Extract inheritable code traits from content.
 *
 * @example
 * extractTraits('class Foo { bar() {} }', 'foo.ts') // => CodeTrait[]
 */
export function extractTraits(content: string, filePath: string): CodeTrait[] {
  if (content.trim().length === 0) return []

  const traits: CodeTrait[] = []

  const methods = Array.from(content.matchAll(/(?:(?:public|private|protected|static|async|abstract)\s+)*(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/g))
  for (const m of methods) {
    if (['if', 'for', 'while', 'switch', 'catch', 'function', 'constructor'].includes(m[1])) continue
    traits.push({
      name: m[1],
      type: 'method',
      origin: filePath,
      carriers: [filePath],
      isDominant: false,
      isMutated: false,
      expression: 'consistent',
    })
  }

  const props = Array.from(content.matchAll(/(?:(?:public|private|protected|readonly|static)\s+)+(\w+)\s*:\s*\w+/g))
  for (const p of props) {
    traits.push({
      name: p[1],
      type: 'property',
      origin: filePath,
      carriers: [filePath],
      isDominant: false,
      isMutated: false,
      expression: 'consistent',
    })
  }

  const exports = Array.from(content.matchAll(/^export\s+(?:const|let|var|function|class|type|interface|enum)\s+(\w+)/gm))
  for (const e of exports) {
    traits.push({
      name: e[1],
      type: 'convention',
      origin: filePath,
      carriers: [filePath],
      isDominant: false,
      isMutated: false,
      expression: 'consistent',
    })
  }

  const camelCase = Array.from(content.matchAll(/\b(get|set|is|has|can|should|will|did)([A-Z]\w+)\b/g))
  if (camelCase.length >= 2) {
    traits.push({
      name: 'naming-convention',
      type: 'style',
      origin: filePath,
      carriers: [filePath],
      isDominant: false,
      isMutated: false,
      expression: 'consistent',
    })
  }

  const typedSigs = Array.from(content.matchAll(/:\s*(?:string|number|boolean|void)\b/g))
  if (typedSigs.length >= 3) {
    traits.push({
      name: 'typed-signatures',
      type: 'pattern',
      origin: filePath,
      carriers: [filePath],
      isDominant: false,
      isMutated: false,
      expression: 'consistent',
    })
  }

  return traits
}

// ─── Mutation Detection ─────────────────────────────────────────────────────────

/**
 * Detect mutations — deviations from parent patterns.
 *
 * @example
 * detectMutations('override bar() {}', []) // => CodeMutation[]
 */
export function detectMutations(content: string, _parentTraits: CodeTrait[]): CodeMutation[] {
  if (content.trim().length === 0) return []

  const mutations: CodeMutation[] = []

  const overrides = Array.from(content.matchAll(/(?:\/\/\s*override|@override|super\.\w+)/g))
  for (const o of overrides) {
    mutations.push({
      trait: 'override',
      type: 'override',
      from: 'parent-implementation',
      to: 'child-implementation',
      file: '',
      benefit: 'neutral',
    })
  }

  const asyncAdditions = Array.from(content.matchAll(/async\s+\w+\s*\(/g))
  if (asyncAdditions.length > 0) {
    mutations.push({
      trait: 'async-enhancement',
      type: 'enhancement',
      from: 'sync',
      to: 'async',
      file: '',
      benefit: 'positive',
    })
  }

  const anyTypes = Array.from(content.matchAll(/:\s*any\b/g))
  if (anyTypes.length > 0) {
    mutations.push({
      trait: 'type-degeneration',
      type: 'degeneration',
      from: 'typed',
      to: 'any',
      file: '',
      benefit: 'negative',
    })
  }

  const tsIgnores = Array.from(content.matchAll(/\/\/\s*@ts-ignore|\/\/\s*@ts-expect-error/g))
  if (tsIgnores.length > 0) {
    mutations.push({
      trait: 'type-safety-reduction',
      type: 'reduction',
      from: 'type-safe',
      to: 'ignored',
      file: '',
      benefit: 'negative',
    })
  }

  return mutations
}

// ─── Lineage Tracing ────────────────────────────────────────────────────────────

/**
 * Trace inheritance lineages from files and contents.
 *
 * @example
 * traceLineages(['a.ts'], ['class Foo extends Bar {}']) // => Lineage[]
 */
export function traceLineages(files: string[], contents: string[]): Lineage[] {
  if (files.length === 0) return []

  const extendsMap = new Map<string, string[]>()
  const implementsMap = new Map<string, string[]>()
  const classToFile = new Map<string, string>()

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const classMatches = Array.from(content.matchAll(/class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?/g))
    for (const m of classMatches) {
      const className = m[1]
      classToFile.set(className, files[i])

      if (m[2]) {
        const existing = extendsMap.get(m[2]) ?? []
        existing.push(className)
        extendsMap.set(m[2], existing)
      }

      if (m[3]) {
        const ifaces = m[3].split(',').map(s => s.trim()).filter(Boolean)
        for (const iface of ifaces) {
          const existing = implementsMap.get(iface) ?? []
          existing.push(className)
          implementsMap.set(iface, existing)
        }
      }
    }

    const ifaceMatches = Array.from(content.matchAll(/(?:export\s+)?interface\s+(\w+)/g))
    for (const m of ifaceMatches) {
      classToFile.set(m[1], files[i])
    }
  }

  const lineages: Lineage[] = []
  const allRoots = Array.from(new Set([...extendsMap.keys(), ...implementsMap.keys()]))

  for (const root of allRoots) {
    const children = Array.from(new Set([
      ...(extendsMap.get(root) ?? []),
      ...(implementsMap.get(root) ?? []),
    ]))

    if (children.length === 0) continue

    let depth = 1
    const descendants: string[] = []
    const queue = [...children]
    const visited = new Set<string>()

    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)
      descendants.push(current)
      const nextLevel = extendsMap.get(current) ?? []
      if (nextLevel.length > 0) depth++
      queue.push(...nextLevel)
    }

    const totalTraits = descendants.length * 3
    const sharedTraits = Math.min(totalTraits, descendants.length)
    const uniqueTraits = Math.max(0, totalTraits - sharedTraits)
    const diversity = computeDiversityFromCounts(sharedTraits, uniqueTraits, descendants.length)
    const health = classifyLineageHealth(depth, descendants.length, diversity)

    lineages.push({
      root,
      descendants,
      depth,
      breadth: children.length,
      totalTraits,
      sharedTraits,
      uniqueTraits,
      health,
      diversity,
    })
  }

  return lineages
}

// ─── Diversity & Fitness ────────────────────────────────────────────────────────

/**
 * Compute genetic diversity for a lineage.
 *
 * @example
 * computeDiversity(lineage) // => 75
 */
export function computeDiversity(lineage: Lineage): number {
  return lineage.diversity
}

function computeDiversityFromCounts(shared: number, unique: number, totalMembers: number): number {
  if (totalMembers <= 1) return 100
  const uniqueRatio = unique / (shared + unique + 1)
  return Math.max(0, Math.min(100, Math.round(uniqueRatio * 100 + 30)))
}

/**
 * Compute fitness for a gene pool.
 *
 * @example
 * computeFitness(pool, allTraits) // => 80
 */
export function computeFitness(pool: GenePool, _allTraits: CodeTrait[]): number {
  if (pool.traits.length === 0) return 50

  let score = 60

  if (pool.dominantTraits.length > 0) score += 10
  if (pool.mutations.filter(m => m.benefit === 'positive').length > 0) score += 10
  if (pool.mutations.filter(m => m.benefit === 'negative').length > 0) score -= 15

  const traitRatio = pool.traits.length / Math.max(1, pool.traits.length + pool.recessiveTraits.length)
  score += Math.round(traitRatio * 20)

  return Math.max(0, Math.min(100, score))
}

// ─── Health Classification ──────────────────────────────────────────────────────

/**
 * Classify lineage health.
 *
 * @example
 * classifyLineageHealth(2, 3, 70) // => 'healthy'
 */
export function classifyLineageHealth(depth: number, breadth: number, diversity: number): LineageHealth {
  if (depth <= 3 && breadth >= 2 && diversity >= 50) return 'thriving'
  if (depth <= 4 && diversity >= 40) return 'healthy'
  if (depth <= 5 && diversity >= 25) return 'stable'
  if (diversity < 25) return 'inbred'
  return 'stressed'
}

/**
 * Classify overall heredity health.
 *
 * @example
 * classifyOverallHealth(stats) // => 'robust'
 */
export function classifyOverallHealth(stats: HeredityStats): OverallHealth {
  const composite = (stats.avgDiversity * 0.3) + (stats.avgFitness * 0.3) + (stats.traitCoverage * 0.2) + ((100 - stats.mutationRate) * 0.2)

  if (composite >= 75) return 'robust'
  if (composite >= 55) return 'healthy'
  if (composite >= 35) return 'stable'
  if (composite >= 15) return 'fragile'
  return 'degenerate'
}

// ─── Trait Coverage & Mutation Rate ─────────────────────────────────────────────

/**
 * Compute trait coverage — % of files sharing common traits.
 *
 * @example
 * computeTraitCoverage(traits, 10) // => 65
 */
export function computeTraitCoverage(traits: CodeTrait[], totalFiles: number): number {
  if (totalFiles <= 1 || traits.length === 0) return 100

  const maxCarriers = Math.max(...traits.map(t => t.carriers.length))
  return Math.round((maxCarriers / totalFiles) * 100)
}

/**
 * Compute mutation rate — mutations per trait.
 *
 * @example
 * computeMutationRate(5, 20) // => 25
 */
export function computeMutationRate(totalMutations: number, totalTraits: number): number {
  if (totalTraits === 0) return 0
  return Math.round((totalMutations / totalTraits) * 100)
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate heredity recommendations.
 *
 * @example
 * generateRecommendations(pools, traits, mutations, lineages, stats) // => string[]
 */
export function generateRecommendations(
  _pools: GenePool[],
  traits: CodeTrait[],
  mutations: CodeMutation[],
  lineages: Lineage[],
  stats: HeredityStats,
): string[] {
  const recs: string[] = []

  const inbred = lineages.filter(l => l.health === 'inbred')
  if (inbred.length > 0) {
    recs.push(`${inbred.length} inbred lineage${inbred.length > 1 ? 's' : ''} detected — introduce diverse patterns to avoid stagnation`)
  }

  const negMutations = mutations.filter(m => m.benefit === 'negative')
  if (negMutations.length > 0) {
    recs.push(`${negMutations.length} negative mutation${negMutations.length > 1 ? 's' : ''} found — review overrides for correctness`)
  }

  const deepLineages = lineages.filter(l => l.depth > 4)
  if (deepLineages.length > 0) {
    recs.push(`Deep inheritance chain${deepLineages.length > 1 ? 's' : ''} detected (depth>${4}) — consider flattening with composition`)
  }

  if (stats.avgDiversity < 30) {
    recs.push('Low average diversity — introduce new patterns or refactor similar code')
  }

  if (stats.mutationRate > 50) {
    recs.push('High mutation rate — too many deviations from established patterns')
  }

  if (stats.overallHealth === 'fragile' || stats.overallHealth === 'degenerate') {
    recs.push('Heredity health is poor — establish clear base patterns and enforce consistency')
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete heredity analysis result.
 *
 * @example
 * buildHeredityResult(['a.ts'], ['code'], {}) // => HeredityResult
 */
export function buildHeredityResult(files: string[], contents: string[], _options: HeredityOptions): HeredityResult {
  if (files.length === 0) {
    const emptyStats: HeredityStats = {
      totalTraits: 0, dominantTraits: 0, recessiveTraits: 0,
      totalMutations: 0, positiveMutations: 0, negativeMutations: 0,
      totalLineages: 0, thrivingLineages: 0, inbredLineages: 0,
      avgDiversity: 0, avgFitness: 0, maxLineageDepth: 0,
      traitCoverage: 0, mutationRate: 0, overallHealth: 'degenerate',
    }
    return { pools: [], traits: [], mutations: [], lineages: [], stats: emptyStats, recommendations: [] }
  }

  const allTraits: CodeTrait[] = []
  const allMutations: CodeMutation[] = []
  const pools: GenePool[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const file = files[i]
    const traits = extractTraits(content, file)
    const mutations = detectMutations(content, traits)

    for (const m of mutations) m.file = file

    allTraits.push(...traits)
    allMutations.push(...mutations)

    const dominant = traits.filter(t => t.isDominant).map(t => t.name)
    const recessive = traits.filter(t => !t.isDominant).map(t => t.name)

    const pool: GenePool = {
      file,
      traits,
      dominantTraits: dominant,
      recessiveTraits: recessive,
      mutations,
      fitness: 50,
    }
    pool.fitness = computeFitness(pool, allTraits)
    pools.push(pool)
  }

  const nameCount = new Map<string, number>()
  for (const t of allTraits) {
    nameCount.set(t.name, (nameCount.get(t.name) ?? 0) + 1)
  }
  const maxOcc = Math.max(1, ...nameCount.values())
  for (const t of allTraits) {
    const occ = nameCount.get(t.name) ?? 1
    t.isDominant = occ / maxOcc > 0.5 && occ > 1
    t.expression = t.isDominant ? 'consistent' : occ === 1 ? 'suppressed' : 'variable'
  }

  const mergedTraits = mergeTraitsByName(allTraits)

  const lineages = traceLineages(files, contents)

  const dominantCount = mergedTraits.filter(t => t.isDominant).length
  const recessiveCount = mergedTraits.length - dominantCount
  const positiveMuts = allMutations.filter(m => m.benefit === 'positive').length
  const negativeMuts = allMutations.filter(m => m.benefit === 'negative').length
  const thriving = lineages.filter(l => l.health === 'thriving').length
  const inbred = lineages.filter(l => l.health === 'inbred').length
  const avgDiversity = lineages.length > 0
    ? Math.round(lineages.reduce((s, l) => s + l.diversity, 0) / lineages.length)
    : 100
  const avgFitness = pools.length > 0
    ? Math.round(pools.reduce((s, p) => s + p.fitness, 0) / pools.length)
    : 0
  const maxDepth = lineages.length > 0 ? Math.max(...lineages.map(l => l.depth)) : 0
  const traitCoverage = computeTraitCoverage(mergedTraits, files.length)
  const mutationRate = computeMutationRate(allMutations.length, mergedTraits.length)

  const stats: HeredityStats = {
    totalTraits: mergedTraits.length,
    dominantTraits: dominantCount,
    recessiveTraits: recessiveCount,
    totalMutations: allMutations.length,
    positiveMutations: positiveMuts,
    negativeMutations: negativeMuts,
    totalLineages: lineages.length,
    thrivingLineages: thriving,
    inbredLineages: inbred,
    avgDiversity,
    avgFitness,
    maxLineageDepth: maxDepth,
    traitCoverage,
    mutationRate,
    overallHealth: 'stable',
  }
  stats.overallHealth = classifyOverallHealth(stats)

  const recommendations = generateRecommendations(pools, mergedTraits, allMutations, lineages, stats)

  return { pools, traits: mergedTraits, mutations: allMutations, lineages, stats, recommendations }
}

function mergeTraitsByName(traits: CodeTrait[]): CodeTrait[] {
  const map = new Map<string, CodeTrait>()
  for (const t of traits) {
    const existing = map.get(t.name)
    if (existing) {
      existing.carriers = Array.from(new Set([...existing.carriers, ...t.carriers]))
    } else {
      map.set(t.name, { ...t, carriers: [...t.carriers] })
    }
  }
  return Array.from(map.values())
}
