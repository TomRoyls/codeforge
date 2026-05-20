// ─── Types ─────────────────────────────────────────────────────────────────────

export type ZoomLevelName = 'macro' | 'meso' | 'micro' | 'nano'
export type FindingCategory = 'structure' | 'pattern' | 'quality' | 'risk' | 'insight'
export type FindingSeverity = 'info' | 'notable' | 'important' | 'critical'
export type FileClassification = 'crystal' | 'focused' | 'multi-focal' | 'blurry' | 'opaque'
export type TelescopeGrade = 'hubble' | 'observatory' | 'binoculars' | 'magnifying-glass' | 'naked-eye'

export interface ZoomFinding {
  level: ZoomLevelName
  file: string
  category: FindingCategory
  description: string
  severity: FindingSeverity
  onlyVisibleAt: ZoomLevelName
}

export interface ZoomLevel {
  level: ZoomLevelName
  description: string
  clarity: number
  visiblePatterns: string[]
  blurryAreas: string[]
  findings: ZoomFinding[]
}

export interface FocalDepth {
  file: string
  depthRequired: number
  macroView: string
  mesoView: string
  microView: string
  nanoView: string
  clarity: number
  focusScore: number
  classification: FileClassification
}

export interface FocusReport {
  file: string
  zoomLevels: ZoomLevel[]
  focalDepth: FocalDepth
  bestZoomLevel: ZoomLevelName
  worstZoomLevel: ZoomLevelName
}

export interface TelescopeLensStats {
  totalReports: number
  avgClarity: number
  avgDepthRequired: number
  avgFocusScore: number
  crystalFiles: number
  opaqueFiles: number
  macroClarity: number
  mesoClarity: number
  microClarity: number
  nanoClarity: number
  findingsPerLevel: Record<string, number>
  criticalFindings: number
  bestOverallLevel: ZoomLevelName
  worstOverallLevel: ZoomLevelName
  overallFocus: number
  telescopeGrade: TelescopeGrade
}

export interface TelescopeLensResult {
  reports: FocusReport[]
  globalZoom: ZoomLevel[]
  stats: TelescopeLensStats
  recommendations: string[]
}

// ─── Internal Helpers ──────────────────────────────────────────────────────────

/**
 * Count exports in content
 * @example
 * countExports('export const x = 1; export function f() {}') // 2
 */
function countExports(content: string): number {
  return (content.match(/export\s+/g) || []).length
}

/**
 * Count functions in content
 * @example
 * countFns('function foo() {} const bar = () => {}') // 2
 */
function countFns(content: string): number {
  const named = (content.match(/function\s+\w+/g) || []).length
  const arrow = (content.match(/=>\s*[{(]/g) || []).length
  return named + arrow
}

/**
 * Count classes in content
 * @example
 * countClasses('class A {} class B {}') // 2
 */
function countClasses(content: string): number {
  return (content.match(/class\s+\w+/g) || []).length
}

/**
 * Count interfaces in content
 * @example
 * countIfaces('interface Config {}') // 1
 */
function countIfaces(content: string): number {
  return (content.match(/interface\s+\w+/g) || []).length
}

/**
 * Count import statements
 * @example
 * countImports('import { x } from "a"') // 1
 */
function countImports(content: string): number {
  return (content.match(/import\s+/g) || []).length
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
 * countTypeAnnotations(': number') // 1
 */
function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*\w+/g) || []).length
}

/**
 * Count comment lines
 * @example
 * countComments('// hello') // 1
 */
function countComments(content: string): number {
  return (content.match(/\/\/.*$/gm) || []).length
}

// ─── Macro Analysis ────────────────────────────────────────────────────────────

/**
 * Analyze at macro (project) zoom level
 * @example
 * analyzeMacro(['a.ts'], ['export const x = 1']) // ZoomLevel
 */
