// ─── Type Definitions ────────────────────────────────────

export type ForestCondition = 'old-growth-forest' | 'healthy-forest' | 'secondary-forest' | 'plantation' | 'clear-cut' | 'desert'
export type StandType = 'ancient-woodland' | 'nature-reserve' | 'managed-forest' | 'plantation' | 'scrubland' | 'wasteland'
export type StandCondition = 'primeval-forest' | 'healthy-ecosystem' | 'functioning-forest' | 'degraded-woodland' | 'barren-land' | 'desert'
export type EcologistGrade = 'chief-ecologist' | 'forest-ecologist' | 'botanist' | 'gardener' | 'logger' | 'arsonist'

export interface CanopyMeasure {
  density: number
  isDense: boolean
  isSparse: boolean
  hasGaps: boolean
  hasTangles: boolean
  hasVines: boolean
  gapCount: number
  tangleCount: number
  vineCount: number
  layerHeight: number
}

export interface UnderstoryMeasure {
  health: number
  hasShrubs: boolean
  hasSaplings: boolean
  hasFerns: boolean
  hasMoss: boolean
  hasDeadwood: boolean
  deadwoodCount: number
  isHealthy: boolean
}

export interface FloorMeasure {
  vitality: number
  hasLeafLitter: boolean
  hasFungi: boolean
  hasSeedlings: boolean
  hasBareSoil: boolean
  hasRichSoil: boolean
  isFertile: boolean
}

export interface RootMeasure {
  depth: number
  spread: number
  hasTapRoot: boolean
  hasFibrousRoots: boolean
  hasMycorrhizae: boolean
  isInvasive: boolean
  mycorrhizaeCount: number
  isStable: boolean
}

export interface BiodiversityMeasure {
  species: string[]
  variety: number
  richness: number
  isMonoculture: boolean
  isDiverse: boolean
  hasEndemicSpecies: boolean
  hasInvasiveSpecies: boolean
  invasiveCount: number
}

export interface LightMeasure {
  penetration: number
  isWellLit: boolean
  isShadowed: boolean
  hasSunbeams: boolean
  hasDeepShade: boolean
  hasDappledLight: boolean
  sunbeamCount: number
  deepShadeCount: number
}

export interface GrowthMeasure {
  age: number
  isGrowing: boolean
  isMature: boolean
  isOldGrowth: boolean
  isDead: boolean
  hasNewGrowth: boolean
  growthRate: number
}

export interface TreeCrown {
  file: string
  canopyDensity: number
  understoryHealth: number
  forestFloorVitality: number
  rootSystemDepth: number
  biodiversity: number
  lightPenetration: number
  canopy: CanopyMeasure
  understory: UnderstoryMeasure
  floor: FloorMeasure
  roots: RootMeasure
  biodiversityMeasure: BiodiversityMeasure
  light: LightMeasure
  growth: GrowthMeasure
  condition: ForestCondition
  qualityScore: number
}

export interface ForestStand {
  directory: string
  crowns: TreeCrown[]
  avgCanopyDensity: number
  avgBiodiversity: number
  avgLightPenetration: number
  oldGrowthCount: number
  desertCount: number
  diverseCount: number
  monocultureCount: number
  standType: StandType
  condition: StandCondition
}

export interface EcosystemMeasure {
  avgCanopyDensity: number
  avgBiodiversity: number
  avgLightPenetration: number
  isHealthy: boolean
  overallHealth: number
}

export interface ForestCanopyStats {
  totalFiles: number
  totalStands: number
  avgCanopyDensity: number
  avgUnderstoryHealth: number
  avgForestFloorVitality: number
  avgRootSystemDepth: number
  avgBiodiversity: number
  avgLightPenetration: number
  oldGrowthForestCount: number
  healthyForestCount: number
  secondaryForestCount: number
  plantationCount: number
  clearCutCount: number
  desertCount: number
  denseCanopyCount: number
  hasGapsCount: number
  hasVinesCount: number
  isFertileCount: number
  hasTapRootCount: number
  hasMycorrhizaeCount: number
  isDiverseCount: number
  isMonocultureCount: number
  hasInvasiveCount: number
  isWellLitCount: number
  isShadowedCount: number
  isMatureCount: number
  isGrowingCount: number
  overallHealth: number
  ecologistGrade: EcologistGrade
  healthiestTree: string
  deepestRoots: string
  mostDiverse: string
  bestLit: string
  mostMature: string
}

