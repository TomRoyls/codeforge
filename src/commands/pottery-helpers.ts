// ─── Types ─────────────────────────────────────────────────────────────────────

export type CeramicShape = 'vase' | 'bowl' | 'plate' | 'cup' | 'amphora' | 'sculpture' | 'lump'
export type CeramicGrade = 'masterwork' | 'fine-craft' | 'studio' | 'student' | 'kiln-waste'
export type DefectType = 'crack' | 'warp' | 'air-bubble' | 'kiln-accident' | 'crazing' | 'dunting' | 'shivering' | 'pinhole'
export type DefectSeverity = 'cosmetic' | 'minor' | 'major' | 'structural'
export type WheelTechnique = 'centering' | 'pulling' | 'shaping' | 'trimming' | 'decorating'
export type KilnOutcome = 'perfect' | 'well-fired' | 'under-fired' | 'over-fired' | 'cracked'
export type OverallGrade = 'master-potter' | 'artisan' | 'apprentice' | 'student' | 'novice'

export interface CeramicDefect {
  type: DefectType
  location: number
  severity: DefectSeverity
  description: string
  repair: string
}

export interface CeramicPiece {
  file: string
  clay: number
  wheelwork: number
  firing: number
  glaze: number
  finalInspection: number
  defects: CeramicDefect[]
  shape: CeramicShape
  grade: CeramicGrade
}

export interface PotteryWheel {
  file: string
  technique: WheelTechnique
  score: number
  description: string
}

export interface KilnResult {
  file: string
  temperature: number
  duration: number
  result: KilnOutcome
  description: string
}

export interface PotteryStats {
  totalPieces: number
  avgClay: number
  avgWheelwork: number
  avgFiring: number
  avgGlaze: number
  avgInspection: number
  masterworkCount: number
  kilnWasteCount: number
  totalDefects: number
  structuralDefects: number
  cosmeticDefects: number
  avgTemperature: number
  perfectFirings: number
  underFired: number
  shapeDistribution: Record<string, number>
  craftsmanshipIndex: number
  overallGrade: OverallGrade
}

export interface PotteryResult {
  pieces: CeramicPiece[]
  wheels: PotteryWheel[]
  kiln: KilnResult[]
  stats: PotteryStats
  recommendations: string[]
}

// ─── Helper Functions ───────────────────────────────────────────────────────────

/**
 * Count maximum nesting depth
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
 * Count exports
 * @example
 * countExports('export const x = 1; export function f() {}') // 2
 */
function countExports(content: string): number {
  return (content.match(/export\s+/g) || []).length
}

/**
 * Count functions
 * @example
 * countFunctions('function foo() {} const bar = () => {}') // 2
 */
function countFunctions(content: string): number {
  const named = (content.match(/function\s+\w+/g) || []).length
  const arrow = (content.match(/=>\s*[{(]/g) || []).length
  return named + arrow
}

/**
 * Count comment lines
 * @example
 * countComments('// hello') // 1
 */
function countComments(content: string): number {
  const lineComments = (content.match(/\/\/.*$/gm) || []).length
  return lineComments
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations(': number | string') // 2
 */
function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*\w+/g) || []).length
}

// ─── Clay Evaluation ────────────────────────────────────────────────────────────

/**
 * Evaluate clay quality (readability of raw code)
 * @example
 * evaluateClay('// well documented\nconst x: number = 1') // high score
 */
