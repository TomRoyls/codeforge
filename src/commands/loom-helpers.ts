// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ThreadConnections {
  warpConnections: number
  weftConnections: number
  crossConnections: number
  totalConnections: number
}

export interface ThreadDefects {
  pills: number
  snags: number
  holes: number
  runs: number
  weakSpots: number
}

export interface Thread {
  file: string
  threadType: 'warp' | 'weft' | 'decorative' | 'structural' | 'fill' | 'selvedge'
  material: 'silk' | 'cotton' | 'linen' | 'wool' | 'synthetic' | 'metallic' | 'rag'
  strength: number
  elasticity: number
  tension: number
  thickness: number
  smoothness: number
  color: string
  pattern: string
  isFrayed: boolean
  isBroken: boolean
  isKnot: boolean
  isLoose: boolean
  isTight: boolean
  connections: ThreadConnections
  defects: ThreadDefects
  quality: number
  classification: 'premium' | 'fine' | 'standard' | 'economy' | 'reject'
}

export interface Fabric {
  directory: string
  threads: Thread[]
  threadCount: number
  weaveType: 'plain' | 'twill' | 'satin' | 'basket' | 'leno' | 'jacquard' | 'knit'
  patternComplexity: number
  avgTension: number
  tensionVariance: number
  avgStrength: number
  avgSmoothness: number
  warpCount: number
  weftCount: number
  frayedThreads: number
  brokenThreads: number
  knottedThreads: number
  looseThreads: number
  tightThreads: number
  totalDefects: number
  fabricWidth: number
  fabricLength: number
  density: number
  breathability: number
  durability: number
  drape: number
  hand: number
  condition: 'pristine' | 'excellent' | 'good' | 'fair' | 'worn' | 'threadbare' | 'torn'
  qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface LoomStats {
  totalFiles: number
  totalFabrics: number
  totalThreads: number
  warpThreads: number
  weftThreads: number
  avgThreadStrength: number
  avgThreadElasticity: number
  avgThreadTension: number
  avgThreadSmoothness: number
  premiumThreads: number
  rejectThreads: number
  frayedThreads: number
  brokenThreads: number
  knottedThreads: number
  totalDefects: number
  avgFabricDensity: number
  avgFabricBreathability: number
  avgFabricDurability: number
  avgFabricQuality: number
  pristineFabrics: number
  tornFabrics: number
  overallWeaveQuality: number
  masterWeaver: string
  apprenticeWork: string
  dominantWeave: string
  dominantMaterial: string
  weaverGrade: 'master-weaver' | 'journeyman' | 'apprentice' | 'novice' | 'clumsy'
}

export interface LoomResult {
  threads: Thread[]
  fabrics: Fabric[]
  stats: LoomStats
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────────────────────────

const EXPORT_RE = /export\s+(?:default\s+)?(?:function|class|const|let|interface|type)/g
const IMPORT_RE = /import\s+.*?from\s+['"]([^'"]+)['"]/g
const FUNCTION_RE = /(?:export\s+)?(?:async\s+)?function\s+\w+/g
const CLASS_RE = /(?:export\s+)?(?:abstract\s+)?class\s+\w+/g
const INTERFACE_RE = /(?:export\s+)?interface\s+\w+/g
const TYPE_RE = /(?:export\s+)?type\s+\w+/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const TODO_RE = /\/\/\s*(TODO|FIXME|HACK|XXX)/gi
const ANY_RE = /:\s*any\b/g
const CONSOLE_RE = /console\.\w+\(/g
const NESTED_IF_RE = /if\s*\(.*if\s*\(/s
const TRY_CATCH_RE = /try\s*\{/g
const ERROR_RE = /(?:throw|catch|Error)\b/g

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify thread type from code content
 * @example
 * classifyThreadType(3, 5, 1) // 'warp'
 */
export function classifyThreadType(interfaces: number, functions: number, classes: number): Thread['threadType'] {
  if (interfaces + classes >= 3 && functions <= 2) return 'structural'
  if (interfaces >= 2) return 'warp'
  if (functions >= 5) return 'weft'
  if (classes >= 2) return 'structural'
  if (functions >= 2) return 'weft'
  if (functions === 0 && interfaces === 0 && classes === 0) return 'selvedge'
  return 'fill'
}

/**
 * Classify material based on code quality indicators
 * @example
 * classifyMaterial(90, 5, 80) // 'silk'
 */
export function classifyMaterial(smoothness: number, defects: number, strength: number): Thread['material'] {
  const score = (smoothness + strength) / 2 - defects * 5
  if (score >= 80) return 'silk'
  if (score >= 65) return 'cotton'
  if (score >= 50) return 'linen'
  if (score >= 35) return 'wool'
  if (score >= 20) return 'synthetic'
  if (score >= 5) return 'metallic'
  return 'rag'
}

/**
 * Classify thread quality
 * @example
 * classifyThread(90) // 'premium'
 */
export function classifyThread(quality: number): Thread['classification'] {
  if (quality >= 85) return 'premium'
  if (quality >= 70) return 'fine'
  if (quality >= 50) return 'standard'
  if (quality >= 30) return 'economy'
  return 'reject'
}

/**
 * Classify weave type from thread distribution
 * @example
 * classifyWeaveType(10, 8, 50) // 'jacquard'
 */
export function classifyWeaveType(threadCount: number, avgConnections: number, patternComplexity: number): Fabric['weaveType'] {
  if (patternComplexity >= 70 && threadCount >= 10) return 'jacquard'
  if (avgConnections >= 5) return 'leno'
  if (patternComplexity >= 50) return 'twill'
  if (threadCount >= 8 && avgConnections >= 3) return 'basket'
  if (patternComplexity >= 30) return 'satin'
  if (threadCount <= 3) return 'knit'
  return 'plain'
}

/**
 * Classify fabric condition from quality
 * @example
 * classifyFabricCondition(90) // 'pristine'
 */
export function classifyFabricCondition(avgQuality: number): Fabric['condition'] {
  if (avgQuality >= 85) return 'pristine'
  if (avgQuality >= 70) return 'excellent'
  if (avgQuality >= 55) return 'good'
  if (avgQuality >= 40) return 'fair'
  if (avgQuality >= 25) return 'worn'
  if (avgQuality >= 10) return 'threadbare'
  return 'torn'
}

/**
 * Classify quality grade
 * @example
 * classifyQualityGrade(90) // 'A'
 */
export function classifyQualityGrade(avgQuality: number): Fabric['qualityGrade'] {
  if (avgQuality >= 85) return 'A'
  if (avgQuality >= 70) return 'B'
  if (avgQuality >= 55) return 'C'
  if (avgQuality >= 35) return 'D'
  return 'F'
}

/**
 * Classify weaver grade from overall quality
 * @example
 * classifyWeaverGrade(90) // 'master-weaver'
 */
export function classifyWeaverGrade(quality: number): LoomStats['weaverGrade'] {
  if (quality >= 80) return 'master-weaver'
  if (quality >= 60) return 'journeyman'
  if (quality >= 40) return 'apprentice'
  if (quality >= 20) return 'novice'
  return 'clumsy'
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a thread
 * @example
 * analyzeThread('export function a() {}', 'a.ts', [], []) // Thread
 */
export function analyzeThread(content: string, filePath: string, imports: string[], dependents: string[]): Thread {
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)

  const exports = (content.match(EXPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const todos = (content.match(TODO_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const consoles = (content.match(CONSOLE_RE) ?? []).length
  const nestedIf = NESTED_IF_RE.test(content)
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const errors = (content.match(ERROR_RE) ?? []).length

  const strength = computeStrength(tryCatch, errors, codeLines.length)
  const elasticity = computeElasticity(imports.length, dependents.length)
  const tension = computeTension(imports.length, dependents.length)
  const thickness = computeThickness(codeLines.length)
  const smoothness = computeSmoothness(jsdoc, anys, consoles, codeLines.length, exports, interfaces + types)

  const threadType = classifyThreadType(interfaces + types, functions, classes)
  const material = classifyMaterial(smoothness, todos + anys, strength)

  const connections = computeConnections(imports.length, dependents.length, interfaces + types, functions)
  const defects = computeDefects(todos, anys, nestedIf, codeLines.length)

  const isFrayed = smoothness < 40
  const isBroken = defects.holes >= 2 || defects.runs >= 2
  const isKnot = nestedIf || defects.snags >= 2
  const isLoose = connections.totalConnections <= 1 && codeLines.length > 5
  const isTight = tension >= 70

  const quality = computeThreadQuality(strength, elasticity, smoothness, tension, defects)
  const classification = classifyThread(quality)

  const color = identifyColor(exports, functions, classes, interfaces)
  const pattern = identifyPattern(functions, classes, interfaces)

  return {
    file: filePath,
    threadType,
    material,
    strength,
    elasticity,
    tension,
    thickness,
    smoothness,
    color,
    pattern,
    isFrayed,
    isBroken,
    isKnot,
    isLoose,
    isTight,
    connections,
    defects,
    quality,
    classification,
  }
}

// ─── Metric Computations ─────────────────────────────────────────────────────

function computeStrength(tryCatch: number, errors: number, lines: number): number {
  if (lines === 0) return 0
  let score = 40
  score += Math.min(20, tryCatch * 5)
  score += Math.min(20, errors * 3)
  score += Math.min(10, Math.round(lines / 10))
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeElasticity(imports: number, dependents: number): number {
  const total = imports + dependents
  if (total === 0) return 100
  if (total <= 3) return 80
  if (total <= 6) return 60
  if (total <= 10) return 40
  return 20
}

function computeTension(imports: number, dependents: number): number {
  return Math.min(100, Math.round((imports + dependents) * 8))
}

function computeThickness(lines: number): number {
  return Math.min(100, Math.round(lines * 0.5))
}

function computeSmoothness(jsdoc: number, anys: number, consoles: number, lines: number, exports: number, structural: number): number {
  if (lines === 0) return 0
  let score = 30
  score += Math.min(20, jsdoc * 3)
  score += Math.min(15, exports * 3)
  score += Math.min(10, structural * 3)
  score -= anys * 10
  score -= consoles * 3
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeConnections(imports: number, dependents: number, structural: number, functions: number): ThreadConnections {
  const warpConnections = structural + dependents
  const weftConnections = functions + imports
  const crossConnections = Math.min(imports, dependents)
  return {
    warpConnections,
    weftConnections,
    crossConnections,
    totalConnections: warpConnections + weftConnections + crossConnections,
  }
}

function computeDefects(todos: number, anys: number, hasNestedIf: boolean, lines: number): ThreadDefects {
  const pills = todos + anys
  const snags = hasNestedIf ? 2 : 0
  const holes = lines > 5 && todos >= 3 ? 2 : (todos >= 1 ? 1 : 0)
  const runs = anys >= 2 ? 2 : (anys >= 1 ? 1 : 0)
  const weakSpots = (pills + snags + holes + runs >= 4) ? 1 : 0
  return { pills, snags, holes, runs, weakSpots }
}

function computeThreadQuality(strength: number, elasticity: number, smoothness: number, tension: number, defects: ThreadDefects): number {
  const defectPenalty = (defects.pills + defects.snags + defects.holes + defects.runs + defects.weakSpots) * 3
  const tensionPenalty = tension > 60 ? (tension - 60) * 0.5 : 0
  const raw = (strength * 0.25 + elasticity * 0.2 + smoothness * 0.3 + (100 - tensionPenalty) * 0.25) - defectPenalty
  return Math.min(100, Math.max(0, Math.round(raw)))
}

function identifyColor(exports: number, functions: number, classes: number, interfaces: number): string {
  if (interfaces >= 2 && classes >= 2) return 'architectural'
  if (classes >= 2) return 'object-oriented'
  if (functions >= 3 && exports >= 2) return 'functional'
  if (exports >= 3) return 'api'
  if (functions >= 2) return 'procedural'
  if (interfaces >= 1) return 'contractual'
  return 'utility'
}

function identifyPattern(functions: number, classes: number, interfaces: number): string {
  if (classes >= 3) return 'class-hierarchy'
  if (functions >= 5) return 'function-chain'
  if (interfaces >= 2 && functions >= 2) return 'interface-impl'
  if (classes >= 1 && interfaces >= 1) return 'implements-pattern'
  if (functions >= 2) return 'modular'
  return 'simple'
}

// ─── Fabric Analysis ─────────────────────────────────────────────────────────

/**
 * Analyze a directory as a fabric
 * @example
 * analyzeFabric(threads, 'src') // Fabric
 */
export function analyzeFabric(threads: Thread[], dirPath: string): Fabric {
  if (threads.length === 0) {
    return {
      directory: dirPath,
      threads: [],
      threadCount: 0,
      weaveType: 'plain',
      patternComplexity: 0,
      avgTension: 0,
      tensionVariance: 0,
      avgStrength: 0,
      avgSmoothness: 0,
      warpCount: 0,
      weftCount: 0,
      frayedThreads: 0,
      brokenThreads: 0,
      knottedThreads: 0,
      looseThreads: 0,
      tightThreads: 0,
      totalDefects: 0,
      fabricWidth: 0,
      fabricLength: 0,
      density: 0,
      breathability: 0,
      durability: 0,
      drape: 0,
      hand: 0,
      condition: 'torn',
      qualityGrade: 'F',
    }
  }

  const threadCount = threads.length
  const avgTension = Math.round(threads.reduce((s, t) => s + t.tension, 0) / threadCount)
  const tensionVariance = Math.round(threads.reduce((s, t) => s + Math.pow(t.tension - avgTension, 2), 0) / threadCount)
  const avgStrength = Math.round(threads.reduce((s, t) => s + t.strength, 0) / threadCount)
  const avgSmoothness = Math.round(threads.reduce((s, t) => s + t.smoothness, 0) / threadCount)

  const warpCount = threads.filter(t => t.threadType === 'warp' || t.threadType === 'structural').length
  const weftCount = threads.filter(t => t.threadType === 'weft').length

  const frayedThreads = threads.filter(t => t.isFrayed).length
  const brokenThreads = threads.filter(t => t.isBroken).length
  const knottedThreads = threads.filter(t => t.isKnot).length
  const looseThreads = threads.filter(t => t.isLoose).length
  const tightThreads = threads.filter(t => t.isTight).length

  const totalDefects = threads.reduce((s, t) => s + t.defects.pills + t.defects.snags + t.defects.holes + t.defects.runs + t.defects.weakSpots, 0)

  const avgConnections = threads.reduce((s, t) => s + t.connections.totalConnections, 0) / threadCount
  const patternComplexity = computePatternComplexity(threads)
  const weaveType = classifyWeaveType(threadCount, avgConnections, patternComplexity)

  const fabricWidth = Array.from(new Set(threads.map(t => t.color))).length
  const fabricLength = Math.round(threads.reduce((s, t) => s + t.thickness, 0) / threadCount)
  const density = Math.min(100, Math.round(threadCount * 5 + totalDefects * 2))

  const breathability = computeBreathability(threads)
  const durability = computeDurability(threads)
  const drape = computeDrape(threads)
  const hand = computeHand(threads)

  const avgQuality = Math.round(threads.reduce((s, t) => s + t.quality, 0) / threadCount)
  const condition = classifyFabricCondition(avgQuality)
  const qualityGrade = classifyQualityGrade(avgQuality)

  return {
    directory: dirPath,
    threads,
    threadCount,
    weaveType,
    patternComplexity,
    avgTension,
    tensionVariance,
    avgStrength,
    avgSmoothness,
    warpCount,
    weftCount,
    frayedThreads,
    brokenThreads,
    knottedThreads,
    looseThreads,
    tightThreads,
    totalDefects,
    fabricWidth,
    fabricLength,
    density,
    breathability,
    durability,
    drape,
    hand,
    condition,
    qualityGrade,
  }
}

/**
 * Compute pattern complexity from threads
 * @example
 * computePatternComplexity(threads) // 50
 */
export function computePatternComplexity(threads: Thread[]): number {
  if (threads.length === 0) return 0
  const types = Array.from(new Set(threads.map(t => t.threadType))).length
  const materials = Array.from(new Set(threads.map(t => t.material))).length
  const avgConn = threads.reduce((s, t) => s + t.connections.totalConnections, 0) / threads.length
  return Math.min(100, Math.round(types * 10 + materials * 8 + avgConn * 5))
}

/**
 * Compute breathability from threads
 * @example
 * computeBreathability(threads) // 70
 */
export function computeBreathability(threads: Thread[]): number {
  if (threads.length === 0) return 0
  const avgSmooth = threads.reduce((s, t) => s + t.smoothness, 0) / threads.length
  const avgElastic = threads.reduce((s, t) => s + t.elasticity, 0) / threads.length
  const defectRatio = threads.reduce((s, t) => s + t.defects.pills + t.defects.snags, 0) / threads.length
  return Math.min(100, Math.max(0, Math.round((avgSmooth * 0.4 + avgElastic * 0.4) - defectRatio * 5)))
}

/**
 * Compute durability from threads
 * @example
 * computeDurability(threads) // 65
 */
export function computeDurability(threads: Thread[]): number {
  if (threads.length === 0) return 0
  const avgStrength = threads.reduce((s, t) => s + t.strength, 0) / threads.length
  const avgElastic = threads.reduce((s, t) => s + t.elasticity, 0) / threads.length
  const brokenRatio = threads.filter(t => t.isBroken).length / threads.length
  return Math.min(100, Math.max(0, Math.round((avgStrength * 0.5 + avgElastic * 0.3 + 20) - brokenRatio * 30)))
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations for improving the weave
 * @example
 * generateLoomRecommendations(threads, fabrics, stats) // string[]
 */
export function generateLoomRecommendations(
  threads: Thread[],
  fabrics: Fabric[],
  stats: LoomStats,
): string[] {
  const recs: string[] = []

  if (stats.brokenThreads > 0) recs.push(`${stats.brokenThreads} broken thread(s) detected - fix errors and gaps`)
  if (stats.knottedThreads > 0) recs.push(`${stats.knottedThreads} knotted thread(s) found - untangle complex logic`)
  if (stats.frayedThreads > 3) recs.push(`${stats.frayedThreads} frayed thread(s) - improve readability and documentation`)
  if (stats.avgThreadTension > 60) recs.push('High average tension - reduce coupling between files')
  if (stats.rejectThreads > 0) recs.push(`${stats.rejectThreads} reject thread(s) need major refactoring`)
  if (stats.totalDefects > 10) recs.push(`${stats.totalDefects} total defects - address code smells systematically`)
  if (stats.avgFabricBreathability < 40) recs.push('Low breathability - simplify code for easier modification')
  if (stats.tornFabrics > 0) recs.push(`${stats.tornFabrics} torn fabric(s) need rebuilding`)

  const wornFabrics = fabrics.filter(f => f.condition === 'worn' || f.condition === 'threadbare')
  if (wornFabrics.length > 0) recs.push(`${wornFabrics.length} worn fabric(s) need attention`)

  if (recs.length === 0) recs.push('Fine weave ahead - excellent craftsmanship across the codebase')
  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete loom analysis result
 * @example
 * buildLoomResult(files, contents, {}) // LoomResult
 */
export function buildLoomResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): LoomResult {
  const importMap = new Map<string, string[]>()
  const dependentMap = new Map<string, string[]>()

  for (let i = 0; i < files.length; i++) {
    const matches = contents[i].matchAll(IMPORT_RE)
    const importedPaths: string[] = []
    for (const m of matches) {
      importedPaths.push(m[1])
    }
    importMap.set(files[i], importedPaths)
    dependentMap.set(files[i], [])
  }

  for (const [file, imports] of importMap) {
    for (const imp of imports) {
      for (const otherFile of files) {
        if (otherFile !== file && (otherFile.endsWith(imp) || otherFile.includes(imp.replace(/^\.\//, '')))) {
          const deps = dependentMap.get(otherFile)
          if (deps) deps.push(file)
        }
      }
    }
  }

  const threads: Thread[] = []
  for (let i = 0; i < files.length; i++) {
    const fileImports = importMap.get(files[i]) ?? []
    const fileDependents = dependentMap.get(files[i]) ?? []
    threads.push(analyzeThread(contents[i], files[i], fileImports, fileDependents))
  }

  const dirMap = new Map<string, Thread[]>()
  for (const thread of threads) {
    const normalized = thread.file.replace(/\\/g, '/')
    const dir = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) existing.push(thread)
    else dirMap.set(dir, [thread])
  }

  const fabrics: Fabric[] = []
  for (const [dir, dirThreads] of dirMap) {
    fabrics.push(analyzeFabric(dirThreads, dir))
  }

  const stats = computeStats(threads, fabrics)
  const recommendations = generateLoomRecommendations(threads, fabrics, stats)

  return { threads, fabrics, stats, recommendations }
}

function computeDrape(threads: Thread[]): number {
  if (threads.length === 0) return 0
  const avgElastic = threads.reduce((s, t) => s + t.elasticity, 0) / threads.length
  const avgSmooth = threads.reduce((s, t) => s + t.smoothness, 0) / threads.length
  return Math.min(100, Math.max(0, Math.round((avgElastic * 0.5 + avgSmooth * 0.3 + 10))))
}

function computeHand(threads: Thread[]): number {
  if (threads.length === 0) return 0
  const avgSmooth = threads.reduce((s, t) => s + t.smoothness, 0) / threads.length
  const avgStrength = threads.reduce((s, t) => s + t.strength, 0) / threads.length
  const avgQuality = threads.reduce((s, t) => s + t.quality, 0) / threads.length
  return Math.min(100, Math.max(0, Math.round((avgSmooth * 0.3 + avgStrength * 0.3 + avgQuality * 0.4))))
}

function computeStats(threads: Thread[], fabrics: Fabric[]): LoomStats {
  const totalFiles = threads.length
  const totalFabrics = fabrics.length
  const totalThreads = threads.length

  const warpThreads = threads.filter(t => t.threadType === 'warp' || t.threadType === 'structural').length
  const weftThreads = threads.filter(t => t.threadType === 'weft').length

  const avgThreadStrength = totalFiles > 0 ? Math.round(threads.reduce((s, t) => s + t.strength, 0) / totalFiles) : 0
  const avgThreadElasticity = totalFiles > 0 ? Math.round(threads.reduce((s, t) => s + t.elasticity, 0) / totalFiles) : 0
  const avgThreadTension = totalFiles > 0 ? Math.round(threads.reduce((s, t) => s + t.tension, 0) / totalFiles) : 0
  const avgThreadSmoothness = totalFiles > 0 ? Math.round(threads.reduce((s, t) => s + t.smoothness, 0) / totalFiles) : 0

  const premiumThreads = threads.filter(t => t.classification === 'premium').length
  const rejectThreads = threads.filter(t => t.classification === 'reject').length
  const frayedThreads = threads.filter(t => t.isFrayed).length
  const brokenThreads = threads.filter(t => t.isBroken).length
  const knottedThreads = threads.filter(t => t.isKnot).length
  const totalDefects = threads.reduce((s, t) => s + t.defects.pills + t.defects.snags + t.defects.holes + t.defects.runs + t.defects.weakSpots, 0)

  const avgFabricDensity = totalFabrics > 0 ? Math.round(fabrics.reduce((s, f) => s + f.density, 0) / totalFabrics) : 0
  const avgFabricBreathability = totalFabrics > 0 ? Math.round(fabrics.reduce((s, f) => s + f.breathability, 0) / totalFabrics) : 0
  const avgFabricDurability = totalFabrics > 0 ? Math.round(fabrics.reduce((s, f) => s + f.durability, 0) / totalFabrics) : 0
  const avgFabricQuality = totalFabrics > 0 ? Math.round(fabrics.reduce((s, f) => {
    const fq = Math.round(f.threads.reduce((s2, t) => s2 + t.quality, 0) / f.threads.length)
    return s + fq
  }, 0) / totalFabrics) : 0

  const pristineFabrics = fabrics.filter(f => f.condition === 'pristine' || f.condition === 'excellent').length
  const tornFabrics = fabrics.filter(f => f.condition === 'torn' || f.condition === 'threadbare').length

  const overallWeaveQuality = totalFiles > 0 ? Math.round(threads.reduce((s, t) => s + t.quality, 0) / totalFiles) : 0

  const sortedByQuality = [...threads].sort((a, b) => b.quality - a.quality)
  const masterWeaver = sortedByQuality.length > 0 ? sortedByQuality[0].file : 'none'
  const apprenticeWork = sortedByQuality.length > 0 ? sortedByQuality[sortedByQuality.length - 1].file : 'none'

  const weaveCounts = new Map<string, number>()
  for (const f of fabrics) {
    weaveCounts.set(f.weaveType, (weaveCounts.get(f.weaveType) ?? 0) + 1)
  }
  let dominantWeave = 'plain'
  let maxWeave = 0
  for (const [w, count] of weaveCounts) {
    if (count > maxWeave) { maxWeave = count; dominantWeave = w }
  }

  const materialCounts = new Map<string, number>()
  for (const t of threads) {
    materialCounts.set(t.material, (materialCounts.get(t.material) ?? 0) + 1)
  }
  let dominantMaterial = 'cotton'
  let maxMat = 0
  for (const [m, count] of materialCounts) {
    if (count > maxMat) { maxMat = count; dominantMaterial = m }
  }

  const weaverGrade = classifyWeaverGrade(overallWeaveQuality)

  return {
    totalFiles,
    totalFabrics,
    totalThreads,
    warpThreads,
    weftThreads,
    avgThreadStrength,
    avgThreadElasticity,
    avgThreadTension,
    avgThreadSmoothness,
    premiumThreads,
    rejectThreads,
    frayedThreads,
    brokenThreads,
    knottedThreads,
    totalDefects,
    avgFabricDensity,
    avgFabricBreathability,
    avgFabricDurability,
    avgFabricQuality,
    pristineFabrics,
    tornFabrics,
    overallWeaveQuality,
    masterWeaver,
    apprenticeWork,
    dominantWeave,
    dominantMaterial,
    weaverGrade,
  }
}