export interface ForestCanopyResult {
  crowns: TreeCrown[]
  stands: ForestStand[]
  ecosystem: EcosystemMeasure
  stats: ForestCanopyStats
  recommendations: string[]
}

// ─── Primitive Counters ──────────────────────────────────

export function countLoc(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter(l => l.trim().length > 0).length
}

export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

export function countInterfaces(content: string): number {
  const m = content.match(/\binterface\s+\w+/g)
  return m ? m.length : 0
}

export function countErrorHandling(content: string): number {
  let count = 0
  const t = content.match(/\btry\s*\{/g); if (t) count += t.length
  const c = content.match(/\bcatch\s/g); if (c) count += c.length
  const th = content.match(/\bthrow\s/g); if (th) count += th.length
  return count
}

export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:string|number|boolean|void|null|undefined|never|any|unknown|object|bigint|symbol)(?:\[\])?\b/g)
  return m ? m.length : 0
}

export function countBranches(content: string): number {
  let count = 0
  const i = content.match(/\bif\s*\(/g); if (i) count += i.length
  const e = content.match(/\belse\s/g); if (e) count += e.length
  const s = content.match(/\bswitch\s*\(/g); if (s) count += s.length
  return count
}

export function maxNesting(content: string): number {
  let max = 0, d = 0
  for (const ch of content) {
    if (ch === '{') { d++; if (d > max) max = d }
    if (ch === '}') d = Math.max(0, d - 1)
  }
  return max
}

export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

export function countComments(content: string): number {
  let count = 0
  const s = content.match(/\/\/.*$/gm); if (s) count += s.length
  const b = content.match(/\/\*[\s\S]*?\*\//g); if (b) count += b.length
  return count
}

export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b|\bFIXME\b|\bHACK\b/gi)
  return m ? m.length : 0
}

export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

export function extractImportPaths(content: string): string[] {
  const m = content.match(/from\s+['"]([^'"]+)['"]/g)
  if (!m) return []
  return m.map(s => {
    const inner = s.match(/['"]([^'"]+)['"]/)
    return inner?.[1] ?? ''
  }).filter((s): s is string => s !== '')
}

// ─── Canopy Measurement ──────────────────────────────────

/**
 * Measure canopy density and structure
 * @example
 * measureCanopy('export function f(x: number): number { return x }') // { density, isDense, ... }
 */
export function measureCanopy(content: string): CanopyMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const interfaces = countInterfaces(content)
  const classes = countClasses(content)

  const density = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (classes > 0 ? 10 : 0) +
    (countErrorHandling(content) > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0),
  )))

  const isDense = density >= 70
  const isSparse = density < 30
  const hasGaps = exports === 0 && countFunctions(content) > 0
  const hasTangles = maxNesting(content) > 4
  const hasVines = countImports(content) > 3 && exports === 0
  const gapCount = hasGaps ? 1 : 0
  const tangleCount = Math.max(0, maxNesting(content) - 4)
  const vineCount = hasVines ? 1 : 0
  const layerHeight = Math.min(100, (exports * 10) + (types * 8) + (interfaces * 12) + (classes * 10))

  return { density, isDense, isSparse, hasGaps, hasTangles, hasVines, gapCount, tangleCount, vineCount, layerHeight }
}

// ─── Understory Measurement ──────────────────────────────

/**
 * Measure understory health
 * @example
 * measureUnderstory('function helper(x: number): number { return x * 2 }') // { health, hasShrubs, ... }
 */
export function measureUnderstory(content: string): UnderstoryMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const todos = countTodos(content)
  const exports = countExports(content)

  const health = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (functions > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (todos === 0 ? 15 : 0),
  )))

  const hasShrubs = functions > 0 && types > 0
  const hasSaplings = functions > 0 && exports === 0
  const hasFerns = countComments(content) > 0 && functions > 0
  const hasMoss = functions > 0 && countImports(content) === 0 && exports === 0
  const hasDeadwood = todos > 0
  const deadwoodCount = todos
  const isHealthy = health >= 60

  return { health, hasShrubs, hasSaplings, hasFerns, hasMoss, hasDeadwood, deadwoodCount, isHealthy }
}