export function evaluateClay(content: string): number {
  const lines = content.split('\n')
  const totalLines = lines.length
  if (totalLines === 0) return 50

  const comments = countComments(content)
  const commentRatio = comments / totalLines

  const hasTypes = countTypeAnnotations(content) > 0
  const descriptiveNames = (content.match(/\b[a-z]{4,}\b/g) || []).length
  const nameRatio = totalLines > 0 ? Math.min(1, descriptiveNames / totalLines) : 0

  const avgLineLength = content.split('\n').reduce((s, l) => s + l.length, 0) / totalLines
  const lineLengthScore = avgLineLength <= 80 ? 1 : avgLineLength <= 120 ? 0.7 : 0.4

  let score = 30
  score += Math.min(25, commentRatio * 125)
  score += hasTypes ? 15 : 0
  score += Math.min(15, nameRatio * 30)
  score += lineLengthScore * 15

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ─── Wheelwork Evaluation ───────────────────────────────────────────────────────

/**
 * Evaluate wheelwork quality (structural quality)
 * @example
 * evaluateWheelwork('export function foo() {}') // { centering, pulling, shaping, trimming, decorating }
 */
export function evaluateWheelwork(content: string, filePath: string): PotteryWheel[] {
  const wheels: PotteryWheel[] = []
  const nesting = getMaxNesting(content)
  const exports = countExports(content)
  const funcs = countFunctions(content)
  const hasInterfaces = /interface\s+\w+|type\s+\w+\s*=/.test(content)
  const lines = content.split('\n').length

  const centering = Math.max(0, Math.min(100, Math.round(
    50 + (exports > 0 ? 15 : 0) + (nesting <= 4 ? 20 : Math.max(0, 10 - (nesting - 4) * 3)) + (lines < 200 ? 15 : 5)
  )))
  wheels.push({ file: filePath, technique: 'centering', score: centering, description: 'Foundation structure assessment' })

  const pulling = Math.max(0, Math.min(100, Math.round(
    40 + (funcs > 0 ? 15 : 0) + (funcs <= 10 ? 15 : Math.max(0, 15 - (funcs - 10) * 2)) + (nesting <= 3 ? 20 : Math.max(0, 10 - nesting)) + (exports >= 1 ? 10 : 0)
  )))
  wheels.push({ file: filePath, technique: 'pulling', score: pulling, description: 'Building functionality cleanly' })

  const shaping = Math.max(0, Math.min(100, Math.round(
    35 + (hasInterfaces ? 20 : 0) + (exports >= 1 && exports <= 8 ? 20 : 10) + (/implements|extends/.test(content) ? 10 : 0) + (countTypeAnnotations(content) > 0 ? 15 : 0)
  )))
  wheels.push({ file: filePath, technique: 'shaping', score: shaping, description: 'Interface and type design' })

  const unusedPatterns = (content.match(/TODO|FIXME|HACK|XXX/gi) || []).length
  const deadCode = (content.match(/\/\/\s*eslint-disable|\/\/\s*@ts-ignore/gi) || []).length
  const trimming = Math.max(0, Math.min(100, Math.round(
    70 - unusedPatterns * 5 - deadCode * 5 - Math.max(0, (lines - 300) / 20)
  )))
  wheels.push({ file: filePath, technique: 'trimming', score: trimming, description: 'Removing unnecessary code' })

  const comments = countComments(content)
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const decorating = Math.max(0, Math.min(100, Math.round(
    30 + Math.min(20, comments * 2) + (hasJSDoc ? 20 : 0) + (comments > lines * 0.1 ? 15 : 5) + Math.min(15, countTypeAnnotations(content))
  )))
  wheels.push({ file: filePath, technique: 'decorating', score: decorating, description: 'Documentation and annotation quality' })

  return wheels
}

// ─── Firing Evaluation ──────────────────────────────────────────────────────────

/**
 * Evaluate firing quality (test/verification proxy)
 * @example
 * evaluateFiring('try { work() } catch(e) { throw e }') // KilnResult
 */
export function evaluateFiring(content: string, filePath: string): KilnResult {
  const hasTryCatch = /try\s*\{|catch\s*\(/.test(content)
  const hasThrow = /throw\s+/.test(content)
  const hasNullChecks = /===\s*null|!==\s*null|===\s*undefined|!==\s*undefined|\?\?|\?\.\w/.test(content)
  const hasValidation = /typeof\s+\w|instanceof\s+\w|Array\.isArray|!?\w+\s*===?\s*/.test(content)
  const hasTypes = countTypeAnnotations(content) > 0

  let temperature = 20
  if (hasTryCatch) temperature += 20
  if (hasThrow) temperature += 15
  if (hasNullChecks) temperature += 15
  if (hasValidation) temperature += 15
  if (hasTypes) temperature += 15

  temperature = Math.min(100, temperature)

  const duration = content.split('\n').length

  let result: KilnOutcome = 'well-fired'
  if (temperature >= 80) result = 'perfect'
  else if (temperature >= 50) result = 'well-fired'
  else if (temperature >= 30) result = 'under-fired'
  else result = 'cracked'

  if (temperature > 90 && content.length > 5000) result = 'over-fired'

  const descriptions: Record<KilnOutcome, string> = {
    'perfect': 'Thoroughly verified with error handling and validation',
    'well-fired': 'Adequately verified with some safety checks',
    'under-fired': 'Missing error handling — needs more verification',
    'over-fired': 'Excessive verification for simple code',
    'cracked': 'No verification at all — fragile code',
  }

  return {
    file: filePath,
    temperature,
    duration,
    result,
    description: descriptions[result],
  }
}

// ─── Glaze Evaluation ───────────────────────────────────────────────────────────

/**
 * Evaluate glaze quality (formatting/style)
 * @example
 * evaluateGlaze('const x = 1;\nconst y = 2;') // high score
 */
export function evaluateGlaze(content: string): number {
  const lines = content.split('\n')
  if (lines.length <= 1) return 70

  const indentations = lines.filter(l => l.trim().length > 0).map(l => {
    const match = l.match(/^(\s*)/)
    return match ? match?.[1]?.length : 0
  })

  const hasConsistentIndent = indentations.length <= 1 || Array.from(new Set(
    indentations.filter((i): i is number => (i ?? 0) > 0).map(i => i % 2 === 0 ? 'even' : 'odd')
  )).length <= 1

  const camelCase = (content.match(/[a-z][a-zA-Z0-9]*/g) || []).length
  const snakeCase = (content.match(/[a-z][a-z0-9_]*_/g) || []).length
  const namingConsistent = (camelCase === 0 || snakeCase === 0) ? 1 : 0.5

  const hasImports = /import\s+/.test(content)
  const importSection = hasImports ? 10 : 5

  const longLines = lines.filter(l => l.length > 120).length
  const longLinePenalty = Math.min(20, longLines * 3)

  let score = 40
  score += hasConsistentIndent ? 20 : 5
  score += namingConsistent * 15
  score += importSection
  score -= longLinePenalty

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ─── Shape Classification ───────────────────────────────────────────────────────

/**
 * Classify the ceramic shape based on code structure
 * @example
 * classifyShape('export function foo() {}', 'a.ts') // 'cup'
 */
export function classifyShape(content: string, _filePath: string): CeramicShape {
  const lines = content.split('\n').length
  const exports = countExports(content)
  const nesting = getMaxNesting(content)
  const funcs = countFunctions(content)
  const hasAbstraction = /interface|abstract|type\s+\w+\s*=/.test(content)

  if (lines > 300 && exports > 10) return 'amphora'
  if (nesting > 5 && funcs > 5 && hasAbstraction) return 'sculpture'
  if (exports >= 5 && nesting <= 2) return 'bowl'
  if (funcs >= 5 && nesting <= 2 && exports <= 3) return 'plate'
  if (lines < 30 && exports <= 2 && funcs <= 2) return 'cup'
  if (exports <= 2 && nesting > 3) return 'vase'
  if (lines > 200 && exports === 0) return 'lump'
  return 'vase'
}

// ─── Defect Detection ───────────────────────────────────────────────────────────

/**
 * Detect ceramic defects in code
 * @example
 * detectDefects('try { } catch(e) { }', 'a.ts') // CeramicDefect[]
 */
export function detectDefects(content: string, _filePath: string): CeramicDefect[] {
  const defects: CeramicDefect[] = []
  const lines = content.split('\n')

  // Crack: missing error handling in functions
  const hasAsync = /async|await|Promise/.test(content)
  const hasErrorHandling = /try|catch|\.catch|throw/.test(content)
  if (hasAsync && !hasErrorHandling) {
    const line = lines.findIndex(l => /async|await/.test(l)) + 1
    defects.push({
      type: 'crack',
      location: Math.max(1, line),
      severity: 'major',
      description: 'Async code without error handling — a crack waiting to propagate',
      repair: 'Add try/catch or .catch() handlers',
    })
  }

  // Warp: inconsistent patterns
  const hasSemicolons = lines.filter(l => l.trim().endsWith(';')).length
  const hasNoSemicolons = lines.filter(l => l.trim().length > 0 && !l.trim().endsWith(';') && !l.trim().startsWith('//') && !l.trim().startsWith('{') && !l.trim().startsWith('}') && !l.trim().startsWith('*') && !l.includes('import')).length
  const codeLines = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith('//') && !l.trim().startsWith('*') && !l.trim().startsWith('import')).length
  if (codeLines > 5 && hasSemicolons > codeLines * 0.3 && hasNoSemicolons > codeLines * 0.3) {
    defects.push({
      type: 'warp',
      location: 1,
      severity: 'minor',
      description: 'Inconsistent semicolon usage — the shape is warping',
      repair: 'Standardize semicolon usage throughout the file',
    })
  }

  // Air bubble: implicit any or unchecked null
  if (/:\s*any\b|as\s+any/.test(content)) {
    const line = lines.findIndex(l => /:\s*any|as\s+any/.test(l)) + 1
    defects.push({
      type: 'air-bubble',
      location: Math.max(1, line),
      severity: 'major',
      description: 'Type safety bypass — an air bubble that could burst at runtime',
      repair: 'Replace any with proper type annotations',
    })
  }

  // Kiln accident: merge conflict markers or bad refactoring evidence
  if (/<<<<<<</.test(content) || /=======/.test(content) || />>>>>>>/.test(content)) {
    const line = lines.findIndex(l => /<<<<<<</.test(l)) + 1
    defects.push({
      type: 'kiln-accident',
      location: Math.max(1, line),
      severity: 'structural',
      description: 'Merge conflict markers detected — a kiln accident',
      repair: 'Resolve merge conflicts and clean up',
    })
  }

  // Crazing: many small issues
  const todos = (content.match(/TODO|FIXME|HACK/gi) || []).length
  if (todos > 3) {
    defects.push({
      type: 'crazing',
      location: 1,
      severity: 'minor',
      description: `${todos} TODO/FIXME markers — surface crazing from accumulated issues`,
      repair: 'Resolve outstanding TODOs to smooth the surface',
    })
  }

  // Dunting: stress from rapid change (inconsistent naming or mixed patterns)
  const hasCamelCase = /[a-z][a-zA-Z0-9]*/.test(content)
  const hasSnakeCase = /_\w/.test(content)
  const constVars = (content.match(/const\s+\w+/g) || []).length
  const letVars = (content.match(/let\s+\w+/g) || []).length
  if (hasCamelCase && hasSnakeCase && constVars > 0 && letVars > 3) {
    defects.push({
      type: 'dunting',
      location: 1,
      severity: 'minor',
      description: 'Mixed naming conventions — stress crack from inconsistent changes',
      repair: 'Standardize naming conventions',
    })
  }

  // Shivering: code that doesn't fit (inconsistent style)
  const hasArrow = /=>\s*[{(]/.test(content)
  const hasFunction = /function\s+\w+/.test(content)
  if (hasArrow && hasFunction && funcs_count(content) > 4) {
    defects.push({
      type: 'shivering',
      location: 1,
      severity: 'cosmetic',
      description: 'Mixed function declaration styles — shivering glaze',
      repair: 'Use consistent function declaration style',
    })
  }

  // Pinhole: small quality issues
  const hasTrailingWhitespace = lines.some(l => l.endsWith(' ') || l.endsWith('\t'))
  if (hasTrailingWhitespace && lines.length > 10) {
    const line = lines.findIndex(l => l.endsWith(' ') || l.endsWith('\t')) + 1
    defects.push({
      type: 'pinhole',
      location: Math.max(1, line),
      severity: 'cosmetic',
      description: 'Trailing whitespace — a pinhole in the glaze',
      repair: 'Remove trailing whitespace',
    })
  }

  return defects
}

function funcs_count(content: string): number {
  return countFunctions(content)
}

// ─── Final Inspection ───────────────────────────────────────────────────────────

/**
 * Compute final inspection score
 * @example
 * inspectPiece(80, 70, 60, 75) // 71
 */
export function inspectPiece(clay: number, wheelwork: number, firing: number, glaze: number): number {
  return Math.round(clay * 0.25 + wheelwork * 0.3 + firing * 0.25 + glaze * 0.2)
}

// ─── Grade Classification ───────────────────────────────────────────────────────

/**
 * Classify ceramic grade
 * @example
 * classifyPieceGrade(85, 0) // 'masterwork'
 */
export function classifyPieceGrade(inspection: number, structuralDefects: number): CeramicGrade {
  if (structuralDefects > 2) return 'kiln-waste'
  if (inspection >= 80 && structuralDefects === 0) return 'masterwork'
  if (inspection >= 65) return 'fine-craft'
  if (inspection >= 45) return 'studio'
  if (inspection >= 25) return 'student'
  return 'kiln-waste'
}

// ─── Craftsmanship Index ────────────────────────────────────────────────────────

/**
 * Compute overall craftsmanship index (0-100)
 * @example
 * computeCraftsmanshipIndex(pieces) // 75
 */
export function computeCraftsmanshipIndex(pieces: CeramicPiece[]): number {
  if (pieces.length === 0) return 50
  const avgInspection = pieces.reduce((s, p) => s + p.finalInspection, 0) / pieces.length
  const structuralDefects = pieces.reduce((s, p) => s + p.defects.filter(d => d.severity === 'structural').length, 0)
  const penalty = Math.min(30, structuralDefects * 5)
  return Math.max(0, Math.min(100, Math.round(avgInspection - penalty)))
}

/**
 * Classify overall grade
 * @example
 * classifyOverallGrade(85, 0) // 'master-potter'
 */
export function classifyOverallGrade(craftsmanship: number, avgDefects: number): OverallGrade {
  if (craftsmanship >= 80 && avgDefects < 1) return 'master-potter'
  if (craftsmanship >= 65) return 'artisan'
  if (craftsmanship >= 45) return 'apprentice'
  if (craftsmanship >= 25) return 'student'
  return 'novice'
}

// ─── Build Single Piece ─────────────────────────────────────────────────────────

/**
 * Build a complete ceramic piece evaluation
 * @example
 * buildPiece('export const x = 1', 'a.ts') // CeramicPiece
 */
export function buildPiece(content: string, filePath: string): CeramicPiece {
  const clay = evaluateClay(content)
  const wheels = evaluateWheelwork(content, filePath)
  const wheelwork = Math.round(wheels.reduce((s, w) => s + w.score, 0) / wheels.length)
  const firing = evaluateFiring(content, filePath).temperature
  const glaze = evaluateGlaze(content)
  const finalInspection = inspectPiece(clay, wheelwork, firing, glaze)
  const defects = detectDefects(content, filePath)
  const shape = classifyShape(content, filePath)
  const structuralDefects = defects.filter(d => d.severity === 'structural' || d.severity === 'major').length
  const grade = classifyPieceGrade(finalInspection, structuralDefects)

  return {
    file: filePath,
    clay,
    wheelwork,
    firing,
    glaze,
    finalInspection,
    defects,
    shape,
    grade,
  }
}

// ─── Recommendations ────────────────────────────────────────────────────────────

/**
 * Generate pottery recommendations
 * @example
 * generatePotteryRecommendations(pieces, defects, kiln, stats) // string[]
 */
export function generatePotteryRecommendations(
  pieces: CeramicPiece[],
  _defects: CeramicDefect[],
  kiln: KilnResult[],
  stats: PotteryStats,
): string[] {
  const recs: string[] = []

  const waste = pieces.filter(p => p.grade === 'kiln-waste')
  if (waste.length > 0) {
    recs.push(`Consider refactoring ${waste.length} kiln-waste file(s) from scratch`)
  }

  const underFired = kiln.filter(k => k.result === 'under-fired' || k.result === 'cracked')
  if (underFired.length > 0) {
    recs.push(`Add error handling to ${underFired.length} under-fired file(s)`)
  }

  if (stats.avgClay < 50) {
    recs.push('Improve clay quality — add comments and type annotations for better readability')
  }

  if (stats.avgGlaze < 50) {
    recs.push('Improve glaze finish — standardize formatting and naming conventions')
  }

  const structuralDefects = pieces.reduce((s, p) => s + p.defects.filter(d => d.severity === 'structural').length, 0)
  if (structuralDefects > 0) {
    recs.push(`Fix ${structuralDefects} structural defect(s) immediately`)
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ───────────────────────────────────────────────────────────────

/**
 * Build the complete pottery result
 * @example
 * buildPotteryResult(['a.ts'], ['export const x = 1'], {}) // PotteryResult
 */
export function buildPotteryResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): PotteryResult {
  const pieces: CeramicPiece[] = []
  const wheels: PotteryWheel[] = []
  const kiln: KilnResult[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i]
    const filePath = files[i]

    pieces.push(buildPiece(content ?? '',filePath ?? ''))
    wheels.push(...evaluateWheelwork(content ?? '',filePath ?? ''))
    kiln.push(evaluateFiring(content ?? '',filePath ?? ''))
  }

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const avgClay = avg(pieces.map(p => p.clay))
  const avgWheelwork = avg(pieces.map(p => p.wheelwork))
  const avgFiring = avg(pieces.map(p => p.firing))
  const avgGlaze = avg(pieces.map(p => p.glaze))
  const avgInspection = avg(pieces.map(p => p.finalInspection))

  const allDefects = pieces.flatMap(p => p.defects)
  const shapeDistribution: Record<string, number> = {}
  for (const p of pieces) {
    shapeDistribution[p.shape] = (shapeDistribution[p.shape] || 0) + 1
  }

  const craftsmanshipIndex = computeCraftsmanshipIndex(pieces)
  const avgDefectsPerFile = pieces.length > 0 ? allDefects.length / pieces.length : 0
  const overallGrade = classifyOverallGrade(craftsmanshipIndex, avgDefectsPerFile)

  const stats: PotteryStats = {
    totalPieces: pieces.length,
    avgClay,
    avgWheelwork,
    avgFiring,
    avgGlaze,
    avgInspection,
    masterworkCount: pieces.filter(p => p.grade === 'masterwork').length,
    kilnWasteCount: pieces.filter(p => p.grade === 'kiln-waste').length,
    totalDefects: allDefects.length,
    structuralDefects: allDefects.filter(d => d.severity === 'structural').length,
    cosmeticDefects: allDefects.filter(d => d.severity === 'cosmetic').length,
    avgTemperature: avg(kiln.map(k => k.temperature)),
    perfectFirings: kiln.filter(k => k.result === 'perfect').length,
    underFired: kiln.filter(k => k.result === 'under-fired').length,
    shapeDistribution,
    craftsmanshipIndex,
    overallGrade,
  }

  const recommendations = generatePotteryRecommendations(pieces, allDefects, kiln, stats)

  return { pieces, wheels, kiln, stats, recommendations }
}
