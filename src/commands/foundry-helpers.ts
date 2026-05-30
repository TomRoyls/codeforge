// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Defects {
  porosity: number
  slag: number
  shrinkage: number
  coldShuts: number
  hotTears: number
  misruns: number
  inclusions: number
  surfaceDefects: number
}

export interface MaterialProperties {
  hardness: number
  ductility: number
  malleability: number
  toughness: number
  conductivity: number
  magnetism: number
}

export interface CastPiece {
  file: string
  meltingPoint: number
  moldQuality: number
  castingPrecision: number
  alloyComposition: number
  finishingQuality: number
  structuralIntegrity: number
  metalType: 'titanium' | 'steel' | 'iron' | 'bronze' | 'copper' | 'brass' | 'tin' | 'lead'
  castingMethod: 'die-cast' | 'sand-cast' | 'investment' | 'centrifugal' | 'continuous' | 'hand-poured'
  defects: Defects
  properties: MaterialProperties
  heatTreatment: 'annealed' | 'normalized' | 'quenched' | 'tempered' | 'untreated'
  grade: 'aerospace' | 'industrial' | 'commercial' | 'scrap' | 'slag'
  weight: number
  qualityScore: number
  issues: string[]
  strengths: string[]
}

export interface FoundryBatch {
  directory: string
  pieces: CastPiece[]
  batchQuality: number
  dominantMetal: string
  dominantMethod: string
  avgDefects: number
  totalDefects: number
  aerospaceGrade: number
  scrapGrade: number
  heatTreatmentNeeded: number
  batchCondition: 'premium' | 'standard' | 'economy' | 'reject' | 'scrap-heap'
  foundryHealth: number
}

export interface FoundryStats {
  totalFiles: number
  totalBatches: number
  avgMeltingPoint: number
  avgMoldQuality: number
  avgCastingPrecision: number
  avgFinishingQuality: number
  avgStructuralIntegrity: number
  titaniumFiles: number
  steelFiles: number
  leadFiles: number
  aerospaceGrade: number
  industrialGrade: number
  commercialGrade: number
  scrapGrade: number
  totalPorosity: number
  totalSlag: number
  totalShrinkage: number
  totalColdShuts: number
  totalHotTears: number
  totalMisruns: number
  totalInclusions: number
  totalSurfaceDefects: number
  avgHardness: number
  avgDuctility: number
  avgMalleability: number
  avgToughness: number
  overallQuality: number
  foundryGrade: 'world-class' | 'certified' | 'standard' | 'substandard' | 'condemned'
  bestPiece: string
  worstPiece: string
  heaviestPiece: string
  lightestPiece: string
}

