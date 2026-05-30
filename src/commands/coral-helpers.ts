// ─── Types ─────────────────────────────────────────────────────────────────────

export type PolypType = 'branching' | 'massive' | 'plate' | 'columnar' | 'encrusting' | 'free-living'
export type GrowthPattern = 'accretion' | 'branching' | 'fusion' | 'fragmentation'
export type ColonyHealth = 'thriving' | 'healthy' | 'stressed' | 'bleaching' | 'dead'
export type ZoneType = 'reef-flat' | 'reef-crest' | 'fore-reef' | 'lagoon' | 'deep-reef'
export type SymbiosisType = 'mutualistic' | 'commensal' | 'parasitic'
export type OverallReef = 'great-barrier' | 'healthy-reef' | 'stressed-reef' | 'bleached-reef' | 'dead-reef'

export interface CoralColony {
  name: string
  species: string[]
  size: number
  growthRate: number
  density: number
  diversity: number
  health: ColonyHealth
  symbionts: string[]
  parasites: string[]
}

export interface CoralPolyp {
  file: string
  type: PolypType
  size: number
  complexity: number
  connections: number
  growthPattern: GrowthPattern
  isKeystone: boolean
  isInvasive: boolean
  bleachingRisk: number
  health: number
}

export interface ReefZone {
  name: string
  type: ZoneType
  description: string
  biodiversity: number
  structuralComplexity: number
  files: string[]
}

export interface SymbioticRelation {
  host: string
  symbiont: string
  type: SymbiosisType
  strength: number
  description: string
}

export interface CoralStats {
  totalColonies: number
  totalPolyps: number
  branchingPolyps: number
  massivePolyps: number
  keystonePolyps: number
  invasivePolyps: number
  thrivingColonies: number
  bleachingColonies: number
  totalSymbiosis: number
  mutualisticRelations: number
  parasiticRelations: number
  avgBiodiversity: number
  avgComplexity: number
  avgBleachingRisk: number
  reefHealth: number
  biodiversityIndex: number
  ecosystemStability: number
  overallReef: OverallReef
}

export interface CoralResult {
  colonies: CoralColony[]
  polyps: CoralPolyp[]
  zones: ReefZone[]
  symbiosis: SymbioticRelation[]
  stats: CoralStats
  recommendations: string[]
}

// ─── Internal Helpers ──────────────────────────────────────────────────────────

/**
 * Count exports
 * @example
 * countExports('export const x = 1') // 1
 */
function countExports(content: string): number {
  return (content.match(/export\s+/g) || []).length
}

/**
 * Count imports
 * @example
 * countImports('import { x } from "y"') // 1
 */
function countImports(content: string): number {
  return (content.match(/import\s+/g) || []).length
}

/**
 * Count functions
 * @example
 * countFns('function f() {} const g = () => {}') // 2
 */
