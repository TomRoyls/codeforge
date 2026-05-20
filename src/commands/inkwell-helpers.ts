// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface InkStroke {
  file: string
  strokeQuality: number
  inkDensity: number
  flow: number
  penmanship: number
  inkColor: 'black' | 'blue' | 'red' | 'gold' | 'invisible'
  strokeType: 'bold' | 'regular' | 'light' | 'faded' | 'blotted' | 'invisible'
  manuscript: {
    paragraphs: number
    sentences: number
    words: number
    punctuation: number
    avgSentenceLength: number
    avgParagraphCohesion: number
  }
  blemishes: string[]
  flourishes: string[]
  inkBlots: string[]
  drySpots: string[]
  smudges: string[]
  classification: 'masterwork' | 'fine-craft' | 'legible' | 'rough-draft' | 'scribble' | 'illegible'
  readabilityScore: number
}

export interface InkBottle {
  directory: string
  strokes: InkStroke[]
  inkQuality: number
  bottleFullness: number
  dominantInkColor: string
  dominantStrokeType: string
  avgReadability: number
  totalBlemishes: number
  totalFlourishes: number
  totalInkBlots: number
  totalDrySpots: number
  totalSmudges: number
  condition: 'pristine' | 'good' | 'fair' | 'worn' | 'damaged' | 'ruined'
}

export interface InkwellStats {
  totalFiles: number
  totalBottles: number
  avgStrokeQuality: number
  avgInkDensity: number
  avgFlow: number
  avgPenmanship: number
  avgReadability: number
  masterworks: number
  fineCrafts: number
  scribbles: number
  illegibles: number
  totalBlemishes: number
  totalFlourishes: number
  totalInkBlots: number
  totalDrySpots: number
  totalSmudges: number
  overallInkQuality: number
  dominantInkColor: string
  manuscriptCondition: 'pristine' | 'well-preserved' | 'fair' | 'worn' | 'deteriorating' | 'damaged'
  penmanshipGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  bestWrittenFile: string
  worstWrittenFile: string
}

