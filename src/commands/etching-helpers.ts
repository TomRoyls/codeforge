// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface GrooveMetrics {
  depth: number
  width: number
  angle: number
}

export interface LineTypeCounts {
  bold: number
  fine: number
  rough: number
  overworked: number
  feathered: number
}

export interface BlemishCounts {
  burrs: number
  scratches: number
  plateWear: number
  acidSpots: number
  ghosting: number
}

export interface EngravingLine {
  file: string
  linePrecision: number
  depthControl: number
  plateQuality: number
  crossHatching: number
  burinWork: number
  lineCount: number
  avgLineLength: number
  lineVariance: number
  etchingDensity: number
  groove: GrooveMetrics
  plateType: 'copper' | 'steel' | 'zinc' | 'wood' | 'stone' | 'plastic'
  etchingStyle: 'burin' | 'drypoint' | 'etching' | 'aquatint' | 'mezzotint' | 'lithograph'
  craftsmanship: 'master' | 'journeyman' | 'apprentice' | 'novice' | 'amateur'
  lines: LineTypeCounts
  blemishes: BlemishCounts
  strengths: string[]
  weaknesses: string[]
}

export interface EtchingPlate {
  directory: string
  engravings: EngravingLine[]
  plateCondition: 'pristine' | 'good' | 'fair' | 'worn' | 'damaged' | 'corroded'
  avgPrecision: number
  avgDepthControl: number
  avgCraftsmanship: number
  dominantStyle: string
  masterEngravings: number
  amateurEngravings: number
  totalBlemishes: number
  totalBurrs: number
  totalScratches: number
  totalAcidSpots: number
  totalGhosting: number
  edition: 'original' | 'first-print' | 'reprint' | 'copy' | 'forgery'
  overallQuality: number
}

export interface EtchingStats {
  totalFiles: number
  totalPlates: number
  avgLinePrecision: number
  avgDepthControl: number
  avgPlateQuality: number
  avgCrossHatching: number
  avgBurinWork: number
  masterCraftsman: number
  journeymanCraftsman: number
  apprenticeCraftsman: number
  noviceCraftsman: number
  amateurCraftsman: number
  totalBoldLines: number
  totalFineLines: number
  totalRoughLines: number
  totalOverworkedLines: number
  totalFeatheredLines: number
  totalBurrs: number
  totalScratches: number
  totalAcidSpots: number
  totalGhosting: number
  overallPrecision: number
  craftsmanshipGrade: 'grand-master' | 'master' | 'journeyman' | 'apprentice' | 'novice' | 'amateur'
  bestEngraving: string
  worstEngraving: string
  dominantStyle: string
  dominantPlate: string
}