// ─── Floor Measurement ───────────────────────────────────

/**
 * Measure forest floor vitality
 * @example
 * measureFloor('export function f(x: number): number { try { return x } catch (e) { return 0 } }') // { vitality, ... }
 */
export function measureFloor(content: string): FloorMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)

  const vitality = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 25 : 0) +
    (exports > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (countBranches(content) <= 5 ? 10 : 0),
  )))

  const hasLeafLitter = countComments(content) > 3 || countJSDoc(content) > 1
  const hasFungi = countTodos(content) > 0 && errors === 0
  const hasSeedlings = countFunctions(content) > 0 && exports === 0 && types === 0
  const hasBareSoil = errors === 0 && countFunctions(content) > 2
  const hasRichSoil = errors > 0 && types > 0 && exports > 0
  const isFertile = vitality >= 60

  return { vitality, hasLeafLitter, hasFungi, hasSeedlings, hasBareSoil, hasRichSoil, isFertile }
}

// ─── Root Measurement ────────────────────────────────────

/**
 * Measure root system depth and stability
 * @example
 * measureRoots('import { x } from "deep"; export function f(): void {}') // { depth, hasTapRoot, ... }
 */
export function measureRoots(content: string): RootMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const importPaths = extractImportPaths(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)

  const depth = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 25 : 0) +
    (errors > 0 ? 20 : 0) +
    (countInterfaces(content) > 0 ? 15 : 0) +
    (imports > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))

  const spread = Math.min(100, importPaths.length * 20)
  const hasTapRoot = imports > 0 && countExports(content) > 0 && types > 0
  const hasFibrousRoots = imports >= 3
  const hasMycorrhizae = imports > 0 && countInterfaces(content) > 0
  const isInvasive = maxNesting(content) > 4 && imports > 2
  const mycorrhizaeCount = countInterfaces(content)
  const isStable = depth >= 50 && !isInvasive

  return { depth, spread, hasTapRoot, hasFibrousRoots, hasMycorrhizae, isInvasive, mycorrhizaeCount, isStable }
}

// ─── Biodiversity Measurement ────────────────────────────

/**
 * Measure construct variety
 * @example
 * measureBiodiversity('export function f(x: number): number { return x }') // { species, richness, ... }
 */
export function measureBiodiversity(content: string): BiodiversityMeasure {
  const species: string[] = []
  if (countFunctions(content) > 0) species.push('function')
  if (countClasses(content) > 0) species.push('class')
  if (countInterfaces(content) > 0) species.push('interface')
  if (countExports(content) > 0) species.push('export')
  if (countImports(content) > 0) species.push('import')
  if (countTypeAnnotations(content) > 0) species.push('type')
  if (countErrorHandling(content) > 0) species.push('error-handling')
  if (countJSDoc(content) > 0) species.push('jsdoc')

  const variety = species.length
  const richness = Math.min(100, variety * 15)
  const isMonoculture = variety <= 1
  const isDiverse = variety >= 4
  const hasEndemicSpecies = countDescriptiveNames(content) > 0 && countInterfaces(content) > 0
  const hasInvasiveSpecies = countConsole(content) > 0 && countTodos(content) > 0
  const invasiveCount = countConsole(content) + countTodos(content)

  return { species, variety, richness, isMonoculture, isDiverse, hasEndemicSpecies, hasInvasiveSpecies, invasiveCount }
}

// ─── Light Measurement ───────────────────────────────────

/**
 * Measure documentation visibility
 * @example
 * measureLight(codeWithJsdocAndTypes) // { penetration, isWellLit, ... }
 */
export function measureLight(content: string): LightMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)

  const penetration = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 30 : 0) +
    (comments > 0 ? 15 : 0) +
    (types > 0 ? 20 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (countExports(content) > 0 ? 10 : 0) +
    (countErrorHandling(content) > 0 ? 10 : 0),
  )))

  const isWellLit = penetration >= 65
  const isShadowed = penetration < 30 && loc > 0
  const hasSunbeams = jsdoc >= 2
  const hasDeepShade = jsdoc === 0 && comments === 0 && loc > 5
  const hasDappledLight = jsdoc === 0 && comments > 0
  const sunbeamCount = jsdoc
  const deepShadeCount = hasDeepShade ? 1 : 0

  return { penetration, isWellLit, isShadowed, hasSunbeams, hasDeepShade, hasDappledLight, sunbeamCount, deepShadeCount }
}