export interface InkwellResult {
  strokes: InkStroke[]
  bottles: InkBottle[]
  stats: InkwellStats
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────────────────────────

const FUNCTION_RE = /(?:export\s+)?(?:async\s+)?function\s+\w+/g
const ARROW_RE = /(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\(/g
const CLASS_RE = /(?:export\s+)?(?:abstract\s+)?class\s+\w+/g
const INTERFACE_RE = /(?:export\s+)?interface\s+\w+/g
const TYPE_RE = /(?:export\s+)?type\s+\w+/g
const EXPORT_RE = /export\s+(?:default\s+)?(?:function|class|const|let|interface|type)/g
const IMPORT_RE = /import\s+.*?from\s+['"][^'"]+['"]/g
const COMMENT_RE = /\/\/.*$/gm
const BLOCK_COMMENT_RE = /\/\*[\s\S]*?\*\//g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const IDENTIFIER_RE = /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g
const OPERATOR_RE = /[+\-*/%=<>!&|^~?:]+/g
const NESTED_TERNARY_RE = /\?.*\?.*:/g
const MAGIC_NUMBER_RE = /(?:^|[=,(<>+\-*/])\s*(?:(?:0x[0-9a-fA-F]+)|(?:\d{3,}))(?!\w)/g
const LONG_LINE_INDICATOR = 120
const OPTIONAL_CHAIN_RE = /\?\.\w+/g
const DESTRUCTURE_RE = /(?:const|let|var)\s*\{[^}]+\}\s*=/g
const GUARD_CLAUSE_RE = /if\s*\([^)]+\)\s*(?:return|throw|continue|break)/g
const CONSOLE_RE = /console\.\w+\(/g
const ANY_RE = /:\s*any\b/g
const TODO_RE = /\/\/\s*(TODO|FIXME|HACK)/gi

// ─── Flourish Detection ──────────────────────────────────────────────────────

/**
 * Identify elegant patterns in code
 * @example
 * identifyFlourishes('const { a, b } = obj') // ['destructuring']
 */
export function identifyFlourishes(content: string): string[] {
  const flourishes: string[] = []

  if (content.match(OPTIONAL_CHAIN_RE)) flourishes.push('optional-chaining')
  if (content.match(DESTRUCTURE_RE)) flourishes.push('destructuring')
  if (content.match(GUARD_CLAUSE_RE)) flourishes.push('guard-clauses')
  if (content.match(JSDOC_RE)) flourishes.push('jsdoc-documentation')
  if (content.match(INTERFACE_RE)) flourishes.push('type-definitions')
  if (content.match(/export\s+default\s+function/g)) flourishes.push('default-exports')
  if (content.match(/readonly\s+\w+/g)) flourishes.push('readonly-properties')
  if (content.match(/\b(?:const|let)\s+\w+\s*=\s*[^;]+\n/g)) flourishes.push('clean-assignments')

  return Array.from(new Set(flourishes))
}

// ─── Blemish Detection ───────────────────────────────────────────────────────

/**
 * Identify code smells
 * @example
 * identifyBlemishes('a ? b ? c : d : e') // ['nested-ternary']
 */
export function identifyBlemishes(content: string): string[] {
  const blemishes: string[] = []

  if (content.match(NESTED_TERNARY_RE)) blemishes.push('nested-ternary')
  const magicMatches = content.match(MAGIC_NUMBER_RE)
  if (magicMatches && magicMatches.length >= 2) blemishes.push('magic-numbers')
  if (content.match(CONSOLE_RE)) blemishes.push('console-usage')
  if (content.match(ANY_RE)) blemishes.push('any-type')
  const lines = content.split('\n')
  const longLines = lines.filter(l => l.trim().length > LONG_LINE_INDICATOR).length
  if (longLines > lines.length * 0.3) blemishes.push('long-lines')

  // Detect long functions (simplified: count lines between function and closing brace)
  const funcMatches = content.match(FUNCTION_RE)
  if (funcMatches) {
    const funcCount = funcMatches.length
    if (funcCount > 0 && lines.length / funcCount > 50) blemishes.push('long-functions')
  }

  return Array.from(new Set(blemishes))
}

// ─── Ink Blot Detection ─────────────────────────────────────────────────────

/**
 * Identify messy/unclear code
 * @example
 * identifyInkBlots('var x = 1; var y = 2') // ['var-usage']
 */
export function identifyInkBlots(content: string): string[] {
  const blots: string[] = []

  if (content.match(/\bvar\s+\w+/g)) blots.push('var-usage')
  if (content.match(/==(?!=)/g)) blots.push('loose-equality')
  if (content.match(/!=([^=])/g)) blots.push('loose-inequality')
  if (content.match(/\b(eval|Function)\s*\(/g)) blots.push('eval-usage')
  if (content.match(/\w+\s*\?\s*\w+\s*:\s*\w+\s*\?\s*\w+\s*:\s*\w+/g)) blots.push('chained-ternary')

  // Check for single-letter variable names (excluding loop vars i, j, k)
  const singleLetter = content.match(/(?:const|let|var)\s+([a-z])\s*=/g)
  if (singleLetter && singleLetter.length > 3) blots.push('cryptic-names')

  // Deep nesting
  let maxIndent = 0
  for (const line of content.split('\n')) {
    const indent = line.match(/^(\s*)/)?.[1].length ?? 0
    if (indent > maxIndent) maxIndent = indent
  }
  if (maxIndent > 24) blots.push('deep-nesting')

  return Array.from(new Set(blots))
}

// ─── Dry Spot Detection ─────────────────────────────────────────────────────

/**
 * Identify under-documented areas
 * @example
 * identifyDrySpots('function complex() { ... }') // ['missing-jsdoc']
 */
export function identifyDrySpots(content: string): string[] {
  const dry: string[] = []

  const hasFunctions = content.match(FUNCTION_RE)
  const hasJsdoc = content.match(JSDOC_RE)
  if (hasFunctions && (!hasJsdoc || hasJsdoc.length < hasFunctions.length * 0.5)) {
    dry.push('missing-jsdoc')
  }

  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith('//') && !l.trim().startsWith('/*'))
  const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('*') || l.trim().startsWith('/*'))

  if (codeLines.length > 20 && commentLines.length < codeLines.length * 0.05) {
    dry.push('under-commented')
  }

  const hasExport = content.match(EXPORT_RE)
  const hasInlineDoc = content.match(COMMENT_RE)
  if (hasExport && hasExport.length > 3 && (!hasInlineDoc || hasInlineDoc.length < 2)) {
    dry.push('sparse-inline-docs')
  }

  return Array.from(new Set(dry))
}

// ─── Smudge Detection ────────────────────────────────────────────────────────

/**
 * Identify formatting inconsistencies
 * @example
 * identifySmudges('const x=1;const y = 2') // ['inconsistent-spacing']
 */
export function identifySmudges(content: string): string[] {
  const smudges: string[] = []
  const lines = content.split('\n')

  // Check mixed indentation
  const spaces = lines.filter(l => l.startsWith('  ') && !l.startsWith('\t')).length
  const tabs = lines.filter(l => l.startsWith('\t')).length
  if (spaces > 0 && tabs > 0) smudges.push('mixed-indentation')

  // Check inconsistent semicolons
  const withSemi = lines.filter(l => l.trim().endsWith(';')).length
  const withoutSemi = lines.filter(l => {
    const t = l.trim()
    return t.length > 0 && !t.endsWith(';') && !t.endsWith('{') && !t.endsWith('}') && !t.endsWith(',') && !t.endsWith('(') && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*') && !t.includes('import ')
  }).length
  if (withSemi > 0 && withoutSemi > withSemi * 0.5) smudges.push('inconsistent-semicolons')

  // Trailing whitespace
  const trailing = lines.filter(l => l !== l.trimEnd() && l.trim().length > 0).length
  if (trailing > lines.length * 0.1) smudges.push('trailing-whitespace')

  return Array.from(new Set(smudges))
}

// ─── Stroke Analysis ─────────────────────────────────────────────────────────

/**
 * Analyze a single file's writing quality
 * @example
 * analyzeStroke('export function add(a: number, b: number) { return a + b }', 'math.ts') // InkStroke
 */
export function analyzeStroke(content: string, filePath: string): InkStroke {
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)
  const totalLines = codeLines.length

  // Manuscript metrics
  const paragraphs = countParagraphs(content)
  const sentences = countSentences(content)
  const words = countIdentifiers(content)
  const punctuation = countOperators(content)
  const avgSentenceLength = sentences > 0 ? Math.round(words / sentences) : 0
  const avgParagraphCohesion = computeParagraphCohesion(content)

  // Quality metrics
  const strokeQuality = computeStrokeQuality(content, totalLines)
  const inkDensity = computeInkDensity(content, totalLines)
  const flow = computeFlow(content, totalLines)
  const penmanship = computePenmanship(content, totalLines)
  const readabilityScore = computeReadability(strokeQuality, inkDensity, flow, penmanship)

  const inkColor = classifyInkColor(readabilityScore)
  const strokeType = classifyStrokeType(strokeQuality, inkDensity)
  const classification = classifyStroke(readabilityScore)

  const blemishes = identifyBlemishes(content)
  const flourishes = identifyFlourishes(content)
  const inkBlots = identifyInkBlots(content)
  const drySpots = identifyDrySpots(content)
  const smudges = identifySmudges(content)

  return {
    file: filePath,
    strokeQuality,
    inkDensity,
    flow,
    penmanship,
    inkColor,
    strokeType,
    manuscript: {
      paragraphs,
      sentences,
      words,
      punctuation,
      avgSentenceLength,
      avgParagraphCohesion,
    },
    blemishes,
    flourishes,
    inkBlots,
    drySpots,
    smudges,
    classification,
    readabilityScore,
  }
}

// ─── Manuscript Metrics ──────────────────────────────────────────────────────

function countParagraphs(content: string): number {
  const blocks = content.split(/\n\s*\n/)
  return blocks.filter(b => b.trim().length > 0).length
}

function countSentences(content: string): number {
  const matches = content.match(/;/g)
  const braces = content.match(/\{/g)
  return (matches?.length ?? 0) + (braces?.length ?? 0)
}

function countIdentifiers(content: string): number {
  const matches = content.match(IDENTIFIER_RE)
  return matches?.length ?? 0
}

function countOperators(content: string): number {
  const matches = content.match(OPERATOR_RE)
  return matches?.length ?? 0
}

function computeParagraphCohesion(content: string): number {
  const imports = (content.match(IMPORT_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  if (imports === 0 && exports === 0) return 30
  return Math.min(100, Math.round((imports * 5 + exports * 10)))
}

// ─── Quality Metrics ─────────────────────────────────────────────────────────

function computeStrokeQuality(content: string, totalLines: number): number {
  if (totalLines === 0) return 0
  let score = 50

  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length

  score += Math.min(20, (functions + arrows) * 3)
  score += Math.min(15, (interfaces + types) * 5)
  score += Math.min(10, exports * 2)
  score += Math.min(10, jsdoc * 3)

  // Penalties
  const blemishes = identifyBlemishes(content)
  score -= blemishes.length * 8
  const blots = identifyInkBlots(content)
  score -= blots.length * 5

  if (totalLines > 0 && totalLines < 10) score -= 10

  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeInkDensity(content: string, totalLines: number): number {
  if (totalLines === 0) return 0

  const blankLines = content.split('\n').filter(l => l.trim().length === 0).length
  const blankRatio = blankLines / totalLines
  const commentLines = content.split('\n').filter(l => l.trim().startsWith('//') || l.trim().startsWith('*')).length
  const commentRatio = commentLines / totalLines

  const identifiers = countIdentifiers(content)
  const density = identifiers / totalLines

  let score = 50
  // Good density: some blank lines, some comments, lots of identifiers
  if (blankRatio < 0.15) score += 15
  else if (blankRatio < 0.3) score += 10
  else score -= 5

  if (commentRatio < 0.3 && commentRatio > 0.05) score += 10
  else if (commentRatio === 0) score -= 5

  if (density > 3 && density < 12) score += 15
  else if (density > 2) score += 8
  else score -= 5

  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeFlow(content: string, totalLines: number): number {
  if (totalLines === 0) return 0

  let score = 60
  const guardClauses = (content.match(GUARD_CLAUSE_RE) ?? []).length
  const earlyReturns = (content.match(/\breturn\b/g) ?? []).length
  const asyncCount = (content.match(/async\s+/g) ?? []).length
  const tryCatch = (content.match(/try\s*\{/g) ?? []).length
  const optionalChain = (content.match(OPTIONAL_CHAIN_RE) ?? []).length

  score += Math.min(15, guardClauses * 5)
  score += Math.min(10, earlyReturns * 2)
  score += Math.min(10, optionalChain * 3)
  score += Math.min(5, tryCatch * 3)

  const deepNesting = identifyInkBlots(content).includes('deep-nesting')
  if (deepNesting) score -= 15

  const longLines = content.split('\n').filter(l => l.trim().length > LONG_LINE_INDICATOR).length
  score -= Math.min(10, longLines)

  return Math.min(100, Math.max(0, Math.round(score)))
}

function computePenmanship(content: string, totalLines: number): number {
  if (totalLines === 0) return 0

  let score = 60
  const constUsage = (content.match(/\bconst\s+/g) ?? []).length
  const letUsage = (content.match(/\blet\s+/g) ?? []).length
  const varUsage = (content.match(/\bvar\s+/g) ?? []).length
  const destructuring = (content.match(DESTRUCTURE_RE) ?? []).length
  const templateLiterals = (content.match(/`[^`]*\$\{/g) ?? []).length

  score += Math.min(10, constUsage * 2)
  score -= varUsage * 5
  score += Math.min(10, destructuring * 3)
  score += Math.min(5, templateLiterals * 2)

  // Consistent naming: camelCase
  const camelCase = (content.match(/\b[a-z][a-zA-Z0-9]*\b/g) ?? []).length
  const UPPER_SNAKE = (content.match(/\b[A-Z][A-Z0-9_]+\b/g) ?? []).length
  if (camelCase > UPPER_SNAKE * 2) score += 5

  const smudges = identifySmudges(content)
  score -= smudges.length * 8

  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeReadability(quality: number, density: number, flow: number, penmanship: number): number {
  return Math.round(quality * 0.3 + density * 0.2 + flow * 0.3 + penmanship * 0.2)
}

// ─── Classification Helpers ──────────────────────────────────────────────────

function classifyInkColor(readability: number): InkStroke['inkColor'] {
  if (readability >= 80) return 'gold'
  if (readability >= 60) return 'black'
  if (readability >= 40) return 'blue'
  if (readability >= 20) return 'red'
  return 'invisible'
}

function classifyStrokeType(quality: number, density: number): InkStroke['strokeType'] {
  const avg = (quality + density) / 2
  if (avg >= 75) return 'bold'
  if (avg >= 50) return 'regular'
  if (avg >= 30) return 'light'
  if (avg >= 15) return 'faded'
  if (avg >= 5) return 'blotted'
  return 'invisible'
}

function classifyStroke(readability: number): InkStroke['classification'] {
  if (readability >= 85) return 'masterwork'
  if (readability >= 70) return 'fine-craft'
  if (readability >= 50) return 'legible'
  if (readability >= 30) return 'rough-draft'
  if (readability >= 15) return 'scribble'
  return 'illegible'
}

// ─── Ink Bottle Analysis ─────────────────────────────────────────────────────

/**
 * Analyze a directory's ink quality
 * @example
 * analyzeInkBottle(strokes, 'src') // InkBottle
 */
export function analyzeInkBottle(strokes: InkStroke[], dirPath: string): InkBottle {
  const inkQuality = strokes.length > 0
    ? Math.round(strokes.reduce((s, st) => s + st.strokeQuality, 0) / strokes.length)
    : 0

  const totalLines = strokes.reduce((s, st) => s + st.manuscript.sentences, 0)
  const totalWords = strokes.reduce((s, st) => s + st.manuscript.words, 0)
  const bottleFullness = totalWords > 0 ? Math.min(100, Math.round((totalLines / totalWords) * 50)) : 0

  const colorCounts = new Map<string, number>()
  const typeCounts = new Map<string, number>()
  for (const st of strokes) {
    colorCounts.set(st.inkColor, (colorCounts.get(st.inkColor) ?? 0) + 1)
    typeCounts.set(st.strokeType, (typeCounts.get(st.strokeType) ?? 0) + 1)
  }

  let dominantInkColor = 'black'
  let maxColor = 0
  for (const [color, count] of colorCounts) {
    if (count > maxColor) { maxColor = count; dominantInkColor = color }
  }

  let dominantStrokeType = 'regular'
  let maxType = 0
  for (const [type, count] of typeCounts) {
    if (count > maxType) { maxType = count; dominantStrokeType = type }
  }

  const avgReadability = strokes.length > 0
    ? Math.round(strokes.reduce((s, st) => s + st.readabilityScore, 0) / strokes.length)
    : 0

  const totalBlemishes = strokes.reduce((s, st) => s + st.blemishes.length, 0)
  const totalFlourishes = strokes.reduce((s, st) => s + st.flourishes.length, 0)
  const totalInkBlots = strokes.reduce((s, st) => s + st.inkBlots.length, 0)
  const totalDrySpots = strokes.reduce((s, st) => s + st.drySpots.length, 0)
  const totalSmudges = strokes.reduce((s, st) => s + st.smudges.length, 0)

  const condition = classifyBottleCondition(inkQuality, avgReadability, totalBlemishes + totalInkBlots)

  return {
    directory: dirPath,
    strokes,
    inkQuality,
    bottleFullness,
    dominantInkColor,
    dominantStrokeType,
    avgReadability,
    totalBlemishes,
    totalFlourishes,
    totalInkBlots,
    totalDrySpots,
    totalSmudges,
    condition,
  }
}

function classifyBottleCondition(quality: number, readability: number, issues: number): InkBottle['condition'] {
  if (quality >= 75 && readability >= 70 && issues < 3) return 'pristine'
  if (quality >= 60 && readability >= 50) return 'good'
  if (quality >= 40 && readability >= 30) return 'fair'
  if (quality >= 25) return 'worn'
  if (quality >= 10) return 'damaged'
  return 'ruined'
}

// ─── Stats & Grades ──────────────────────────────────────────────────────────

/**
 * Classify overall manuscript condition
 * @example
 * computeManuscriptCondition(strokes) // 'well-preserved'
 */
export function computeManuscriptCondition(strokes: InkStroke[]): InkwellStats['manuscriptCondition'] {
  if (strokes.length === 0) return 'damaged'
  const avg = strokes.reduce((s, st) => s + st.readabilityScore, 0) / strokes.length
  const illegibles = strokes.filter(st => st.classification === 'illegible' || st.classification === 'scribble').length
  const ratio = illegibles / strokes.length

  if (avg >= 75 && ratio < 0.1) return 'pristine'
  if (avg >= 60 && ratio < 0.2) return 'well-preserved'
  if (avg >= 40 && ratio < 0.4) return 'fair'
  if (avg >= 25) return 'worn'
  if (avg >= 15) return 'deteriorating'
  return 'damaged'
}

/**
 * Classify penmanship grade from average quality
 * @example
 * classifyPenmanshipGrade(85) // 'A'
 */
export function classifyPenmanshipGrade(avgQuality: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (avgQuality >= 80) return 'A'
  if (avgQuality >= 60) return 'B'
  if (avgQuality >= 40) return 'C'
  if (avgQuality >= 20) return 'D'
  return 'F'
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations for improving ink quality
 * @example
 * generateRecommendations(strokes, bottles, stats) // string[]
 */
export function generateRecommendations(
  strokes: InkStroke[],
  _bottles: InkBottle[],
  stats: InkwellStats,
): string[] {
  const recs: string[] = []

  if (stats.scribbles > stats.masterworks) recs.push('More scribbles than masterworks - focus on code clarity')
  if (stats.totalInkBlots > 5) recs.push(`Clean up ${stats.totalInkBlots} ink blots (messy code patterns)`)
  if (stats.totalBlemishes > 5) recs.push(`Address ${stats.totalBlemishes} code blemishes (smells and anti-patterns)`)
  if (stats.totalDrySpots > 3) recs.push(`Add documentation to ${stats.totalDrySpots} dry spots`)
  if (stats.totalSmudges > 0) recs.push(`Fix ${stats.totalSmudges} formatting smudges for consistent style`)
  if (stats.avgPenmanship < 40) recs.push('Penmanship is poor - improve naming and formatting')
  if (stats.avgFlow < 40) recs.push('Code flow is disrupted - reduce nesting and add guard clauses')
  if (stats.illegibles > 0) recs.push(`${stats.illegibles} illegible file(s) need rewriting`)

  if (recs.length === 0) recs.push('Ink quality is excellent - maintain current writing standards')

  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete inkwell analysis result
 * @example
 * buildInkwellResult(files, contents, {}) // InkwellResult
 */
export function buildInkwellResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): InkwellResult {
  const strokes: InkStroke[] = []
  for (let i = 0; i < files.length; i++) {
    strokes.push(analyzeStroke(contents[i], files[i]))
  }

  const dirMap = new Map<string, InkStroke[]>()
  for (const stroke of strokes) {
    const normalized = stroke.file.replace(/\\/g, '/')
    const dir = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) existing.push(stroke)
    else dirMap.set(dir, [stroke])
  }

  const bottles: InkBottle[] = []
  for (const [dir, dirStrokes] of dirMap) {
    bottles.push(analyzeInkBottle(dirStrokes, dir))
  }

  const stats = computeStats(strokes, bottles)
  const recommendations = generateRecommendations(strokes, bottles, stats)

  return { strokes, bottles, stats, recommendations }
}

function computeStats(strokes: InkStroke[], bottles: InkBottle[]): InkwellStats {
  const totalFiles = strokes.length
  const totalBottles = bottles.length

  const avgStrokeQuality = totalFiles > 0
    ? Math.round(strokes.reduce((s, st) => s + st.strokeQuality, 0) / totalFiles)
    : 0
  const avgInkDensity = totalFiles > 0
    ? Math.round(strokes.reduce((s, st) => s + st.inkDensity, 0) / totalFiles)
    : 0
  const avgFlow = totalFiles > 0
    ? Math.round(strokes.reduce((s, st) => s + st.flow, 0) / totalFiles)
    : 0
  const avgPenmanship = totalFiles > 0
    ? Math.round(strokes.reduce((s, st) => s + st.penmanship, 0) / totalFiles)
    : 0
  const avgReadability = totalFiles > 0
    ? Math.round(strokes.reduce((s, st) => s + st.readabilityScore, 0) / totalFiles)
    : 0

  const masterworks = strokes.filter(st => st.classification === 'masterwork').length
  const fineCrafts = strokes.filter(st => st.classification === 'fine-craft').length
  const scribbles = strokes.filter(st => st.classification === 'scribble').length
  const illegibles = strokes.filter(st => st.classification === 'illegible').length

  const totalBlemishes = strokes.reduce((s, st) => s + st.blemishes.length, 0)
  const totalFlourishes = strokes.reduce((s, st) => s + st.flourishes.length, 0)
  const totalInkBlots = strokes.reduce((s, st) => s + st.inkBlots.length, 0)
  const totalDrySpots = strokes.reduce((s, st) => s + st.drySpots.length, 0)
  const totalSmudges = strokes.reduce((s, st) => s + st.smudges.length, 0)

  const overallInkQuality = Math.round(
    avgStrokeQuality * 0.3 + avgInkDensity * 0.2 + avgFlow * 0.25 + avgPenmanship * 0.25,
  )

  const colorCounts = new Map<string, number>()
  for (const st of strokes) {
    colorCounts.set(st.inkColor, (colorCounts.get(st.inkColor) ?? 0) + 1)
  }
  let dominantInkColor = 'black'
  let maxColor = 0
  for (const [color, count] of colorCounts) {
    if (count > maxColor) { maxColor = count; dominantInkColor = color }
  }

  const manuscriptCondition = computeManuscriptCondition(strokes)
  const penmanshipGrade = classifyPenmanshipGrade(avgStrokeQuality)

  const sortedByReadability = [...strokes].sort((a, b) => b.readabilityScore - a.readabilityScore)
  const bestWrittenFile = sortedByReadability.length > 0 ? sortedByReadability[0].file : 'none'
  const worstWrittenFile = sortedByReadability.length > 0 ? sortedByReadability[sortedByReadability.length - 1].file : 'none'

  return {
    totalFiles,
    totalBottles,
    avgStrokeQuality,
    avgInkDensity,
    avgFlow,
    avgPenmanship,
    avgReadability,
    masterworks,
    fineCrafts,
    scribbles,
    illegibles,
    totalBlemishes,
    totalFlourishes,
    totalInkBlots,
    totalDrySpots,
    totalSmudges,
    overallInkQuality,
    dominantInkColor,
    manuscriptCondition,
    penmanshipGrade,
    bestWrittenFile,
    worstWrittenFile,
  }
}