export function analyzeMacro(files: string[], contents: string[]): ZoomLevel {
  const findings: ZoomFinding[] = []
  const visiblePatterns: string[] = []
  const blurryAreas: string[] = []

  const dirs = Array.from(new Set(files.map(f => {
    const parts = f.split('/')
    return parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
  })))
  const dirCount = dirs.length
  visiblePatterns.push(`${dirCount} director${dirCount === 1 ? 'y' : 'ies'}`)

  const totalExports = contents.reduce((s, c) => s + countExports(c), 0)
  const totalImports = contents.reduce((s, c) => s + countImports(c), 0)
  if (totalExports > 0) visiblePatterns.push(`${totalExports} exports across codebase`)
  if (totalImports > 0) visiblePatterns.push(`${totalImports} imports across codebase`)

  if (files.length > 50) {
    blurryAreas.push('Large codebase — fine details obscured at macro level')
    findings.push({
      level: 'macro', file: '*', category: 'structure', severity: 'info',
      description: 'Large codebase requires meso/micro zoom for details',
      onlyVisibleAt: 'macro',
    })
  }

  if (files.length > 0 && totalExports === 0) {
    blurryAreas.push('No exports detected — module boundaries unclear')
    findings.push({
      level: 'macro', file: '*', category: 'risk', severity: 'important',
      description: 'No exports found — may lack clear module interfaces',
      onlyVisibleAt: 'macro',
    })
  }

  const hasIndex = files.some(f => f.endsWith('index.ts') || f.endsWith('index.js'))
  if (hasIndex) {
    visiblePatterns.push('Entry point files detected')
  } else if (files.length > 5) {
    blurryAreas.push('No index entry points found')
  }

  const avgFileSize = contents.length > 0
    ? contents.reduce((s, c) => s + c.split('\n').length, 0) / contents.length
    : 0

  if (avgFileSize > 300) {
    findings.push({
      level: 'macro', file: '*', category: 'quality', severity: 'notable',
      description: `Average file size ${Math.round(avgFileSize)} lines — files may be too large`,
      onlyVisibleAt: 'macro',
    })
    blurryAreas.push('Large average file size')
  }

  let clarity = 50
  if (dirCount >= 2) clarity += 10
  if (hasIndex) clarity += 10
  if (totalExports > 0) clarity += 10
  if (avgFileSize <= 200) clarity += 10
  if (totalExports > 0 && totalImports > 0) clarity += 10
  clarity = Math.max(0, Math.min(100, clarity))

  return {
    level: 'macro',
    description: 'Project-level overview: directory structure, module boundaries',
    clarity,
    visiblePatterns: Array.from(new Set(visiblePatterns)),
    blurryAreas: Array.from(new Set(blurryAreas)),
    findings,
  }
}

// ─── Meso Analysis ─────────────────────────────────────────────────────────────

/**
 * Analyze at meso (module) zoom level
 * @example
 * analyzeMeso('export function f() {}', 'a.ts') // ZoomLevel
 */
export function analyzeMeso(content: string, filePath: string): ZoomLevel {
  const findings: ZoomFinding[] = []
  const visiblePatterns: string[] = []
  const blurryAreas: string[] = []
  const lines = content.split('\n').length
  const exports = countExports(content)
  const funcs = countFns(content)
  const classes = countClasses(content)
  const ifaces = countIfaces(content)
  const imports = countImports(content)

  if (exports > 0) visiblePatterns.push(`${exports} export(s)`)
  if (funcs > 0) visiblePatterns.push(`${funcs} function(s)`)
  if (classes > 0) visiblePatterns.push(`${classes} class(es)`)
  if (ifaces > 0) visiblePatterns.push(`${ifaces} interface(s)`)
  if (imports > 0) visiblePatterns.push(`${imports} import(s)`)

  const hasDefaultExport = /export\s+default\s+/.test(content)
  if (hasDefaultExport) {
    visiblePatterns.push('Default export present')
  }

  if (lines > 300) {
    blurryAreas.push('Large file — structure hard to see at meso level')
    findings.push({
      level: 'meso', file: filePath, category: 'quality', severity: 'notable',
      description: `File is ${lines} lines — consider splitting`,
      onlyVisibleAt: 'meso',
    })
  }

  if (exports === 0 && funcs > 0) {
    blurryAreas.push('Functions without exports — internal-only module')
    findings.push({
      level: 'meso', file: filePath, category: 'pattern', severity: 'info',
      description: 'Internal module with no public exports',
      onlyVisibleAt: 'meso',
    })
  }

  if (imports > 10) {
    findings.push({
      level: 'meso', file: filePath, category: 'risk', severity: 'important',
      description: `${imports} imports — high coupling`,
      onlyVisibleAt: 'meso',
    })
    blurryAreas.push('High import count suggests tight coupling')
  }

  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  if (hasJSDoc) visiblePatterns.push('JSDoc documentation')

  let clarity = 40
  if (exports > 0) clarity += 10
  if (hasJSDoc) clarity += 10
  if (lines <= 200) clarity += 15
  if (ifaces > 0) clarity += 10
  if (imports <= 5) clarity += 10
  if (classes > 0 || funcs > 0) clarity += 5
  clarity = Math.max(0, Math.min(100, clarity))

  return {
    level: 'meso',
    description: 'Module-level view: file structure, exports, organization',
    clarity,
    visiblePatterns: Array.from(new Set(visiblePatterns)),
    blurryAreas: Array.from(new Set(blurryAreas)),
    findings,
  }
}