// ─── Growth Measurement ──────────────────────────────────

/**
 * Measure code maturity and growth
 * @example
 * measureGrowth('export function f(x: number): number { try { return x } catch (e) { return 0 } }') // { age, isMature, ... }
 */
export function measureGrowth(content: string): GrowthMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const jsdoc = countJSDoc(content)

  const age = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (countInterfaces(content) > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (countClasses(content) > 0 ? 10 : 0),
  )))

  const isGrowing = age >= 30 && age < 70
  const isMature = age >= 70
  const isOldGrowth = age >= 75 && countTodos(content) === 0 && countConsole(content) === 0
  const isDead = age === 0 && loc > 0
  const hasNewGrowth = countFunctions(content) > 0 && jsdoc === 0 && errors === 0
  const growthRate = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (countFunctions(content) * 10) +
    (countBranches(content) * 5) +
    (countImports(content) * 8),
  )))

  return { age, isGrowing, isMature, isOldGrowth, isDead, hasNewGrowth, growthRate }
}

// ─── Classification ──────────────────────────────────────

export function classifyForestCondition(qualityScore: number): ForestCondition {
  if (qualityScore >= 85) return 'old-growth-forest'
  if (qualityScore >= 68) return 'healthy-forest'
  if (qualityScore >= 50) return 'secondary-forest'
  if (qualityScore >= 32) return 'plantation'
  if (qualityScore >= 15) return 'clear-cut'
  return 'desert'
}

export function classifyStandType(crowns: TreeCrown[]): StandType {
  if (crowns.length === 0) return 'wasteland'
  const avg = crowns.reduce((s, c) => s + c.qualityScore, 0) / crowns.length
  if (avg >= 80) return 'ancient-woodland'
  if (avg >= 62) return 'nature-reserve'
  if (avg >= 45) return 'managed-forest'
  if (avg >= 28) return 'plantation'
  if (avg >= 12) return 'scrubland'
  return 'wasteland'
}

export function classifyStandCondition(crowns: TreeCrown[]): StandCondition {
  if (crowns.length === 0) return 'desert'
  const avg = crowns.reduce((s, c) => s + c.qualityScore, 0) / crowns.length
  if (avg >= 80) return 'primeval-forest'
  if (avg >= 62) return 'healthy-ecosystem'
  if (avg >= 45) return 'functioning-forest'
  if (avg >= 28) return 'degraded-woodland'
  if (avg >= 12) return 'barren-land'
  return 'desert'
}

export function classifyEcologistGrade(avgHealth: number): EcologistGrade {
  if (avgHealth >= 80) return 'chief-ecologist'
  if (avgHealth >= 65) return 'forest-ecologist'
  if (avgHealth >= 48) return 'botanist'
  if (avgHealth >= 32) return 'gardener'
  if (avgHealth >= 16) return 'logger'
  return 'arsonist'
}

// ─── Core Analysis ───────────────────────────────────────

/**
 * Analyze a single file as a tree crown
 * @example
 * analyzeTreeCrown('export function f(x: number): number { return x }', 'f.ts') // TreeCrown
 */
export function analyzeTreeCrown(content: string, filePath: string): TreeCrown {
  const canopy = measureCanopy(content)
  const understory = measureUnderstory(content)
  const floor = measureFloor(content)
  const roots = measureRoots(content)
  const biodiversityMeasure = measureBiodiversity(content)
  const light = measureLight(content)
  const growth = measureGrowth(content)

  const loc = countLoc(content)
  const canopyDensity = canopy.density
  const understoryHealth = understory.health
  const forestFloorVitality = floor.vitality
  const rootSystemDepth = roots.depth
  const biodiversity = biodiversityMeasure.richness
  const lightPenetration = light.penetration

  const qualityScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (canopyDensity * 0.18) +
    (understoryHealth * 0.15) +
    (forestFloorVitality * 0.17) +
    (rootSystemDepth * 0.17) +
    (biodiversity * 0.15) +
    (lightPenetration * 0.18),
  )))

  const condition = classifyForestCondition(qualityScore)

  return {
    file: filePath,
    canopyDensity, understoryHealth, forestFloorVitality, rootSystemDepth, biodiversity, lightPenetration,
    canopy, understory, floor, roots, biodiversityMeasure, light, growth,
    condition, qualityScore,
  }
}