function countFns(content: string): number {
  const named = (content.match(/function\s+\w+/g) || []).length
  const arrow = (content.match(/=>\s*[{(]/g) || []).length
  return named + arrow
}

/**
 * Count interfaces
 * @example
 * countIfaces('interface A {}') // 1
 */
function countIfaces(content: string): number {
  return (content.match(/interface\s+\w+/g) || []).length
}

/**
 * Get max nesting depth
 * @example
 * getMaxNesting('if (a) { if (b) { } }') // 2
 */
function getMaxNesting(content: string): number {
  let max = 0
  let depth = 0
  for (const ch of content) {
    if (ch === '{') { depth++; if (depth > max) max = depth }
    else if (ch === '}') { depth = Math.max(0, depth - 1) }
  }
  return max
}

/**
 * Count type annotations
 * @example
 * countTypes(': number') // 1
 */
function countTypes(content: string): number {
  return (content.match(/:\s*\w+/g) || []).length
}

/**
 * Count comments
 * @example
 * countComments('// hi') // 1
 */
function countComments(content: string): number {
  return (content.match(/\/\/.*$/gm) || []).length
}

/**
 * Count classes
 * @example
 * countClasses('class A {}') // 1
 */
function countClasses(content: string): number {
  return (content.match(/class\s+\w+/g) || []).length
}

// ─── Classify Polyp ────────────────────────────────────────────────────────────

/**
 * Classify a file as a coral polyp type
 * @example
 * classifyPolyp('export const a = 1; export const b = 2;', 'f.ts', []) // PolypType
 */
export function classifyPolyp(content: string): PolypType {
  const lines = content.split('\n').length
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFns(content)
  const ifaces = countIfaces(content)
  const nesting = getMaxNesting(content)

  if (exports >= 5 && nesting <= 2) return 'branching'
  if (lines > 300 && exports <= 2) return 'massive'
  if (ifaces >= 2 && funcs <= 3 && nesting <= 2) return 'plate'
  if (nesting > 5 && funcs > 3) return 'columnar'
  if (imports >= 3 && exports <= 1 && lines < 100) return 'encrusting'
  if (exports === 0 && imports === 0 && lines < 50) return 'free-living'
  return 'branching'
}

/**
 * Determine growth pattern
 * @example
 * classifyGrowthPattern('branching', 5) // 'branching'
 */
export function classifyGrowthPattern(polypType: PolypType, exports: number): GrowthPattern {
  if (polypType === 'branching') return exports > 3 ? 'branching' : 'accretion'
  if (polypType === 'massive') return 'accretion'
  if (polypType === 'plate') return 'fusion'
  if (polypType === 'columnar') return 'accretion'
  if (polypType === 'encrusting') return 'fusion'
  return 'fragmentation'
}

/**
 * Build a complete CoralPolyp
 * @example
 * buildPolyp('export const x = 1;', 'a.ts', []) // CoralPolyp
 */
export function buildPolyp(content: string, filePath: string): CoralPolyp {
  const lines = content.split('\n').length
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFns(content)
  const nesting = getMaxNesting(content)
  const types = countTypes(content)
  const comments = countComments(content)
  const hasAny = /:\s*any\b|as\s+any\b/.test(content)

  const polypType = classifyPolyp(content)
  const connections = exports + imports
  const growthPattern = classifyGrowthPattern(polypType, exports)

  const complexity = Math.max(0, Math.min(100, Math.round(
    20 + Math.min(30, nesting * 5) + Math.min(25, funcs * 3) + Math.min(25, connections * 3)
  )))

  const hasTests = /describe\s*\(|it\s*\(|test\s*\(/.test(content)
  const hasDocs = comments > lines * 0.05
  const hasTypes_ = types > 0

  let health = 50
  if (hasTypes_) health += 15
  if (hasDocs) health += 10
  if (hasTests) health += 10
  if (nesting <= 3) health += 10
  if (lines <= 200) health += 5
  if (hasAny) health -= 15
  if (nesting > 6) health -= 10
  health = Math.max(0, Math.min(100, health))

  const bleachingRisk = Math.max(0, Math.min(100, 100 - health))

  const isKeystone = exports >= 3 && health >= 60
  const isInvasive = hasAny || (lines > 500 && exports === 0)

  return {
    file: filePath,
    type: polypType,
    size: lines,
    complexity,
    connections,
    growthPattern,
    isKeystone,
    isInvasive,
    bleachingRisk,
    health,
  }
}

// ─── Analyze Colony ────────────────────────────────────────────────────────────

/**
 * Analyze a coral colony (module cluster)
 * @example
 * analyzeColony(['a.ts', 'b.ts'], ['const x=1', 'const y=2'], 'src') // CoralColony
 */
export function analyzeColony(files: string[], contents: string[], dirPath: string): CoralColony {
  const totalLines = contents.reduce((s, c) => s + c.split('\n').length, 0)
  const totalContent = contents.join('\n')

  const exts = files.map(f => {
    const dot = f.lastIndexOf('.')
    return dot >= 0 ? f.slice(dot) : ''
  })
  const species = Array.from(new Set(exts.filter(e => e.length > 0)))

  const allExports = contents.reduce((s, c) => s + countExports(c), 0)
  const allImports = contents.reduce((s, c) => s + countImports(c), 0)
  const allFuncs = contents.reduce((s, c) => s + countFns(c), 0)
  const allIfaces = contents.reduce((s, c) => s + countIfaces(c), 0)
  const allClasses = contents.reduce((s, c) => s + countClasses(c), 0)

  const growthRate = Math.max(0, Math.min(100, Math.round(
    30 + Math.min(30, allExports * 5) + Math.min(20, allFuncs * 2) + Math.min(20, files.length * 3)
  )))

  const density = files.length > 0
    ? Math.max(0, Math.min(100, Math.round(totalLines / files.length)))
    : 0

  const patternTypes = [
    allFuncs > 0 ? 'functions' : null,
    allClasses > 0 ? 'classes' : null,
    allIfaces > 0 ? 'interfaces' : null,
    allExports > 0 ? 'exports' : null,
    allImports > 0 ? 'imports' : null,
    /async|await/.test(totalContent) ? 'async' : null,
    /try|catch/.test(totalContent) ? 'error-handling' : null,
  ].filter((p): p is string => p !== null)

  const diversity = Math.max(0, Math.min(100, patternTypes.length * 14))

  const avgHealth = files.length > 0
    ? Math.round(contents.reduce((s, c, i) => {
        const file = files[i]
        if (!file) return s
        return s + buildPolyp(c, file).health
      }, 0) / files.length)
    : 50

  const health: ColonyHealth = avgHealth >= 80 ? 'thriving'
    : avgHealth >= 60 ? 'healthy'
    : avgHealth >= 40 ? 'stressed'
    : avgHealth >= 20 ? 'bleaching'
    : 'dead'

  const symbionts: string[] = []
  const parasites: string[] = []
  for (let i = 0; i < files.length; i++) {
    const content = contents[i]
    const file = files[i]
    if (content === undefined || file === undefined) continue
    const exp = countExports(content)
    const imp = countImports(content)
    if (exp > 0 && imp > 0) symbionts.push(file)
    else if (imp > 0 && exp === 0) parasites.push(file)
  }

  return {
    name: dirPath,
    species,
    size: totalLines,
    growthRate,
    density,
    diversity,
    health,
    symbionts,
    parasites,
  }
}

// ─── Map Reef Zones ────────────────────────────────────────────────────────────

/**
 * Classify and map reef zones
 * @example
 * mapReefZones(['a.ts'], [colony]) // ReefZone[]
 */
export function mapReefZones(files: string[], polyps: CoralPolyp[]): ReefZone[] {
  const zones: ReefZone[] = []
  const byDir = new Map<string, string[]>()

  for (const f of files) {
    const parts = f.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    if (!byDir.has(dir)) byDir.set(dir, [])
    byDir.get(dir)!.push(f)
  }

  for (const [dir, dirFiles] of byDir) {
    const dirPolyps = polyps.filter(p => dirFiles.includes(p.file))
    const avgComplexity = dirPolyps.length > 0
      ? Math.round(dirPolyps.reduce((s, p) => s + p.complexity, 0) / dirPolyps.length)
      : 50
    const avgHealth = dirPolyps.length > 0
      ? Math.round(dirPolyps.reduce((s, p) => s + p.health, 0) / dirPolyps.length)
      : 50

    let zoneType: ZoneType
    let description: string

    const hasIndex = dirFiles.some(f => f.endsWith('index.ts') || f.endsWith('index.js'))
    const totalConnections = dirPolyps.reduce((s, p) => s + p.connections, 0)

    if (hasIndex && totalConnections >= 5) {
      zoneType = 'reef-crest'
      description = 'API surface — boundary between internal and external'
    } else if (totalConnections >= 3 && avgComplexity >= 60) {
      zoneType = 'reef-flat'
      description = 'Active surface — most accessed code area'
    } else if (avgComplexity >= 70) {
      zoneType = 'fore-reef'
      description = 'Deep internals — complex specialized code'
    } else if (totalConnections <= 1 && avgHealth >= 60) {
      zoneType = 'lagoon'
      description = 'Isolated protected code — low coupling'
    } else {
      zoneType = 'deep-reef'
      description = 'Deep utility code — rarely accessed'
    }

    const patternTypes = Array.from(new Set(dirPolyps.map(p => p.type)))
    const biodiversity = Math.max(0, Math.min(100, patternTypes.length * 20))

    zones.push({
      name: dir,
      type: zoneType,
      description,
      biodiversity,
      structuralComplexity: avgComplexity,
      files: dirFiles,
    })
  }

  return zones
}

// ─── Detect Symbiosis ──────────────────────────────────────────────────────────

/**
 * Detect symbiotic relationships between files
 * @example
 * detectSymbiosis(polyps, files, contents) // SymbioticRelation[]
 */
export function detectSymbiosis(_polyps: CoralPolyp[], files: string[], contents: string[]): SymbioticRelation[] {
  const relations: SymbioticRelation[] = []

  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      const contentI = contents[i]
      const contentJ = contents[j]
      const fileI = files[i]
      const fileJ = files[j]
      if (contentI === undefined || contentJ === undefined || fileI === undefined || fileJ === undefined) continue

      const basenameI = fileI.split('/').pop()?.replace(/\.\w+$/, '') ?? fileI
      const basenameJ = fileJ.split('/').pop()?.replace(/\.\w+$/, '') ?? fileJ

      const iImportsJ = contentI.includes(basenameJ)
      const jImportsI = contentJ.includes(basenameI)

      if (iImportsJ && jImportsI) {
        relations.push({
          host: fileI,
          symbiont: fileJ,
          type: 'mutualistic',
          strength: 70,
          description: `Mutual dependency between ${fileI} and ${fileJ}`,
        })
      } else if (iImportsJ) {
        const exportsJ = countExports(contentJ)
        const type = exportsJ > 0 ? 'commensal' : 'parasitic'
        relations.push({
          host: fileJ,
          symbiont: fileI,
          type,
          strength: type === 'commensal' ? 50 : 30,
          description: `${fileI} imports from ${fileJ} (${type})`,
        })
      } else if (jImportsI) {
        const exportsI = countExports(contentI)
        const type = exportsI > 0 ? 'commensal' : 'parasitic'
        relations.push({
          host: fileI,
          symbiont: fileJ,
          type,
          strength: type === 'commensal' ? 50 : 30,
          description: `${fileJ} imports from ${fileI} (${type})`,
        })
      }
    }
  }

  return relations
}

// ─── Compute Reef Health ───────────────────────────────────────────────────────

/**
 * Compute overall reef health 0-100
 * @example
 * computeReefHealth(colonies, polyps) // 72
 */
export function computeReefHealth(_colonies: CoralColony[], polyps: CoralPolyp[]): number {
  if (polyps.length === 0) return 50
  const avgPolypHealth = polyps.reduce((s, p) => s + p.health, 0) / polyps.length
  const invasivePenalty = polyps.filter(p => p.isInvasive).length * 5
  const keystoneBonus = polyps.filter(p => p.isKeystone).length * 2
  return Math.max(0, Math.min(100, Math.round(avgPolypHealth - invasivePenalty + keystoneBonus)))
}

/**
 * Compute biodiversity index 0-100
 * @example
 * computeBiodiversityIndex(polyps, colonies) // 65
 */
export function computeBiodiversityIndex(polyps: CoralPolyp[], colonies: CoralColony[]): number {
  const polypTypes = Array.from(new Set(polyps.map(p => p.type)))
  const colonyDiversity = colonies.length > 0
    ? colonies.reduce((s, c) => s + c.diversity, 0) / colonies.length
    : 50
  const typeVariety = Math.min(100, polypTypes.length * 16)
  return Math.max(0, Math.min(100, Math.round((typeVariety + colonyDiversity) / 2)))
}

/**
 * Compute ecosystem stability 0-100
 * @example
 * computeEcosystemStability(70, 60, 50) // 60
 */
export function computeEcosystemStability(health: number, biodiversity: number, symbiosis: SymbioticRelation[]): number {
  const mutualRatio = symbiosis.length > 0
    ? symbiosis.filter(s => s.type === 'mutualistic').length / symbiosis.length
    : 0.5
  const parasiticPenalty = symbiosis.filter(s => s.type === 'parasitic').length * 3
  const stability = health * 0.4 + biodiversity * 0.3 + mutualRatio * 100 * 0.3 - parasiticPenalty
  return Math.max(0, Math.min(100, Math.round(stability)))
}

/**
 * Classify overall reef condition
 * @example
 * classifyOverallReef(85, 80, 75) // 'great-barrier'
 */
export function classifyOverallReef(health: number, biodiversity: number, stability: number): OverallReef {
  const combined = (health + biodiversity + stability) / 3
  if (combined >= 75) return 'great-barrier'
  if (combined >= 60) return 'healthy-reef'
  if (combined >= 40) return 'stressed-reef'
  if (combined >= 20) return 'bleached-reef'
  return 'dead-reef'
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate coral reef recommendations
 * @example
 * generateRecommendations(colonies, polyps, symbiosis, zones, stats) // string[]
 */
export function generateRecommendations(
  colonies: CoralColony[],
  polyps: CoralPolyp[],
  symbiosis: SymbioticRelation[],
  _zones: ReefZone[],
  stats: CoralStats,
): string[] {
  const recs: string[] = []

  const bleaching = colonies.filter(c => c.health === 'bleaching' || c.health === 'dead')
  if (bleaching.length > 0) {
    recs.push(`Investigate quality degradation in ${bleaching.length} bleaching/dead colony(ies)`)
  }

  const invasive = polyps.filter(p => p.isInvasive)
  if (invasive.length > 0) {
    recs.push(`Refactor ${invasive.length} invasive polyp(s) — problematic patterns detected`)
  }

  const parasitic = symbiosis.filter(s => s.type === 'parasitic')
  if (parasitic.length > 0) {
    recs.push(`Decouple ${parasitic.length} parasitic relationship(s) — one-sided dependencies`)
  }

  if (stats.biodiversityIndex < 40) {
    recs.push('Low biodiversity — introduce more pattern variety and module types')
  }

  if (stats.avgBleachingRisk > 60) {
    recs.push('High average bleaching risk — improve type safety and testing')
  }

  if (stats.reefHealth < 40) {
    recs.push('Low reef health — consider significant refactoring of core modules')
  }

  const deadPolyps = polyps.filter(p => p.bleachingRisk > 80)
  if (deadPolyps.length > 0) {
    recs.push(`Address ${deadPolyps.length} polyp(s) with critical bleaching risk`)
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the complete coral result
 * @example
 * buildCoralResult(['a.ts'], ['export const x = 1'], {}) // CoralResult
 */
export function buildCoralResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): CoralResult {
  const polyps: CoralPolyp[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i]
    if (file === undefined || content === undefined) continue
    polyps.push(buildPolyp(content, file))
  }

  const byDir = new Map<string, { files: string[]; contents: string[] }>()
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i]
    if (file === undefined || content === undefined) continue
    const parts = file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    if (!byDir.has(dir)) byDir.set(dir, { files: [], contents: [] })
    const entry = byDir.get(dir)
    if (!entry) continue
    entry.files.push(file)
    entry.contents.push(content)
  }

  const colonies: CoralColony[] = []
  for (const [dir, data] of byDir) {
    colonies.push(analyzeColony(data.files, data.contents, dir))
  }

  const zones = mapReefZones(files, polyps)
  const symbiosis = detectSymbiosis(polyps, files, contents)

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const reefHealth = computeReefHealth(colonies, polyps)
  const biodiversityIndex = computeBiodiversityIndex(polyps, colonies)
  const ecosystemStability = computeEcosystemStability(reefHealth, biodiversityIndex, symbiosis)
  const overallReef = classifyOverallReef(reefHealth, biodiversityIndex, ecosystemStability)

  const stats: CoralStats = {
    totalColonies: colonies.length,
    totalPolyps: polyps.length,
    branchingPolyps: polyps.filter(p => p.type === 'branching').length,
    massivePolyps: polyps.filter(p => p.type === 'massive').length,
    keystonePolyps: polyps.filter(p => p.isKeystone).length,
    invasivePolyps: polyps.filter(p => p.isInvasive).length,
    thrivingColonies: colonies.filter(c => c.health === 'thriving').length,
    bleachingColonies: colonies.filter(c => c.health === 'bleaching' || c.health === 'dead').length,
    totalSymbiosis: symbiosis.length,
    mutualisticRelations: symbiosis.filter(s => s.type === 'mutualistic').length,
    parasiticRelations: symbiosis.filter(s => s.type === 'parasitic').length,
    avgBiodiversity: avg(zones.map(z => z.biodiversity)),
    avgComplexity: avg(polyps.map(p => p.complexity)),
    avgBleachingRisk: avg(polyps.map(p => p.bleachingRisk)),
    reefHealth,
    biodiversityIndex,
    ecosystemStability,
    overallReef,
  }

  const recommendations = generateRecommendations(colonies, polyps, symbiosis, zones, stats)

  return { colonies, polyps, zones, symbiosis, stats, recommendations }
}