export interface EtchingResult {
  engravings: EngravingLine[]
  plates: EtchingPlate[]
  stats: EtchingStats
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

// ─── Blemish Detection ──────────────────────────────────────────────────────

/**
 * Detect burrs - rough edges from inconsistent patterns
 * @example
 * detectBurrs('try { } catch(e) { }') // 0
 */
export function detectBurrs(content: string): number {
  let count = 0
  const hasTry = content.includes('try')
  const hasCatch = content.includes('catch')
  if (hasTry && !hasCatch) count++
  if (!hasTry && hasCatch) count++
  const switchMatches = content.match(/switch\s*\(/g)
  if (switchMatches) {
    const defaultMatches = content.match(/default:/g)
    if (!defaultMatches || defaultMatches.length < switchMatches.length) count++
  }
  if (content.includes('==') && !content.includes('===')) count++
  if (content.includes('!=') && !content.includes('!==')) count++
  return count
}

/**
 * Detect scratches - unintended marks from leftover code
 * @example
 * detectScratches('console.log("debug")') // 1
 */
export function detectScratches(content: string): number {
  let count = 0
  const consoleMatches = content.match(CONSOLE_RE)
  if (consoleMatches) count += consoleMatches.length
  const debuggerMatch = content.match(/\bdebugger\b/)
  if (debuggerMatch) count++
  if (content.match(/\bvar\b/)) count++
  return count
}

/**
 * Detect acid spots - tech debt markers
 * @example
 * detectAcidSpots('// TODO fix this') // 1
 */
export function detectAcidSpots(content: string): number {
  const matches = content.match(TODO_RE)
  return matches ? matches.length : 0
}

/**
 * Detect ghosting - dead/unused code
 * @example
 * detectGhosting('import { unused } from "lib"') // 0
 */
export function detectGhosting(content: string): number {
  let count = 0
  const emptyBlocks = content.match(EMPTY_BLOCK_RE)
  if (emptyBlocks) count += emptyBlocks.length
  const imports = content.match(IMPORT_RE)
  if (imports && imports.length > 8) count += imports.length - 8
  return count
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify plate type based on content characteristics
 * @example
 * classifyPlateType('export interface Config { readonly name: string }') // 'copper'
 */
export function classifyPlateType(content: string): EngravingLine['plateType'] {
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const structural = interfaces + types

  if (structural >= 3 && functions <= 2) return 'copper'
  if (classes >= 2 && structural >= 1) return 'steel'
  if (functions >= 3 && structural === 0) return 'zinc'
  if (content.includes('export') && content.includes('import') && functions <= 1) return 'stone'
  if (structural > 0 || classes > 0) return 'wood'
  return 'plastic'
}

/**
 * Classify etching style based on code approach
 * @example
 * classifyEtchingStyle('export function add(a: number, b: number) { return a + b }') // 'burin'
 */
export function classifyEtchingStyle(content: string): EngravingLine['etchingStyle'] {
  const exports = (content.match(EXPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length

  if (jsdoc >= 2 && anys === 0 && exports >= 2) return 'burin'
  if (functions >= 3 && classes === 0) return 'drypoint'
  if (classes >= 1 && functions >= 2) return 'etching'
  if (jsdoc >= 1 && anys === 0) return 'aquatint'
  if (exports >= 1 && functions + classes >= 1) return 'mezzotint'
  return 'lithograph'
}

/**
 * Classify craftsmanship from average precision score
 * @example
 * classifyCraftsmanship(85) // 'master'
 */
export function classifyCraftsmanship(avgPrecision: number): EngravingLine['craftsmanship'] {
  if (avgPrecision >= 80) return 'master'
  if (avgPrecision >= 60) return 'journeyman'
  if (avgPrecision >= 40) return 'apprentice'
  if (avgPrecision >= 20) return 'novice'
  return 'amateur'
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as an engraving line
 * @example
 * analyzeEngravingLine('export function add(a: number, b: number) { return a + b }', 'math.ts') // EngravingLine
 */
export function analyzeEngravingLine(content: string, filePath: string): EngravingLine {
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
  const nestedTernary = NESTED_TERNARY_RE.test(content) ? 1 : 0

  const linePrecision = computeLinePrecision(codeLines, exports, anys, todos)
  const depthControl = computeDepthControl(imports, interfaces + types, codeLines.length)
  const plateQuality = computePlateQuality(interfaces, types, classes, exports, codeLines.length)
  const crossHatching = computeCrossHatching(functions, classes, interfaces, codeLines.length)
  const burinWork = computeBurinWork(jsdoc, anys, exports, functions + classes)

  const lineLengths = codeLines.map(l => l.length)
  const lineCount = codeLines.length
  const avgLineLength = lineCount > 0 ? Math.round(lineLengths.reduce((s, l) => s + l, 0) / lineCount) : 0
  const lineVariance = computeVariance(lineLengths)
  const etchingDensity = computeDensity(content, lineCount)

  const groove = computeGroove(imports, interfaces + types, functions + classes, depthControl)
  const plateType = classifyPlateType(content)
  const etchingStyle = classifyEtchingStyle(content)
  const craftsmanship = classifyCraftsmanship(linePrecision)

  const lineTypes = countLineTypes(codeLines, linePrecision, avgLineLength)
  const blemishes = countBlemishes(content)

  const strengths = identifyStrengths(linePrecision, depthControl, plateQuality, burinWork, jsdoc, anys, todos)
  const weaknesses = identifyWeaknesses(linePrecision, depthControl, anys, todos, nestedTernary, blemishes)

  return {
    file: filePath,
    linePrecision,
    depthControl,
    plateQuality,
    crossHatching,
    burinWork,
    lineCount,
    avgLineLength,
    lineVariance,
    etchingDensity,
    groove,
    plateType,
    etchingStyle,
    craftsmanship,
    lines: lineTypes,
    blemishes,
    strengths,
    weaknesses,
  }
}

// ─── Metric Computations ─────────────────────────────────────────────────────

function computeLinePrecision(codeLines: string[], exports: number, anys: number, todos: number): number {
  if (codeLines.length === 0) return 0
  let score = 40
  score += Math.min(20, exports * 3)
  score -= anys * 10
  score -= todos * 8
  const avgLen = codeLines.reduce((s, l) => s + l.length, 0) / codeLines.length
  if (avgLen > 120) score -= 10
  else if (avgLen > 80) score -= 5
  if (avgLen < 30 && avgLen > 0) score += 5
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeDepthControl(imports: number, structural: number, lines: number): number {
  if (lines === 0) return 0
  let score = 50
  if (imports >= 1 && imports <= 5) score += 15
  else if (imports > 5 && imports <= 10) score += 5
  else if (imports > 10) score -= 10
  if (structural >= 1) score += 15
  else score -= 5
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computePlateQuality(interfaces: number, types: number, classes: number, exports: number, lines: number): number {
  if (lines === 0) return 0
  let score = 30
  score += Math.min(25, (interfaces + types) * 5)
  score += Math.min(15, classes * 3)
  score += Math.min(15, exports * 2)
  if (interfaces > 0 && classes > 0) score += 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeCrossHatching(functions: number, classes: number, interfaces: number, lines: number): number {
  if (lines === 0) return 0
  const constructs = functions + classes
  let score = 40
  if (constructs >= 1 && constructs <= 5) score += 25
  else if (constructs >= 6 && constructs <= 10) score += 15
  else if (constructs > 10) score -= 5
  if (interfaces > 0 && constructs > 0) score += 15
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeBurinWork(jsdoc: number, anys: number, exports: number, constructs: number): number {
  if (constructs === 0) return 20
  let score = 40
  score += Math.min(25, jsdoc * 5)
  score -= anys * 12
  if (exports > 0 && constructs > 0) {
    const ratio = exports / constructs
    if (ratio >= 0.5) score += 15
    else if (ratio >= 0.2) score += 5
  }
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeVariance(lengths: number[]): number {
  if (lengths.length === 0) return 0
  const avg = lengths.reduce((s, l) => s + l, 0) / lengths.length
  const variance = lengths.reduce((s, l) => s + Math.pow(l - avg, 2), 0) / lengths.length
  return Math.round(Math.sqrt(variance))
}

function computeDensity(content: string, lineCount: number): number {
  if (lineCount === 0) return 0
  const nonWhitespace = content.replace(/\s/g, '').length
  return Math.min(100, Math.round((nonWhitespace / (content.length || 1)) * 100))
}

function computeGroove(imports: number, structural: number, constructs: number, depthControl: number): GrooveMetrics {
  const depth = Math.min(100, imports * 8 + structural * 5)
  const width = Math.min(100, constructs * 10 + (imports > 0 ? 15 : 0))
  const angle = depthControl >= 60 ? 75 : depthControl >= 40 ? 45 : 15
  return { depth: Math.round(depth), width: Math.round(width), angle }
}

function countLineTypes(codeLines: string[], precision: number, avgLen: number): LineTypeCounts {
  let bold = 0
  let fine = 0
  let rough = 0
  let overworked = 0
  let feathered = 0

  for (const line of codeLines) {
    const len = line.trim().length
    if (len === 0) continue
    if (len > 120) overworked++
    else if (len > 80) rough++
    else if (len < 20) fine++
    else if (precision >= 70) bold++
    else feathered++
  }

  return { bold, fine, rough, overworked, feathered }
}

function countBlemishes(content: string): BlemishCounts {
  return {
    burrs: detectBurrs(content),
    scratches: detectScratches(content),
    plateWear: Math.floor((content.match(/\n/g) ?? []).length / 50),
    acidSpots: detectAcidSpots(content),
    ghosting: detectGhosting(content),
  }
}

function identifyStrengths(
  precision: number, depth: number, quality: number, burin: number,
  jsdoc: number, anys: number, todos: number,
): string[] {
  const strengths: string[] = []
  if (precision >= 70) strengths.push('Clean, purposeful line work')
  if (depth >= 70) strengths.push('Well-controlled abstraction depth')
  if (quality >= 70) strengths.push('Strong structural foundation')
  if (burin >= 70) strengths.push('Sharp, clear definitions')
  if (jsdoc >= 2) strengths.push('Well-documented engravings')
  if (anys === 0 && todos === 0) strengths.push('No blemishes detected')
  return strengths
}

function identifyWeaknesses(
  precision: number, depth: number, anys: number, todos: number,
  nestedTernary: number, blemishes: BlemishCounts,
): string[] {
  const weaknesses: string[] = []
  if (precision < 30) weaknesses.push('Imprecise, wasteful lines')
  if (depth < 30) weaknesses.push('Poor abstraction control')
  if (anys > 0) weaknesses.push('Blurred type definitions')
  if (todos > 0) weaknesses.push('Unfinished engraving marks')
  if (nestedTernary > 0) weaknesses.push('Overworked nested expressions')
  if (blemishes.burrs > 2) weaknesses.push('Excessive rough edges')
  if (blemishes.ghosting > 1) weaknesses.push('Ghost marks from dead code')
  return weaknesses
}

// ─── Plate Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a directory as an etching plate
 * @example
 * analyzeEtchingPlate(engravings, 'src') // EtchingPlate
 */
export function analyzeEtchingPlate(engravings: EngravingLine[], dirPath: string): EtchingPlate {
  if (engravings.length === 0) {
    return {
      directory: dirPath, engravings: [],
      plateCondition: 'corroded',
      avgPrecision: 0, avgDepthControl: 0, avgCraftsmanship: 0,
      dominantStyle: 'lithograph',
      masterEngravings: 0, amateurEngravings: 0,
      totalBlemishes: 0, totalBurrs: 0, totalScratches: 0,
      totalAcidSpots: 0, totalGhosting: 0,
      edition: 'forgery', overallQuality: 0,
    }
  }

  const avgPrecision = Math.round(engravings.reduce((s, e) => s + e.linePrecision, 0) / engravings.length)
  const avgDepthControl = Math.round(engravings.reduce((s, e) => s + e.depthControl, 0) / engravings.length)
  const avgCraftsmanship = Math.round(engravings.reduce((s, e) => s + e.linePrecision, 0) / engravings.length)

  const styleCounts = new Map<string, number>()
  for (const e of engravings) {
    styleCounts.set(e.etchingStyle, (styleCounts.get(e.etchingStyle) ?? 0) + 1)
  }
  let dominantStyle = 'lithograph'
  let maxStyle = 0
  for (const [style, count] of styleCounts) {
    if (count > maxStyle) { maxStyle = count; dominantStyle = style }
  }

  const masterEngravings = engravings.filter(e => e.craftsmanship === 'master').length
  const amateurEngravings = engravings.filter(e => e.craftsmanship === 'amateur').length

  const totalBurrs = engravings.reduce((s, e) => s + e.blemishes.burrs, 0)
  const totalScratches = engravings.reduce((s, e) => s + e.blemishes.scratches, 0)
  const totalAcidSpots = engravings.reduce((s, e) => s + e.blemishes.acidSpots, 0)
  const totalGhosting = engravings.reduce((s, e) => s + e.blemishes.ghosting, 0)
  const totalBlemishes = totalBurrs + totalScratches + totalAcidSpots + totalGhosting

  const overallQuality = Math.round((avgPrecision + avgDepthControl + avgCraftsmanship) / 3)
  const plateCondition = classifyPlateCondition(avgPrecision, totalBlemishes)
  const edition = classifyEdition(avgPrecision, masterEngravings, amateurEngravings)

  return {
    directory: dirPath,
    engravings,
    plateCondition,
    avgPrecision,
    avgDepthControl,
    avgCraftsmanship,
    dominantStyle,
    masterEngravings,
    amateurEngravings,
    totalBlemishes,
    totalBurrs,
    totalScratches,
    totalAcidSpots,
    totalGhosting,
    edition,
    overallQuality,
  }
}

function classifyPlateCondition(avgPrecision: number, totalBlemishes: number): EtchingPlate['plateCondition'] {
  if (avgPrecision >= 75 && totalBlemishes === 0) return 'pristine'
  if (avgPrecision >= 60 && totalBlemishes <= 2) return 'good'
  if (avgPrecision >= 40 && totalBlemishes <= 5) return 'fair'
  if (avgPrecision >= 25) return 'worn'
  if (avgPrecision >= 10) return 'damaged'
  return 'corroded'
}

function classifyEdition(avgPrecision: number, masters: number, amateurs: number): EtchingPlate['edition'] {
  if (avgPrecision >= 80 && amateurs === 0) return 'original'
  if (avgPrecision >= 60 && masters > amateurs) return 'first-print'
  if (avgPrecision >= 40) return 'reprint'
  if (avgPrecision >= 20) return 'copy'
  return 'forgery'
}

// ─── Grade ───────────────────────────────────────────────────────────────────

/**
 * Compute overall craftsmanship grade from precision score
 * @example
 * classifyOverallGrade(90) // 'grand-master'
 */
export function classifyOverallGrade(avgPrecision: number): EtchingStats['craftsmanshipGrade'] {
  if (avgPrecision >= 85) return 'grand-master'
  if (avgPrecision >= 70) return 'master'
  if (avgPrecision >= 50) return 'journeyman'
  if (avgPrecision >= 30) return 'apprentice'
  if (avgPrecision >= 15) return 'novice'
  return 'amateur'
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations for improving code craftsmanship
 * @example
 * generateEtchingRecommendations(engravings, plates, stats) // string[]
 */
export function generateEtchingRecommendations(
  _engravings: EngravingLine[],
  _plates: EtchingPlate[],
  stats: EtchingStats,
): string[] {
  const recs: string[] = []

  if (stats.amateurCraftsman > 0) recs.push(`${stats.amateurCraftsman} amateur engraving(s) need major rework`)
  if (stats.noviceCraftsman > 0) recs.push(`${stats.noviceCraftsman} novice file(s) could benefit from stronger typing`)
  if (stats.totalAcidSpots > 0) recs.push(`Clean ${stats.totalAcidSpots} acid spot(s) (TODO/FIXME/HACK markers)`)
  if (stats.totalBurrs > 3) recs.push(`Smooth ${stats.totalBurrs} burr(s) - fix inconsistent patterns`)
  if (stats.totalScratches > 0) recs.push(`Polish ${stats.totalScratches} scratch(es) - remove debug/leftover code`)
  if (stats.totalGhosting > 2) recs.push(`Erase ${stats.totalGhosting} ghost mark(s) - remove dead code`)
  if (stats.avgBurinWork < 40) recs.push('Sharpen definitions - add JSDoc and remove any types')
  if (stats.avgLinePrecision < 40) recs.push('Improve line precision - remove wasted code and tighten logic')
  if (stats.totalOverworkedLines > 10) recs.push('Shorten overworked lines - break long statements into smaller pieces')

  if (recs.length === 0) recs.push('Master craftsmanship achieved - engravings are clean and precise')
  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete etching analysis result
 * @example
 * buildEtchingResult(files, contents, {}) // EtchingResult
 */
export function buildEtchingResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): EtchingResult {
  const engravings: EngravingLine[] = []
  for (let i = 0; i < files.length; i++) {
    engravings.push(analyzeEngravingLine(contents[i], files[i]))
  }

  const dirMap = new Map<string, EngravingLine[]>()
  for (const eng of engravings) {
    const normalized = eng.file.replace(/\\/g, '/')
    const dir = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) existing.push(eng)
    else dirMap.set(dir, [eng])
  }

  const plates: EtchingPlate[] = []
  for (const [dir, dirEngravings] of dirMap) {
    plates.push(analyzeEtchingPlate(dirEngravings, dir))
  }

  const stats = computeStats(engravings, plates)
  const recommendations = generateEtchingRecommendations(engravings, plates, stats)

  return { engravings, plates, stats, recommendations }
}

function computeStats(engravings: EngravingLine[], plates: EtchingPlate[]): EtchingStats {
  const totalFiles = engravings.length
  const totalPlates = plates.length

  const avgLinePrecision = totalFiles > 0 ? Math.round(engravings.reduce((s, e) => s + e.linePrecision, 0) / totalFiles) : 0
  const avgDepthControl = totalFiles > 0 ? Math.round(engravings.reduce((s, e) => s + e.depthControl, 0) / totalFiles) : 0
  const avgPlateQuality = totalFiles > 0 ? Math.round(engravings.reduce((s, e) => s + e.plateQuality, 0) / totalFiles) : 0
  const avgCrossHatching = totalFiles > 0 ? Math.round(engravings.reduce((s, e) => s + e.crossHatching, 0) / totalFiles) : 0
  const avgBurinWork = totalFiles > 0 ? Math.round(engravings.reduce((s, e) => s + e.burinWork, 0) / totalFiles) : 0

  const masterCraftsman = engravings.filter(e => e.craftsmanship === 'master').length
  const journeymanCraftsman = engravings.filter(e => e.craftsmanship === 'journeyman').length
  const apprenticeCraftsman = engravings.filter(e => e.craftsmanship === 'apprentice').length
  const noviceCraftsman = engravings.filter(e => e.craftsmanship === 'novice').length
  const amateurCraftsman = engravings.filter(e => e.craftsmanship === 'amateur').length

  const totalBoldLines = engravings.reduce((s, e) => s + e.lines.bold, 0)
  const totalFineLines = engravings.reduce((s, e) => s + e.lines.fine, 0)
  const totalRoughLines = engravings.reduce((s, e) => s + e.lines.rough, 0)
  const totalOverworkedLines = engravings.reduce((s, e) => s + e.lines.overworked, 0)
  const totalFeatheredLines = engravings.reduce((s, e) => s + e.lines.feathered, 0)

  const totalBurrs = engravings.reduce((s, e) => s + e.blemishes.burrs, 0)
  const totalScratches = engravings.reduce((s, e) => s + e.blemishes.scratches, 0)
  const totalAcidSpots = engravings.reduce((s, e) => s + e.blemishes.acidSpots, 0)
  const totalGhosting = engravings.reduce((s, e) => s + e.blemishes.ghosting, 0)

  const overallPrecision = avgLinePrecision
  const craftsmanshipGrade = classifyOverallGrade(avgLinePrecision)

  const sorted = [...engravings].sort((a, b) => b.linePrecision - a.linePrecision)
  const bestEngraving = sorted.length > 0 ? sorted[0].file : 'none'
  const worstEngraving = sorted.length > 0 ? sorted[sorted.length - 1].file : 'none'

  const styleCounts = new Map<string, number>()
  for (const e of engravings) {
    styleCounts.set(e.etchingStyle, (styleCounts.get(e.etchingStyle) ?? 0) + 1)
  }
  let dominantStyle = 'lithograph'
  let maxStyle = 0
  for (const [style, count] of styleCounts) {
    if (count > maxStyle) { maxStyle = count; dominantStyle = style }
  }

  const plateTypeCounts = new Map<string, number>()
  for (const e of engravings) {
    plateTypeCounts.set(e.plateType, (plateTypeCounts.get(e.plateType) ?? 0) + 1)
  }
  let dominantPlate = 'plastic'
  let maxPlate = 0
  for (const [plate, count] of plateTypeCounts) {
    if (count > maxPlate) { maxPlate = count; dominantPlate = plate }
  }

  return {
    totalFiles,
    totalPlates,
    avgLinePrecision,
    avgDepthControl,
    avgPlateQuality,
    avgCrossHatching,
    avgBurinWork,
    masterCraftsman,
    journeymanCraftsman,
    apprenticeCraftsman,
    noviceCraftsman,
    amateurCraftsman,
    totalBoldLines,
    totalFineLines,
    totalRoughLines,
    totalOverworkedLines,
    totalFeatheredLines,
    totalBurrs,
    totalScratches,
    totalAcidSpots,
    totalGhosting,
    overallPrecision,
    craftsmanshipGrade,
    bestEngraving,
    worstEngraving,
    dominantStyle,
    dominantPlate,
  }
}