// ─── Forest Stand ────────────────────────────────────────

/**
 * Analyze a directory as a forest stand
 * @example
 * analyzeForestStand(crowns, 'src') // ForestStand
 */
export function analyzeForestStand(crowns: TreeCrown[], dirPath: string): ForestStand {
  const n = crowns.length
  const avgCanopyDensity = n === 0 ? 0 : Math.round(crowns.reduce((s, c) => s + c.canopyDensity, 0) / n)
  const avgBiodiversity = n === 0 ? 0 : Math.round(crowns.reduce((s, c) => s + c.biodiversity, 0) / n)
  const avgLightPenetration = n === 0 ? 0 : Math.round(crowns.reduce((s, c) => s + c.lightPenetration, 0) / n)
  const oldGrowthCount = crowns.filter(c => c.condition === 'old-growth-forest').length
  const desertCount = crowns.filter(c => c.condition === 'desert').length
  const diverseCount = crowns.filter(c => c.biodiversityMeasure.isDiverse).length
  const monocultureCount = crowns.filter(c => c.biodiversityMeasure.isMonoculture).length

  return {
    directory: dirPath, crowns,
    avgCanopyDensity, avgBiodiversity, avgLightPenetration,
    oldGrowthCount, desertCount, diverseCount, monocultureCount,
    standType: classifyStandType(crowns),
    condition: classifyStandCondition(crowns),
  }
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate actionable recommendations
 * @example
 * generateRecommendations(crowns, stands, ecosystem, stats) // string[]
 */
export function generateRecommendations(
  _crowns: TreeCrown[],
  stands: ForestStand[],
  ecosystem: EcosystemMeasure,
  stats: ForestCanopyStats,
): string[] {
  const recs: string[] = []

  if (stats.desertCount + stats.clearCutCount > 0) {
    recs.push(`Reforestation needed: ${stats.desertCount + stats.clearCutCount} file(s) need foundational code`)
  }
  if (stats.hasGapsCount > stats.totalFiles * 0.3 && stats.totalFiles > 0) {
    recs.push('Canopy gaps detected - add exports to cover abstraction layers')
  }
  if (stats.isMonocultureCount > stats.totalFiles * 0.5 && stats.totalFiles > 0) {
    recs.push('Monoculture risk - diversify with types, interfaces, and documentation')
  }
  if (stats.isShadowedCount > 0) {
    recs.push(`Shadowed areas: ${stats.isShadowedCount} file(s) lack documentation light`)
  }
  if (ecosystem.overallHealth >= 70) {
    recs.push('Healthy forest ecosystem - strong canopy and rich biodiversity throughout')
  }
  if (stats.isFertileCount > stats.totalFiles * 0.5 && stats.totalFiles > 0) {
    recs.push('Fertile forest floor - good error handling and type coverage')
  }
  if (stands.length > 1) {
    const barrenStands = stands.filter(s => s.standType === 'wasteland' || s.standType === 'scrubland')
    if (barrenStands.length > 0) {
      recs.push(`Barren stands: ${barrenStands.map(s => s.directory).join(', ')} need planting`)
    }
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete forest-canopy result
 * @example
 * buildForestCanopyResult(['a.ts'], ['export function a() {}'], {}) // ForestCanopyResult
 */
export function buildForestCanopyResult(files: string[], contents: string[], _options: Record<string, unknown>): ForestCanopyResult {
  const crowns: TreeCrown[] = files.map((file, i) => {
    const content = i < contents.length ? contents[i] : ''
    return analyzeTreeCrown(content ?? '', file)
  })

  const dirMap = new Map<string, TreeCrown[]>()
  for (const c of crowns) {
    const parts = c.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(c) } else { dirMap.set(dir, [c]) }
  }

  const stands = Array.from(dirMap.entries()).map(([dir, cs]) =>
    analyzeForestStand(cs, dir),
  )

  const totalFiles = crowns.length
  const avg = (fn: (c: TreeCrown) => number) => totalFiles === 0 ? 0 : Math.round(crowns.reduce((s, c) => s + fn(c), 0) / totalFiles)
  const overallHealth = avg(c => c.qualityScore)

  const ecosystem: EcosystemMeasure = {
    avgCanopyDensity: avg(c => c.canopyDensity),
    avgBiodiversity: avg(c => c.biodiversity),
    avgLightPenetration: avg(c => c.lightPenetration),
    isHealthy: overallHealth >= 60,
    overallHealth,
  }

  const condCounts = { oldGrowth: 0, healthy: 0, secondary: 0, plantation: 0, clearCut: 0, desert: 0 }
  for (const c of crowns) {
    switch (c.condition) {
      case 'old-growth-forest': condCounts.oldGrowth++; break
      case 'healthy-forest': condCounts.healthy++; break
      case 'secondary-forest': condCounts.secondary++; break
      case 'plantation': condCounts.plantation++; break
      case 'clear-cut': condCounts.clearCut++; break
      case 'desert': condCounts.desert++; break
    }
  }

  const stats: ForestCanopyStats = {
    totalFiles,
    totalStands: stands.length,
    avgCanopyDensity: avg(c => c.canopyDensity),
    avgUnderstoryHealth: avg(c => c.understoryHealth),
    avgForestFloorVitality: avg(c => c.forestFloorVitality),
    avgRootSystemDepth: avg(c => c.rootSystemDepth),
    avgBiodiversity: avg(c => c.biodiversity),
    avgLightPenetration: avg(c => c.lightPenetration),
    oldGrowthForestCount: condCounts.oldGrowth,
    healthyForestCount: condCounts.healthy,
    secondaryForestCount: condCounts.secondary,
    plantationCount: condCounts.plantation,
    clearCutCount: condCounts.clearCut,
    desertCount: condCounts.desert,
    denseCanopyCount: crowns.filter(c => c.canopy.isDense).length,
    hasGapsCount: crowns.filter(c => c.canopy.hasGaps).length,
    hasVinesCount: crowns.filter(c => c.canopy.hasVines).length,
    isFertileCount: crowns.filter(c => c.floor.isFertile).length,
    hasTapRootCount: crowns.filter(c => c.roots.hasTapRoot).length,
    hasMycorrhizaeCount: crowns.filter(c => c.roots.hasMycorrhizae).length,
    isDiverseCount: crowns.filter(c => c.biodiversityMeasure.isDiverse).length,
    isMonocultureCount: crowns.filter(c => c.biodiversityMeasure.isMonoculture).length,
    hasInvasiveCount: crowns.filter(c => c.biodiversityMeasure.hasInvasiveSpecies).length,
    isWellLitCount: crowns.filter(c => c.light.isWellLit).length,
    isShadowedCount: crowns.filter(c => c.light.isShadowed).length,
    isMatureCount: crowns.filter(c => c.growth.isMature).length,
    isGrowingCount: crowns.filter(c => c.growth.isGrowing).length,
    overallHealth,
    ecologistGrade: classifyEcologistGrade(overallHealth),
    healthiestTree: totalFiles === 0 ? 'none' : crowns.reduce((b, c) => c.qualityScore > b.qualityScore ? c : b).file,
    deepestRoots: totalFiles === 0 ? 'none' : crowns.reduce((b, c) => c.rootSystemDepth > b.rootSystemDepth ? c : b).file,
    mostDiverse: totalFiles === 0 ? 'none' : crowns.reduce((b, c) => c.biodiversity > b.biodiversity ? c : b).file,
    bestLit: totalFiles === 0 ? 'none' : crowns.reduce((b, c) => c.lightPenetration > b.lightPenetration ? c : b).file,
    mostMature: totalFiles === 0 ? 'none' : crowns.reduce((b, c) => c.growth.age > b.growth.age ? c : b).file,
  }

  const recommendations = generateRecommendations(crowns, stands, ecosystem, stats)

  return { crowns, stands, ecosystem, stats, recommendations }
}