export interface FoundryResult {
  pieces: CastPiece[]
  batches: FoundryBatch[]
  stats: FoundryStats
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────────────────────────

const EXPORT_RE = /export\s+(?:default\s+)?(?:function|class|const|let|interface|type)/g
const IMPORT_RE = /import\s+.*?from\s+['"][^'"]+['"]/g
const FUNCTION_RE = /(?:export\s+)?(?:async\s+)?function\s+\w+/g
const CLASS_RE = /(?:export\s+)?(?:abstract\s+)?class\s+\w+/g
const INTERFACE_RE = /(?:export\s+)?interface\s+\w+/g
const TYPE_RE = /(?:export\s+)?type\s+\w+/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const TODO_RE = /\/\/\s*(TODO|FIXME|HACK|XXX)/gi
const ANY_RE = /:\s*any\b/g
const CONSOLE_RE = /console\.\w+\(/g
const EMPTY_BLOCK_RE = /\{\s*\}/g
const NESTED_TERNARY_RE = /\?.*\?.*:/s
const TRY_CATCH_RE = /try\s*\{/g
const ASYNC_RE = /async\s+/g

// ─── Defect Detection ────────────────────────────────────────────────────────

/**
 * Detect porosity - empty/gap areas in code
 * @example
 * detectPorosity('function empty() { }') // 1
 */
export function detectPorosity(content: string): number {
  let count = 0
  const emptyBlocks = content.match(EMPTY_BLOCK_RE)
  if (emptyBlocks) count += emptyBlocks.length
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)
  if (codeLines.length < lines.length * 0.4 && lines.length > 5) count += 2
  const stubs = content.match(/\/\/\s*(stub|noop|placeholder|todo)/gi)
  if (stubs) count += stubs.length
  return count
}

/**
 * Detect slag - impurities mixed into code
 * @example
 * detectSlag('var x = 1; console.log("debug")') // 2
 */
export function detectSlag(content: string): number {
  let count = 0
  if (content.match(/\bvar\b/)) count++
  const consoleMatches = content.match(CONSOLE_RE)
  if (consoleMatches) count += consoleMatches.length
  if (content.match(/\bdebugger\b/)) count++
  const anys = content.match(ANY_RE)
  if (anys) count += anys.length
  return count
}

/**
 * Detect shrinkage - incomplete implementations
 * @example
 * detectShrinkage('// TODO implement this') // 1
 */
export function detectShrinkage(content: string): number {
  const todos = content.match(TODO_RE)
  return todos ? todos.length : 0
}

/**
 * Detect cold shuts - disconnected logic (unreachable code)
 * @example
 * detectColdShuts('return 1\nconst x = 2') // 1
 */
export function detectColdShuts(content: string): number {
  let count = 0
  const returnMatches = content.match(/\breturn\b/g)
  if (returnMatches && returnMatches.length > 3) count++
  if (content.match(/\bbreak\b.*?\bbreak\b/s)) count++
  if (content.match(/\bthrow\b.*?\breturn\b/s)) count++
  const hasTry = content.match(TRY_CATCH_RE)
  const hasCatch = content.match(/\bcatch\b/)
  if (hasTry && !hasCatch) count++
  return count
}

/**
 * Detect hot tears - stress cracks from rush coding
 * @example
 * detectHotTears('if (x == null && y != undefined)') // 1
 */
export function detectHotTears(content: string): number {
  let count = 0
  if (content.includes('==') && !content.includes('===')) count++
  if (content.includes('!=') && !content.includes('!==')) count++
  if (NESTED_TERNARY_RE.test(content)) count++
  const longLines = content.split('\n').filter(l => l.length > 150)
  if (longLines.length > 3) count++
  return count
}

/**
 * Detect misruns - incomplete execution
 * @example
 * detectMisruns('export function halfDone() { }') // 1
 */
export function detectMisruns(content: string): number {
  let count = 0
  const exports = (content.match(EXPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const emptyBlocks = (content.match(EMPTY_BLOCK_RE) ?? []).length
  if (exports > 0 && functions > 0 && emptyBlocks >= functions) count++
  const imports = (content.match(IMPORT_RE) ?? []).length
  if (imports > 5 && exports === 0) count++
  return count
}

/**
 * Detect inclusions - foreign patterns mixed in
 * @example
 * detectInclusions('function Foo() { this.x = 1 }') // 1
 */
export function detectInclusions(content: string): number {
  let count = 0
  if (content.match(/\bthis\b/) && !content.match(CLASS_RE)) count++
  if (content.match(/\bprototype\b/)) count++
  if (content.match(/\brequire\s*\(/)) count++
  if (content.match(/\bnew\s+Function\b/)) count++
  if (content.match(/\beval\s*\(/)) count++
  return count
}

/**
 * Detect surface defects - formatting issues
 * @example
 * detectSurfaceDefects('  var  x   =  1') // 0
 */
export function detectSurfaceDefects(content: string): number {
  let count = 0
  const lines = content.split('\n')
  for (const line of lines) {
    if (line.includes('\t') && line.includes('  ')) { count++; break }
  }
  const trailingWhitespace = content.match(/[ \t]+$/m)
  if (trailingWhitespace) count++
  const mixedSemicolons = content.match(/;\s*;/)
  if (mixedSemicolons) count++
  return count
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify metal type based on material properties
 * @example
 * classifyMetalType({ hardness: 90, ductility: 80, toughness: 85 }) // 'titanium'
 */
export function classifyMetalType(props: MaterialProperties): CastPiece['metalType'] {
  const avg = (props.hardness + props.ductility + props.toughness) / 3
  if (avg >= 80 && props.hardness >= 70) return 'titanium'
  if (avg >= 70 && props.toughness >= 60) return 'steel'
  if (avg >= 55 && props.hardness >= 50) return 'iron'
  if (avg >= 50 && props.ductility >= 50) return 'bronze'
  if (avg >= 40) return 'copper'
  if (avg >= 30 && props.malleability >= 30) return 'brass'
  if (avg >= 20) return 'tin'
  return 'lead'
}

/**
 * Classify casting method based on code structure
 * @example
 * classifyCastingMethod('export function precise() {}') // 'die-cast'
 */
export function classifyCastingMethod(content: string): CastPiece['castingMethod'] {
  const exports = (content.match(EXPORT_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length

  if (jsdoc >= 2 && interfaces >= 1 && anys === 0) return 'die-cast'
  if (exports >= 3 && interfaces + types >= 2) return 'investment'
  if (exports >= 2 && content.includes('async')) return 'centrifugal'
  if (exports >= 1 && anys === 0) return 'continuous'
  if (exports >= 1) return 'sand-cast'
  return 'hand-poured'
}

/**
 * Classify heat treatment based on code quality
 * @example
 * classifyHeatTreatment({ qualityScore: 90, defects: { porosity: 0 } }) // 'annealed'
 */
export function classifyHeatTreatment(el: { qualityScore: number; defects: Defects }): CastPiece['heatTreatment'] {
  const totalDefects = el.defects.porosity + el.defects.slag + el.defects.shrinkage + el.defects.coldShuts + el.defects.hotTears + el.defects.misruns + el.defects.inclusions + el.defects.surfaceDefects
  if (el.qualityScore >= 75 && totalDefects === 0) return 'annealed'
  if (el.qualityScore >= 60 && totalDefects <= 2) return 'normalized'
  if (el.qualityScore >= 40) return 'tempered'
  if (el.qualityScore >= 20) return 'quenched'
  return 'untreated'
}

/**
 * Classify grade based on quality score
 * @example
 * classifyGrade(95) // 'aerospace'
 */
export function classifyGrade(qualityScore: number): CastPiece['grade'] {
  if (qualityScore >= 80) return 'aerospace'
  if (qualityScore >= 60) return 'industrial'
  if (qualityScore >= 40) return 'commercial'
  if (qualityScore >= 20) return 'scrap'
  return 'slag'
}

/**
 * Classify foundry grade from overall quality
 * @example
 * classifyFoundryGrade(90) // 'world-class'
 */
export function classifyFoundryGrade(overallQuality: number): FoundryStats['foundryGrade'] {
  if (overallQuality >= 80) return 'world-class'
  if (overallQuality >= 60) return 'certified'
  if (overallQuality >= 40) return 'standard'
  if (overallQuality >= 20) return 'substandard'
  return 'condemned'
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a cast piece
 * @example
 * analyzeCastPiece('export function add(a: number, b: number) { return a + b }', 'math.ts') // CastPiece
 */
export function analyzeCastPiece(content: string, filePath: string): CastPiece {
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)

  const exports = (content.match(EXPORT_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const todos = (content.match(TODO_RE) ?? []).length
  const asyncs = (content.match(ASYNC_RE) ?? []).length

  const meltingPoint = computeMeltingPoint(codeLines, functions + classes, anys, imports)
  const moldQuality = computeMoldQuality(exports, interfaces, types, functions + classes, jsdoc, codeLines.length)
  const castingPrecision = computeCastingPrecision(exports, functions + classes, anys, todos, codeLines.length)
  const alloyComposition = computeAlloyComposition(functions, classes, interfaces, types, asyncs, codeLines.length)
  const finishingQuality = computeFinishingQuality(jsdoc, anys, todos, codeLines)
  const structuralIntegrity = Math.round((moldQuality + castingPrecision + alloyComposition + finishingQuality) / 4)

  const qualityScore = structuralIntegrity

  const defects: Defects = {
    porosity: detectPorosity(content),
    slag: detectSlag(content),
    shrinkage: detectShrinkage(content),
    coldShuts: detectColdShuts(content),
    hotTears: detectHotTears(content),
    misruns: detectMisruns(content),
    inclusions: detectInclusions(content),
    surfaceDefects: detectSurfaceDefects(content),
  }

  const properties = computeMaterialProperties(exports, functions + classes, interfaces + types, imports, anys, codeLines.length)
  const metalType = classifyMetalType(properties)
  const castingMethod = classifyCastingMethod(content)
  const heatTreatment = classifyHeatTreatment({ qualityScore, defects })
  const grade = classifyGrade(qualityScore)

  const issues = detectIssues(defects, meltingPoint, moldQuality, finishingQuality)
  const strengths = detectStrengths(moldQuality, castingPrecision, finishingQuality, structuralIntegrity, jsdoc, anys)

  return {
    file: filePath,
    meltingPoint,
    moldQuality,
    castingPrecision,
    alloyComposition,
    finishingQuality,
    structuralIntegrity,
    metalType,
    castingMethod,
    defects,
    properties,
    heatTreatment,
    grade,
    weight: codeLines.length,
    qualityScore,
    issues,
    strengths,
  }
}

// ─── Metric Computations ─────────────────────────────────────────────────────

function computeMeltingPoint(codeLines: string[], constructs: number, anys: number, imports: number): number {
  if (codeLines.length === 0) return 0
  let score = 30
  const avgLen = codeLines.reduce((s, l) => s + l.length, 0) / codeLines.length
  if (avgLen > 100) score += 20
  else if (avgLen > 60) score += 10
  if (codeLines.length > 200) score += 15
  else if (codeLines.length > 50) score += 8
  if (constructs > 8) score += 10
  else if (constructs > 3) score += 5
  if (imports > 8) score += 10
  score -= anys * 5
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeMoldQuality(exports: number, interfaces: number, types: number, constructs: number, jsdoc: number, lines: number): number {
  if (lines === 0) return 0
  let score = 30
  score += Math.min(20, exports * 3)
  score += Math.min(15, (interfaces + types) * 4)
  score += Math.min(10, jsdoc * 3)
  if (constructs >= 1 && constructs <= 5) score += 15
  else if (constructs > 5 && constructs <= 10) score += 8
  if (interfaces > 0 && constructs > 0) score += 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeCastingPrecision(exports: number, constructs: number, anys: number, todos: number, lines: number): number {
  if (lines === 0) return 0
  let score = 40
  if (exports >= 1 && constructs >= 1) score += 20
  score -= anys * 10
  score -= todos * 8
  if (exports > 0 && constructs > 0 && constructs <= exports * 4) score += 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeAlloyComposition(functions: number, classes: number, interfaces: number, types: number, asyncs: number, lines: number): number {
  if (lines === 0) return 0
  let score = 35
  const paradigmCount = (functions > 0 ? 1 : 0) + (classes > 0 ? 1 : 0) + (interfaces > 0 ? 1 : 0) + (types > 0 ? 1 : 0) + (asyncs > 0 ? 1 : 0)
  score += paradigmCount * 10
  if (classes > 0 && interfaces > 0) score += 10
  if (asyncs > 0 && functions > 0) score += 5
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeFinishingQuality(jsdoc: number, anys: number, todos: number, codeLines: string[]): number {
  if (codeLines.length === 0) return 0
  let score = 45
  score += Math.min(20, jsdoc * 4)
  score -= anys * 10
  score -= todos * 8
  const longLines = codeLines.filter(l => l.length > 120).length
  if (longLines > 5) score -= 10
  else if (longLines > 0) score -= 3
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeMaterialProperties(
  exports: number, constructs: number, structural: number,
  imports: number, anys: number, lines: number,
): MaterialProperties {
  if (lines === 0) return { hardness: 0, ductility: 0, malleability: 0, toughness: 0, conductivity: 0, magnetism: 0 }

  const hardness = Math.min(100, Math.round(30 + constructs * 8 + (exports > 0 ? 15 : 0) - anys * 10))
  const ductility = Math.min(100, Math.round(35 + structural * 5 + (constructs > 0 && constructs <= 5 ? 15 : 0)))
  const malleability = Math.min(100, Math.round(40 + (anys === 0 ? 20 : 0) + (structural > 0 ? 15 : 0)))
  const toughness = Math.min(100, Math.round(35 + exports * 4 + (constructs > 0 ? 10 : 0) - anys * 8))
  const conductivity = Math.min(100, Math.round(30 + exports * 5 + (imports >= 1 && imports <= 5 ? 15 : 0)))
  const magnetism = Math.min(100, Math.round(imports * 8))

  return {
    hardness: Math.max(0, hardness),
    ductility: Math.max(0, ductility),
    malleability: Math.max(0, malleability),
    toughness: Math.max(0, toughness),
    conductivity: Math.max(0, conductivity),
    magnetism: Math.max(0, magnetism),
  }
}

function detectIssues(defects: Defects, meltingPoint: number, moldQuality: number, finishingQuality: number): string[] {
  const issues: string[] = []
  if (defects.porosity > 2) issues.push(`High porosity: ${defects.porosity} empty/gap areas`)
  if (defects.slag > 0) issues.push(`Slag inclusions: ${defects.slag} impurities detected`)
  if (defects.shrinkage > 0) issues.push(`Shrinkage: ${defects.shrinkage} incomplete implementations`)
  if (defects.coldShuts > 0) issues.push(`Cold shuts: ${defects.coldShuts} disconnected logic paths`)
  if (defects.hotTears > 0) issues.push(`Hot tears: ${defects.hotTears} stress cracks detected`)
  if (defects.misruns > 0) issues.push(`Misruns: ${defects.misruns} incomplete execution`)
  if (defects.inclusions > 0) issues.push(`Inclusions: ${defects.inclusions} foreign patterns`)
  if (defects.surfaceDefects > 0) issues.push(`Surface defects: ${defects.surfaceDefects} formatting issues`)
  if (meltingPoint > 75) issues.push('High melting point - complex to understand')
  if (moldQuality < 30) issues.push('Poor mold quality - weak structural patterns')
  if (finishingQuality < 30) issues.push('Poor finishing - needs cleanup and documentation')
  return issues
}

function detectStrengths(moldQuality: number, castingPrecision: number, finishingQuality: number, structuralIntegrity: number, jsdoc: number, anys: number): string[] {
  const strengths: string[] = []
  if (moldQuality >= 70) strengths.push('Excellent mold - well-structured patterns')
  if (castingPrecision >= 70) strengths.push('Precise casting - accurate implementation')
  if (finishingQuality >= 70) strengths.push('Fine finishing - polished and documented')
  if (structuralIntegrity >= 70) strengths.push('Strong structural integrity')
  if (jsdoc >= 2 && anys === 0) strengths.push('Premium finish - documented and type-safe')
  if (moldQuality >= 50 && castingPrecision >= 50 && finishingQuality >= 50) strengths.push('Balanced quality across all dimensions')
  return strengths
}

// ─── Batch Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a directory as a foundry batch
 * @example
 * analyzeFoundryBatch(pieces, 'src') // FoundryBatch
 */
export function analyzeFoundryBatch(pieces: CastPiece[], dirPath: string): FoundryBatch {
  if (pieces.length === 0) {
    return {
      directory: dirPath,
      pieces: [],
      batchQuality: 0,
      dominantMetal: 'lead',
      dominantMethod: 'hand-poured',
      avgDefects: 0,
      totalDefects: 0,
      aerospaceGrade: 0,
      scrapGrade: 0,
      heatTreatmentNeeded: 0,
      batchCondition: 'scrap-heap',
      foundryHealth: 0,
    }
  }

  const batchQuality = Math.round(pieces.reduce((s, p) => s + p.qualityScore, 0) / pieces.length)

  const metalCounts = new Map<string, number>()
  const methodCounts = new Map<string, number>()
  for (const p of pieces) {
    metalCounts.set(p.metalType, (metalCounts.get(p.metalType) ?? 0) + 1)
    methodCounts.set(p.castingMethod, (methodCounts.get(p.castingMethod) ?? 0) + 1)
  }
  let dominantMetal = 'lead'
  let maxMetal = 0
  for (const [metal, count] of metalCounts) {
    if (count > maxMetal) { maxMetal = count; dominantMetal = metal }
  }
  let dominantMethod = 'hand-poured'
  let maxMethod = 0
  for (const [method, count] of methodCounts) {
    if (count > maxMethod) { maxMethod = count; dominantMethod = method }
  }

  const totalDefects = pieces.reduce((s, p) => {
    const d = p.defects
    return s + d.porosity + d.slag + d.shrinkage + d.coldShuts + d.hotTears + d.misruns + d.inclusions + d.surfaceDefects
  }, 0)
  const avgDefects = Math.round(totalDefects / pieces.length)

  const aerospaceGrade = pieces.filter(p => p.grade === 'aerospace').length
  const scrapGrade = pieces.filter(p => p.grade === 'scrap' || p.grade === 'slag').length
  const heatTreatmentNeeded = pieces.filter(p => p.heatTreatment === 'untreated' || p.heatTreatment === 'quenched').length

  const batchCondition = classifyBatchCondition(batchQuality, avgDefects)
  const foundryHealth = Math.max(0, Math.min(100, batchQuality - avgDefects * 3))

  return {
    directory: dirPath,
    pieces,
    batchQuality,
    dominantMetal,
    dominantMethod,
    avgDefects,
    totalDefects,
    aerospaceGrade,
    scrapGrade,
    heatTreatmentNeeded,
    batchCondition,
    foundryHealth,
  }
}

function classifyBatchCondition(batchQuality: number, avgDefects: number): FoundryBatch['batchCondition'] {
  if (batchQuality >= 75 && avgDefects <= 1) return 'premium'
  if (batchQuality >= 55 && avgDefects <= 3) return 'standard'
  if (batchQuality >= 35) return 'economy'
  if (batchQuality >= 20) return 'reject'
  return 'scrap-heap'
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations for improving foundry quality
 * @example
 * generateFoundryRecommendations(pieces, batches, stats) // string[]
 */
export function generateFoundryRecommendations(
  pieces: CastPiece[],
  batches: FoundryBatch[],
  stats: FoundryStats,
): string[] {
  const recs: string[] = []

  if (stats.scrapGrade > 0) recs.push(`${stats.scrapGrade} scrap-grade piece(s) need major rework or removal`)
  if (stats.totalPorosity > 5) recs.push(`Fill ${stats.totalPorosity} porosity gaps - remove empty blocks`)
  if (stats.totalSlag > 0) recs.push(`Remove ${stats.totalSlag} slag inclusion(s) - clean up impurities`)
  if (stats.totalShrinkage > 0) recs.push(`Complete ${stats.totalShrinkage} shrinkage area(s) - resolve TODOs`)
  if (stats.totalHotTears > 0) recs.push(`Repair ${stats.totalHotTears} hot tear(s) - fix loose equality and stress patterns`)
  if (stats.totalColdShuts > 0) recs.push(`Reconnect ${stats.totalColdShuts} cold shut(s) - fix disconnected logic`)
  if (stats.totalMisruns > 0) recs.push(`Complete ${stats.totalMisruns} misrun(s) - finish half-implemented features`)
  if (stats.totalInclusions > 0) recs.push(`Filter ${stats.totalInclusions} inclusion(s) - remove foreign patterns`)
  if (stats.avgFinishingQuality < 40) recs.push('Improve finishing quality - add documentation and remove any types')
  if (stats.avgMoldQuality < 40) recs.push('Improve mold quality - strengthen structural patterns')
  if (stats.leadFiles > pieces.length * 0.3) recs.push('Too many low-grade pieces - consider code review')

  const badBatches = batches.filter(b => b.batchCondition === 'reject' || b.batchCondition === 'scrap-heap')
  if (badBatches.length > 0) recs.push(`${badBatches.length} batch(es) in poor condition need attention`)

  if (recs.length === 0) recs.push('World-class foundry output - all pieces meet quality standards')
  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete foundry analysis result
 * @example
 * buildFoundryResult(files, contents, {}) // FoundryResult
 */
export function buildFoundryResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): FoundryResult {
  const pieces: CastPiece[] = []
  for (let i = 0; i < files.length; i++) {
    pieces.push(analyzeCastPiece(contents[i] ?? '',files[i] ?? ''))
  }

  const dirMap = new Map<string, CastPiece[]>()
  for (const piece of pieces) {
    const normalized = piece.file.replace(/\\/g, '/')
    const dir = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) existing.push(piece)
    else dirMap.set(dir, [piece])
  }

  const batches: FoundryBatch[] = []
  for (const [dir, dirPieces] of dirMap) {
    batches.push(analyzeFoundryBatch(dirPieces, dir))
  }

  const stats = computeFoundryStats(pieces, batches)
  const recommendations = generateFoundryRecommendations(pieces, batches, stats)

  return { pieces, batches, stats, recommendations }
}

function computeFoundryStats(pieces: CastPiece[], batches: FoundryBatch[]): FoundryStats {
  const totalFiles = pieces.length
  const totalBatches = batches.length

  const avgMeltingPoint = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.meltingPoint, 0) / totalFiles) : 0
  const avgMoldQuality = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.moldQuality, 0) / totalFiles) : 0
  const avgCastingPrecision = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.castingPrecision, 0) / totalFiles) : 0
  const avgFinishingQuality = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.finishingQuality, 0) / totalFiles) : 0
  const avgStructuralIntegrity = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.structuralIntegrity, 0) / totalFiles) : 0

  const titaniumFiles = pieces.filter(p => p.metalType === 'titanium').length
  const steelFiles = pieces.filter(p => p.metalType === 'steel').length
  const leadFiles = pieces.filter(p => p.metalType === 'lead').length

  const aerospaceGrade = pieces.filter(p => p.grade === 'aerospace').length
  const industrialGrade = pieces.filter(p => p.grade === 'industrial').length
  const commercialGrade = pieces.filter(p => p.grade === 'commercial').length
  const scrapGrade = pieces.filter(p => p.grade === 'scrap' || p.grade === 'slag').length

  const totalPorosity = pieces.reduce((s, p) => s + p.defects.porosity, 0)
  const totalSlag = pieces.reduce((s, p) => s + p.defects.slag, 0)
  const totalShrinkage = pieces.reduce((s, p) => s + p.defects.shrinkage, 0)
  const totalColdShuts = pieces.reduce((s, p) => s + p.defects.coldShuts, 0)
  const totalHotTears = pieces.reduce((s, p) => s + p.defects.hotTears, 0)
  const totalMisruns = pieces.reduce((s, p) => s + p.defects.misruns, 0)
  const totalInclusions = pieces.reduce((s, p) => s + p.defects.inclusions, 0)
  const totalSurfaceDefects = pieces.reduce((s, p) => s + p.defects.surfaceDefects, 0)

  const avgHardness = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.properties.hardness, 0) / totalFiles) : 0
  const avgDuctility = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.properties.ductility, 0) / totalFiles) : 0
  const avgMalleability = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.properties.malleability, 0) / totalFiles) : 0
  const avgToughness = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.properties.toughness, 0) / totalFiles) : 0

  const overallQuality = totalFiles > 0 ? Math.round(pieces.reduce((s, p) => s + p.qualityScore, 0) / totalFiles) : 0
  const foundryGrade = classifyFoundryGrade(overallQuality)

  const sortedByQuality = [...pieces].sort((a, b) => b.qualityScore - a.qualityScore)
  const bestPiece = sortedByQuality.length > 0 ? sortedByQuality[0]?.file : 'none'
  const worstPiece = sortedByQuality.length > 0 ? sortedByQuality[sortedByQuality.length - 1]?.file : 'none'

  const sortedByWeight = [...pieces].sort((a, b) => b.weight - a.weight)
  const heaviestPiece = sortedByWeight.length > 0 ? sortedByWeight[0]?.file : 'none'
  const lightestPiece = sortedByWeight.length > 0 ? sortedByWeight[sortedByWeight.length - 1]?.file : 'none'

  return {
    totalFiles,
    totalBatches,
    avgMeltingPoint,
    avgMoldQuality,
    avgCastingPrecision,
    avgFinishingQuality,
    avgStructuralIntegrity,
    titaniumFiles,
    steelFiles,
    leadFiles,
    aerospaceGrade,
    industrialGrade,
    commercialGrade,
    scrapGrade,
    totalPorosity,
    totalSlag,
    totalShrinkage,
    totalColdShuts,
    totalHotTears,
    totalMisruns,
    totalInclusions,
    totalSurfaceDefects,
    avgHardness,
    avgDuctility,
    avgMalleability,
    avgToughness,
    overallQuality,
    foundryGrade,
    bestPiece: bestPiece ?? '',
    worstPiece: worstPiece ?? '',
    heaviestPiece: heaviestPiece ?? '',
    lightestPiece: lightestPiece ?? '',
  }
}