// ─── Micro Analysis ────────────────────────────────────────────────────────────

/**
 * Analyze at micro (function) zoom level
 * @example
 * analyzeMicro('function f() { if (x) { return 1 } }', 'a.ts') // ZoomLevel
 */
export function analyzeMicro(content: string, filePath: string): ZoomLevel {
  const findings: ZoomFinding[] = []
  const visiblePatterns: string[] = []
  const blurryAreas: string[] = []
  const funcs = countFns(content)
  const nesting = getMaxNesting(content)
  const hasTryCatch = /try\s*\{|catch\s*\(/.test(content)
  const hasThrow = /throw\s+/.test(content)
  const hasAsync = /async|await|Promise/.test(content)

  if (funcs > 0) visiblePatterns.push(`${funcs} function(s) defined`)
  if (hasTryCatch) visiblePatterns.push('Error handling present')
  if (hasAsync) visiblePatterns.push('Async patterns detected')

  if (nesting > 4) {
    blurryAreas.push(`Deep nesting (${nesting} levels) — hard to follow logic`)
    findings.push({
      level: 'micro', file: filePath, category: 'quality', severity: 'important',
      description: `${nesting} levels of nesting — consider flattening`,
      onlyVisibleAt: 'micro',
    })
  }

  if (hasAsync && !hasTryCatch) {
    blurryAreas.push('Async code without error handling')
    findings.push({
      level: 'micro', file: filePath, category: 'risk', severity: 'critical',
      description: 'Async operations without try/catch — unhandled rejections likely',
      onlyVisibleAt: 'micro',
    })
  }

  if (funcs > 10) {
    blurryAreas.push('Many functions — consider extraction')
    findings.push({
      level: 'micro', file: filePath, category: 'pattern', severity: 'notable',
      description: `${funcs} functions in one file — could be split`,
      onlyVisibleAt: 'micro',
    })
  }

  if (hasTryCatch && hasThrow) {
    visiblePatterns.push('Robust error propagation')
  }

  if (nesting <= 3 && funcs <= 5) {
    visiblePatterns.push('Clean control flow')
  }

  let clarity = 45
  if (funcs > 0) clarity += 10
  if (hasTryCatch) clarity += 15
  if (nesting <= 3) clarity += 15
  if (funcs <= 5) clarity += 10
  if (hasAsync && hasTryCatch) clarity += 5
  clarity = Math.max(0, Math.min(100, clarity))

  return {
    level: 'micro',
    description: 'Function-level view: logic flow, error handling, control structures',
    clarity,
    visiblePatterns: Array.from(new Set(visiblePatterns)),
    blurryAreas: Array.from(new Set(blurryAreas)),
    findings,
  }
}

// ─── Nano Analysis ─────────────────────────────────────────────────────────────

/**
 * Analyze at nano (line) zoom level
 * @example
 * analyzeNano('const value: number = 42;', 'a.ts') // ZoomLevel
 */
export function analyzeNano(content: string, filePath: string): ZoomLevel {
  const findings: ZoomFinding[] = []
  const visiblePatterns: string[] = []
  const blurryAreas: string[] = []
  const lines = content.split('\n')
  const typeAnnotations = countTypeAnnotations(content)
  const comments = countComments(content)
  const hasTypes = typeAnnotations > 0
  const hasComments = comments > 0

  if (hasTypes) visiblePatterns.push(`${typeAnnotations} type annotation(s)`)
  if (hasComments) visiblePatterns.push(`${comments} comment line(s)`)

  const avgLineLength = lines.reduce((s, l) => s + l.length, 0) / Math.max(1, lines.length)
  if (avgLineLength <= 80) {
    visiblePatterns.push('Short, readable lines')
  } else if (avgLineLength > 120) {
    blurryAreas.push(`Long average line length (${Math.round(avgLineLength)} chars)`)
    findings.push({
      level: 'nano', file: filePath, category: 'quality', severity: 'notable',
      description: `Average line length ${Math.round(avgLineLength)} chars — hard to read`,
      onlyVisibleAt: 'nano',
    })
  }

  if (!hasTypes) {
    blurryAreas.push('No type annotations')
    findings.push({
      level: 'nano', file: filePath, category: 'insight', severity: 'info',
      description: 'Missing type annotations — types would improve clarity',
      onlyVisibleAt: 'nano',
    })
  }

  if (!hasComments) {
    blurryAreas.push('No comments')
  }

  const hasTrailingWhitespace = lines.some(l => l.endsWith(' ') || l.endsWith('\t'))
  if (hasTrailingWhitespace) {
    findings.push({
      level: 'nano', file: filePath, category: 'quality', severity: 'info',
      description: 'Trailing whitespace detected',
      onlyVisibleAt: 'nano',
    })
  }

  const longLines = lines.filter(l => l.length > 120).length
  if (longLines > 5) {
    findings.push({
      level: 'nano', file: filePath, category: 'quality', severity: 'notable',
      description: `${longLines} lines exceed 120 characters`,
      onlyVisibleAt: 'nano',
    })
  }

  let clarity = 40
  if (hasTypes) clarity += 15
  if (hasComments) clarity += 10
  if (avgLineLength <= 80) clarity += 15
  if (avgLineLength <= 120) clarity += 10
  if (!hasTrailingWhitespace) clarity += 10
  clarity = Math.max(0, Math.min(100, clarity))

  return {
    level: 'nano',
    description: 'Line-level view: naming, formatting, type annotations, style',
    clarity,
    visiblePatterns: Array.from(new Set(visiblePatterns)),
    blurryAreas: Array.from(new Set(blurryAreas)),
    findings,
  }
}

// ─── Focal Depth ───────────────────────────────────────────────────────────────

/**
 * Compute focal depth — how many zoom levels needed to understand
 * @example
 * computeFocalDepth(macro, meso, micro, nano) // FocalDepth
 */
export function computeFocalDepth(
  filePath: string,
  macro: ZoomLevel,
  meso: ZoomLevel,
  micro: ZoomLevel,
  nano: ZoomLevel,
): FocalDepth {
  const levels = [macro, meso, micro, nano]
  let depthRequired = 1
  const threshold = 70

  for (const level of levels) {
    if (level.clarity >= threshold && depthRequired === levels.indexOf(level) + 1) {
      depthRequired = levels.indexOf(level) + 1
    } else if (level.clarity < threshold) {
      depthRequired = Math.max(depthRequired, levels.indexOf(level) + 1)
    }
  }

  const allFindings = levels.flatMap(l => l.findings)
  const hasCritical = allFindings.some(f => f.severity === 'critical')
  if (hasCritical) depthRequired = 4

  const clarity = computeClarity(levels)
  const focusScore = computeFocusScore(clarity, depthRequired)
  const classification = classifyFile(clarity, focusScore)

  return {
    file: filePath,
    depthRequired,
    macroView: macro.blurryAreas.length === 0 ? 'Clear' : macro.blurryAreas.join('; '),
    mesoView: meso.blurryAreas.length === 0 ? 'Clear' : meso.blurryAreas.join('; '),
    microView: micro.blurryAreas.length === 0 ? 'Clear' : micro.blurryAreas.join('; '),
    nanoView: nano.blurryAreas.length === 0 ? 'Clear' : nano.blurryAreas.join('; '),
    clarity,
    focusScore,
    classification,
  }
}

// ─── Clarity & Focus ───────────────────────────────────────────────────────────

/**
 * Compute overall clarity from zoom levels
 * @example
 * computeClarity([macro, meso, micro, nano]) // 75
 */
export function computeClarity(levels: ZoomLevel[]): number {
  if (levels.length === 0) return 50
  const avg = levels.reduce((s, l) => s + l.clarity, 0) / levels.length
  return Math.round(avg)
}

/**
 * Compute focus score
 * @example
 * computeFocusScore(80, 2) // 90
 */
export function computeFocusScore(clarity: number, depthRequired: number): number {
  const depthPenalty = (depthRequired - 1) * 10
  return Math.max(0, Math.min(100, Math.round(clarity - depthPenalty)))
}

/**
 * Classify file based on clarity and focus
 * @example
 * classifyFile(90, 85) // 'crystal'
 */
export function classifyFile(clarity: number, focusScore: number): FileClassification {
  if (clarity >= 80 && focusScore >= 70) return 'crystal'
  if (clarity >= 65 && focusScore >= 55) return 'focused'
  if (clarity >= 45) return 'multi-focal'
  if (clarity >= 25) return 'blurry'
  return 'opaque'
}

// ─── Overall Focus ─────────────────────────────────────────────────────────────

/**
 * Compute overall focus score across all reports
 * @example
 * computeOverallFocus(reports) // 72
 */
export function computeOverallFocus(reports: FocusReport[]): number {
  if (reports.length === 0) return 50
  const avg = reports.reduce((s, r) => s + r.focalDepth.focusScore, 0) / reports.length
  return Math.max(0, Math.min(100, Math.round(avg)))
}

/**
 * Classify telescope grade
 * @example
 * classifyTelescopeGrade(85, 80) // 'hubble'
 */
export function classifyTelescopeGrade(focus: number, clarity: number): TelescopeGrade {
  const combined = (focus + clarity) / 2
  if (combined >= 80) return 'hubble'
  if (combined >= 65) return 'observatory'
  if (combined >= 45) return 'binoculars'
  if (combined >= 25) return 'magnifying-glass'
  return 'naked-eye'
}

// ─── Best / Worst Zoom ─────────────────────────────────────────────────────────

/**
 * Find best zoom level for a report
 * @example
 * findBestZoom([macro, meso, micro, nano]) // 'meso'
 */
export function findBestZoom(levels: ZoomLevel[]): ZoomLevelName {
  if (levels.length === 0) return 'macro'
  return levels.reduce((best, cur) => cur.clarity > best.clarity ? cur : best).level
}

/**
 * Find worst zoom level for a report
 * @example
 * findWorstZoom([macro, meso, micro, nano]) // 'nano'
 */
export function findWorstZoom(levels: ZoomLevel[]): ZoomLevelName {
  if (levels.length === 0) return 'nano'
  return levels.reduce((worst, cur) => cur.clarity < worst.clarity ? cur : worst).level
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate telescope lens recommendations
 * @example
 * generateRecommendations(reports, globalZoom, stats) // string[]
 */
export function generateRecommendations(
  reports: FocusReport[],
  _globalZoom: ZoomLevel[],
  stats: TelescopeLensStats,
): string[] {
  const recs: string[] = []

  const opaqueFiles = reports.filter(r => r.focalDepth.classification === 'opaque')
  if (opaqueFiles.length > 0) {
    recs.push(`Refactor ${opaqueFiles.length} opaque file(s) for better clarity`)
  }

  if (stats.avgDepthRequired > 3) {
    recs.push('High focal depth required — simplify code to reduce understanding levels')
  }

  if (stats.nanoClarity < 40) {
    recs.push('Improve nano-level clarity: add type annotations and comments')
  }

  if (stats.macroClarity < 40) {
    recs.push('Improve macro-level clarity: add entry points and module boundaries')
  }

  if (stats.criticalFindings > 0) {
    recs.push(`Address ${stats.criticalFindings} critical finding(s) immediately`)
  }

  if (stats.overallFocus < 40) {
    recs.push('Low overall focus score — consider significant refactoring')
  }

  const blurryLevels: string[] = []
  if (stats.macroClarity < 50) blurryLevels.push('macro')
  if (stats.mesoClarity < 50) blurryLevels.push('meso')
  if (stats.microClarity < 50) blurryLevels.push('micro')
  if (stats.nanoClarity < 50) blurryLevels.push('nano')
  if (blurryLevels.length > 0) {
    recs.push(`Blurry zoom levels: ${blurryLevels.join(', ')} — improve documentation and structure`)
  }

  return Array.from(new Set(recs))
}

// ─── Build Focus Report ────────────────────────────────────────────────────────

/**
 * Build a focus report for a single file
 * @example
 * buildFocusReport('export const x = 1', 'a.ts', macro) // FocusReport
 */
export function buildFocusReport(content: string, filePath: string, globalMacro: ZoomLevel): FocusReport {
  const meso = analyzeMeso(content, filePath)
  const micro = analyzeMicro(content, filePath)
  const nano = analyzeNano(content, filePath)

  const zoomLevels = [globalMacro, meso, micro, nano]
  const focalDepth = computeFocalDepth(filePath, globalMacro, meso, micro, nano)

  return {
    file: filePath,
    zoomLevels,
    focalDepth,
    bestZoomLevel: findBestZoom(zoomLevels),
    worstZoomLevel: findWorstZoom(zoomLevels),
  }
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the complete telescope-lens result
 * @example
 * buildTelescopeLensResult(['a.ts'], ['const x = 1'], {}) // TelescopeLensResult
 */
export function buildTelescopeLensResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): TelescopeLensResult {
  const globalMacro = analyzeMacro(files, contents)
  const reports: FocusReport[] = []

  for (let i = 0; i < files.length; i++) {
    reports.push(buildFocusReport(contents[i], files[i], globalMacro))
  }

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const macroClarity = avg(reports.map(r => r.zoomLevels[0].clarity))
  const mesoClarity = avg(reports.map(r => r.zoomLevels[1].clarity))
  const microClarity = avg(reports.map(r => r.zoomLevels[2].clarity))
  const nanoClarity = avg(reports.map(r => r.zoomLevels[3].clarity))

  const findingsPerLevel: Record<string, number> = { macro: 0, meso: 0, micro: 0, nano: 0 }
  let criticalFindings = 0
  for (const r of reports) {
    for (const zl of r.zoomLevels) {
      findingsPerLevel[zl.level] += zl.findings.length
      criticalFindings += zl.findings.filter(f => f.severity === 'critical').length
    }
  }

  const levelClarityMap: Record<string, number> = { macro: macroClarity, meso: mesoClarity, micro: microClarity, nano: nanoClarity }
  const bestOverallLevel = (Object.entries(levelClarityMap) as [string, number][])
    .sort((a, b) => b[1] - a[1])[0][0] as ZoomLevelName
  const worstOverallLevel = (Object.entries(levelClarityMap) as [string, number][])
    .sort((a, b) => a[1] - b[1])[0][0] as ZoomLevelName

  const overallFocus = computeOverallFocus(reports)
  const avgClarity = avg(reports.map(r => r.focalDepth.clarity))
  const telescopeGrade = classifyTelescopeGrade(overallFocus, avgClarity)

  const stats: TelescopeLensStats = {
    totalReports: reports.length,
    avgClarity,
    avgDepthRequired: avg(reports.map(r => r.focalDepth.depthRequired)),
    avgFocusScore: avg(reports.map(r => r.focalDepth.focusScore)),
    crystalFiles: reports.filter(r => r.focalDepth.classification === 'crystal').length,
    opaqueFiles: reports.filter(r => r.focalDepth.classification === 'opaque').length,
    macroClarity,
    mesoClarity,
    microClarity,
    nanoClarity,
    findingsPerLevel,
    criticalFindings,
    bestOverallLevel,
    worstOverallLevel,
    overallFocus,
    telescopeGrade,
  }

  const globalZoom = [globalMacro]
  const recommendations = generateRecommendations(reports, globalZoom, stats)

  return { reports, globalZoom, stats, recommendations }
}
