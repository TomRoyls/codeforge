// ─── Types ──────────────────────────────────────────────────────────────────────

export type VintageClassification = 'grand-cru' | 'premier-cru' | 'cru-bourgeois' | 'table-wine' | 'vinegar'
export type OverallVintage = 'legendary' | 'excellent' | 'good' | 'mediocre' | 'plonk'
export type BlendGrade = 'exceptional-blend' | 'well-blended' | 'balanced' | 'rough-blend' | 'mismatched'

export interface Vintage {
  file: string
  year: string
  quality: number
  body: number
  clarity: number
  finish: number
  balance: number
  terroir: string
  agingPotential: number
  isCorked: boolean
  isVinegar: boolean
  classification: VintageClassification
  tastingNotes: string[]
}

export interface BlendComponent {
  file: string
  contribution: string
  strength: number
  harmony: number
}

export interface Blend {
  name: string
  components: BlendComponent[]
  harmony: number
  balance: number
  complexity: number
  tastingNotes: string[]
  grade: BlendGrade
}

export interface Terroir {
  name: string
  characteristics: string[]
  files: string[]
  avgQuality: number
  influence: string
}

export interface VineyardStats {
  totalVintages: number
  grandCruCount: number
  vinegarCount: number
  corkedCount: number
  avgQuality: number
  avgBody: number
  avgClarity: number
  avgFinish: number
  avgBalance: number
  avgAgingPotential: number
  totalBlends: number
  exceptionalBlends: number
  mismatchedBlends: number
  avgBlendHarmony: number
  totalTerroirs: number
  bestTerroir: string
  worstTerroir: string
  overallVintage: OverallVintage
  cellarRating: number
  agingIndex: number
  blendQuality: number
}

export interface VineyardResult {
  vintages: Vintage[]
  blends: Blend[]
  terroirs: Terroir[]
  stats: VineyardStats
  recommendations: string[]
}

// ─── evaluateVintage ────────────────────────────────────────────────────────────

/**
 * Evaluate code vintage quality
 * @example
 * evaluateVintage('export function f(): number { return 1 }', 'a.ts') // Vintage
 */
export function evaluateVintage(content: string, filePath: string): Vintage {
  const quality = computeQuality(content)
  const body = computeBody(content)
  const clarity = computeClarity(content)
  const finish = computeFinish(content)
  const balance = computeBalance(content)
  const terroir = detectTerroirName(filePath)
  const agingPotential = assessAgingPotential(quality, balance, clarity)
  const isCorked = detectCorked(content)
  const isVinegar = detectVinegar(content, filePath)
  const classification = classifyVintage(quality, body, clarity)
  const tastingNotes = generateTastingNotes(quality, body, clarity, finish, balance, isCorked, isVinegar)
  const year = estimateYear(content, quality)

  return {
    file: filePath,
    year,
    quality,
    body,
    clarity,
    finish,
    balance,
    terroir,
    agingPotential,
    isCorked,
    isVinegar,
    classification,
    tastingNotes,
  }
}

// ─── computeQuality ─────────────────────────────────────────────────────────────

function computeQuality(content: string): number {
  let score = 40
  const exports = (content.match(/export\s+(function|class|const|interface|type)/g) || []).length
  if (exports > 0) score += 10

  const hasTypes = /:\s*(string|number|boolean|void|Promise)/.test(content)
  if (hasTypes) score += 10

  const hasDocs = /\/\*\*/.test(content)
  if (hasDocs) score += 10

  const hasErrorHandling = /try\s*\{|catch\s*\(|\.catch\(/.test(content)
  if (hasErrorHandling) score += 10

  const hasTests = /test\(|describe\(|it\(|expect\(/.test(content)
  if (hasTests) score += 10

  const hasAny = /:\s*any\b/.test(content)
  if (hasAny) score -= 10

  const hasConsole = /console\.(log|warn|error)/.test(content)
  if (hasConsole) score -= 5

  return Math.max(0, Math.min(100, score))
}

// ─── computeBody ────────────────────────────────────────────────────────────────

function computeBody(content: string): number {
  let score = 30
  const functions = (content.match(/function\s+\w+|const\s+\w+\s*=\s*(?:\(|function)/g) || []).length
  score += Math.min(20, functions * 5)

  const classes = (content.match(/class\s+\w+/g) || []).length
  score += Math.min(15, classes * 5)

  const interfaces = (content.match(/interface\s+\w+/g) || []).length
  score += Math.min(15, interfaces * 5)

  const lines = content.split('\n').length
  if (lines > 200) score -= 10

  return Math.max(0, Math.min(100, score))
}

// ─── computeClarity ─────────────────────────────────────────────────────────────

function computeClarity(content: string): number {
  let score = 35
  const lines = content.split('\n')
  const avgLen = lines.reduce((s, l) => s + l.length, 0) / Math.max(1, lines.length)

  if (avgLen < 80) score += 15
  else if (avgLen < 100) score += 10
  else score -= 5

  const descriptiveNames = (content.match(/(?:function|const|class|interface)\s+[a-z]{4,}/gi) || []).length
  if (descriptiveNames > 0) score += 15

  const hasComments = (content.match(/\/\//g) || []).length
  if (hasComments > 0 && hasComments < lines.length * 0.4) score += 10

  const hasJsdoc = /\/\*\*/.test(content)
  if (hasJsdoc) score += 10

  const hasAny = /:\s*any\b/.test(content)
  if (hasAny) score -= 10

  return Math.max(0, Math.min(100, score))
}

// ─── computeFinish ──────────────────────────────────────────────────────────────

function computeFinish(content: string): number {
  let score = 25
  const jsdoc = (content.match(/\/\*\*/g) || []).length
  score += Math.min(25, jsdoc * 5)

  const inlineComments = (content.match(/\/\//g) || []).length
  score += Math.min(15, inlineComments * 3)

  const hasExamples = /@example/.test(content)
  if (hasExamples) score += 15

  const hasParams = /@param/.test(content)
  if (hasParams) score += 10

  const hasReturns = /@returns/.test(content)
  if (hasReturns) score += 10

  return Math.max(0, Math.min(100, score))
}

// ─── computeBalance ─────────────────────────────────────────────────────────────

function computeBalance(content: string): number {
  let score = 40
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith('//')).length
  const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('/*') || l.trim().startsWith('*')).length

  if (codeLines > 0) {
    const ratio = commentLines / codeLines
    if (ratio > 0.1 && ratio < 0.5) score += 15
    else if (ratio >= 0.5) score -= 5
  }

  const exports = (content.match(/export\s/g) || []).length
  if (exports > 0 && exports < 15) score += 10
  if (exports >= 15) score -= 10

  const imports = (content.match(/import\s/g) || []).length
  if (imports > 0 && imports < 10) score += 10
  if (imports >= 10) score -= 5

  const functions = (content.match(/function\s|=>/g) || []).length
  if (functions > 0 && functions < 20) score += 10
  if (functions >= 20) score -= 10

  return Math.max(0, Math.min(100, score))
}

// ─── detectTerroirName ──────────────────────────────────────────────────────────

function detectTerroirName(filePath: string): string {
  const parts = filePath.split('/')
  if (parts.length > 1) return parts[0] ?? 'root'
  return 'root'
}

// ─── estimateYear ───────────────────────────────────────────────────────────────

function estimateYear(_content: string, quality: number): string {
  if (quality >= 80) return 'reserve'
  if (quality >= 65) return 'current'
  if (quality >= 50) return 'recent'
  if (quality >= 35) return 'aged'
  return 'vintage-unknown'
}

// ─── generateTastingNotes ───────────────────────────────────────────────────────

function generateTastingNotes(
  quality: number,
  body: number,
  clarity: number,
  finish: number,
  balance: number,
  isCorked: boolean,
  isVinegar: boolean,
): string[] {
  const notes: string[] = []

  if (isCorked) notes.push('Corked - fundamentally flawed')
  if (isVinegar) notes.push('Turned to vinegar - deprecated patterns detected')
  if (quality >= 80) notes.push('Exceptional quality - well-crafted code')
  if (quality < 40) notes.push('Poor quality - needs significant improvement')
  if (body >= 75) notes.push('Full-bodied - rich functionality')
  if (body < 35) notes.push('Light-bodied - minimal functionality')
  if (clarity >= 75) notes.push('Crystal clear - excellent readability')
  if (clarity < 35) notes.push('Cloudy - hard to read')
  if (finish >= 75) notes.push('Long finish - thorough documentation')
  if (finish < 35) notes.push('Short finish - lacks documentation')
  if (balance >= 75) notes.push('Well-balanced - harmonious code structure')
  if (balance < 35) notes.push('Unbalanced - disproportionate elements')

  return notes
}

// ─── assessAgingPotential ───────────────────────────────────────────────────────

/**
 * Assess aging potential 0-100
 * @example
 * assessAgingPotential(80, 75, 70) // 78
 */
export function assessAgingPotential(quality: number, balance: number, clarity: number): number {
  let score = 30
  score += quality * 0.3
  score += balance * 0.2
  score += clarity * 0.2
  return Math.max(0, Math.min(100, Math.round(score)))
}

// ─── detectCorked ───────────────────────────────────────────────────────────────

/**
 * Detect fundamentally flawed code
 * @example
 * detectCorked('eval("code")') // true
 */
export function detectCorked(content: string): boolean {
  const hasEval = /\beval\s*\(/.test(content)
  const hasAny = /:\s*any\b/.test(content) && /export/.test(content)
  const hasTsIgnore = /\/\/\s*@ts-ignore|\/\/\s*@ts-expect-error/.test(content)
  const hasUnsafeCast = /as\s+any/.test(content)
  const hasWith = /\bwith\s*\(/.test(content)
  const hasDebugger = /\bdebugger\b/.test(content)

  let corkCount = 0
  if (hasEval) corkCount++
  if (hasAny) corkCount++
  if (hasTsIgnore) corkCount++
  if (hasUnsafeCast) corkCount++
  if (hasWith) corkCount++
  if (hasDebugger) corkCount++

  return corkCount >= 2
}

// ─── detectVinegar ──────────────────────────────────────────────────────────────

/**
 * Detect turned-bad code
 * @example
 * detectVinegar('var x = 1', 'a.ts') // true
 */
export function detectVinegar(content: string, _filePath: string): boolean {
  const hasVar = /\bvar\s/.test(content)
  const hasDeprecated = /@deprecated|DEPRECATED|obsolete|legacy/i.test(content)
  const hasCallbackHell = /\}\s*,\s*function\s*\(/.test(content)
  const hasRequire = /\brequire\s*\(/.test(content) && !/import/.test(content)

  let vinegarCount = 0
  if (hasVar) vinegarCount++
  if (hasDeprecated) vinegarCount++
  if (hasCallbackHell) vinegarCount++
  if (hasRequire) vinegarCount++

  return vinegarCount >= 2
}

// ─── classifyVintage ────────────────────────────────────────────────────────────

/**
 * Classify vintage quality
 * @example
 * classifyVintage(90, 85, 80) // 'grand-cru'
 */
export function classifyVintage(quality: number, body: number, clarity: number): VintageClassification {
  const avg = (quality + body + clarity) / 3
  if (avg >= 75) return 'grand-cru'
  if (avg >= 60) return 'premier-cru'
  if (avg >= 45) return 'cru-bourgeois'
  if (avg >= 30) return 'table-wine'
  return 'vinegar'
}

// ─── analyzeBlend ───────────────────────────────────────────────────────────────

/**
 * Analyze how well files blend together
 * @example
 * analyzeBlend(['a.ts', 'b.ts'], ['export function f() {}', 'interface A {}'], 'src') // Blend
 */
export function analyzeBlend(files: string[], contents: string[], dirPath: string): Blend {
  const components: BlendComponent[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i]
    const contribution = detectContribution(content ?? '')
    const strength = computeStrength(content ?? '')
    const harmony = computeHarmony(content ?? '', contents)
    components.push({ file: files[i] ?? '', contribution, strength, harmony })
  }

  const harmony = components.length > 0
    ? Math.round(components.reduce((s, c) => s + c.harmony, 0) / components.length)
    : 50
  const balance = components.length > 0
    ? Math.round(components.reduce((s, c) => s + c.strength, 0) / components.length)
    : 50
  const complexity = computeBlendComplexity(contents)
  const grade = classifyBlend(harmony, balance, complexity)
  const tastingNotes = generateBlendNotes(harmony, balance, complexity, grade)

  return { name: dirPath, components, harmony, balance, complexity, tastingNotes, grade }
}

function detectContribution(content: string): string {
  if (/export\s+function/.test(content)) return 'behavior'
  if (/interface\s+\w+/.test(content)) return 'types'
  if (/class\s+\w+/.test(content)) return 'structure'
  if (/export\s+const/.test(content)) return 'values'
  return 'utility'
}

function computeStrength(content: string): number {
  let score = 30
  const exports = (content.match(/export\s/g) || []).length
  score += Math.min(30, exports * 10)
  const lines = content.split('\n').filter(l => l.trim().length > 0).length
  score += Math.min(20, Math.round(lines / 10))
  const types = (content.match(/:\s*\w+/g) || []).length
  score += Math.min(20, types * 2)
  return Math.max(0, Math.min(100, score))
}

function computeHarmony(content: string, allContents: string[]): number {
  let score = 40
  const hasExports = /export\s/.test(content)
  const hasImports = /import\s/.test(content)
  if (hasExports && hasImports) score += 15
  else if (hasExports || hasImports) score += 5

  const usesInterfaces = allContents.some(c => /interface\s+\w+/.test(c))
  const hasTypes = /:\s*(string|number|boolean|void|Promise)/.test(content)
  if (usesInterfaces && hasTypes) score += 15

  const usesConsistentStyle = allContents.every(c =>
    (/export\s+function/.test(c) && /export\s+function/.test(content)) ||
    (!/export\s+function/.test(c) || !/export\s+function/.test(content))
  )
  if (usesConsistentStyle && allContents.length > 1) score += 10

  const hasDocs = /\/\*\*/.test(content)
  const othersHaveDocs = allContents.filter(c => /\/\*\*/.test(c)).length
  if ((hasDocs && othersHaveDocs > 1) || (!hasDocs && othersHaveDocs === 0)) score += 10

  return Math.max(0, Math.min(100, score))
}

function computeBlendComplexity(contents: string[]): number {
  let totalSymbols = 0
  for (const c of contents) {
    totalSymbols += (c.match(/function\s|class\s|interface\s|type\s|const\s|export\s/g) || []).length
  }
  return Math.max(0, Math.min(100, Math.round(totalSymbols / contents.length * 5)))
}

function classifyBlend(harmony: number, balance: number, complexity: number): BlendGrade {
  const avg = (harmony + balance) / 2
  if (avg >= 80 && complexity >= 40) return 'exceptional-blend'
  if (avg >= 65) return 'well-blended'
  if (avg >= 50) return 'balanced'
  if (avg >= 35) return 'rough-blend'
  return 'mismatched'
}

function generateBlendNotes(harmony: number, balance: number, complexity: number, grade: BlendGrade): string[] {
  const notes: string[] = []
  if (grade === 'exceptional-blend') notes.push('Exceptional synergy between components')
  if (harmony >= 75) notes.push('Components work in harmony')
  if (harmony < 35) notes.push('Components conflict with each other')
  if (balance >= 75) notes.push('Each component contributes equally')
  if (balance < 35) notes.push('Unbalanced contributions')
  if (complexity >= 70) notes.push('Rich complexity in the blend')
  if (complexity < 30) notes.push('Simple blend with minimal complexity')
  return notes
}

// ─── analyzeTerroir ─────────────────────────────────────────────────────────────

/**
 * Analyze environmental context
 * @example
 * analyzeTerroir(['a.ts'], ['export function f() {}'], 'src') // Terroir
 */
export function analyzeTerroir(files: string[], contents: string[], dirPath: string): Terroir {
  const characteristics: string[] = []

  const hasTypescript = files.some(f => /\.tsx?$/.test(f))
  if (hasTypescript) characteristics.push('typescript-ecosystem')

  const hasTests = contents.some(c => /test\(|describe\(|it\(|expect\(/.test(c))
  if (hasTests) characteristics.push('test-culture')

  const hasDocs = contents.some(c => /\/\*\*/.test(c))
  if (hasDocs) characteristics.push('documentation-focused')

  const hasConfig = files.some(f => /config|setup|rc/.test(f))
  if (hasConfig) characteristics.push('configuration-heavy')

  const avgQuality = contents.length > 0
    ? Math.round(contents.reduce((s, c) => s + computeQuality(c), 0) / contents.length)
    : 50

  let influence = 'neutral'
  if (avgQuality >= 75) influence = 'elevating'
  else if (avgQuality >= 55) influence = 'supportive'
  else if (avgQuality < 35) influence = 'degrading'

  return { name: dirPath, characteristics, files, avgQuality, influence }
}

// ─── computeCellarRating ────────────────────────────────────────────────────────

/**
 * Compute cellar rating 0-100
 * @example
 * computeCellarRating(vintages, blends) // 75
 */
export function computeCellarRating(vintages: Vintage[], blends: Blend[]): number {
  if (vintages.length === 0) return 50

  const avgQuality = vintages.reduce((s, v) => s + v.quality, 0) / vintages.length
  const grandCruRatio = vintages.filter(v => v.classification === 'grand-cru').length / vintages.length
  const corkedPenalty = vintages.filter(v => v.isCorked).length * 10
  const vinegarPenalty = vintages.filter(v => v.isVinegar).length * 5

  let blendBonus = 0
  if (blends.length > 0) {
    blendBonus = blends.reduce((s, b) => s + b.harmony, 0) / blends.length * 0.2
  }

  const rating = avgQuality * 0.6 + grandCruRatio * 100 * 0.2 + blendBonus - corkedPenalty - vinegarPenalty
  return Math.max(0, Math.min(100, Math.round(rating)))
}

// ─── computeAgingIndex ──────────────────────────────────────────────────────────

/**
 * Compute aging index 0-100
 * @example
 * computeAgingIndex(vintages) // 65
 */
export function computeAgingIndex(vintages: Vintage[]): number {
  if (vintages.length === 0) return 50
  return Math.round(vintages.reduce((s, v) => s + v.agingPotential, 0) / vintages.length)
}

// ─── computeBlendQuality ────────────────────────────────────────────────────────

/**
 * Compute blend quality 0-100
 * @example
 * computeBlendQuality(blends) // 70
 */
export function computeBlendQuality(blends: Blend[]): number {
  if (blends.length === 0) return 50
  return Math.round(blends.reduce((s, b) => s + b.harmony, 0) / blends.length)
}

// ─── classifyOverall ────────────────────────────────────────────────────────────

/**
 * Classify overall vintage quality
 * @example
 * classifyOverall(85, 80) // 'legendary'
 */
export function classifyOverall(cellarRating: number, agingIndex: number): OverallVintage {
  const avg = (cellarRating + agingIndex) / 2
  if (avg >= 80) return 'legendary'
  if (avg >= 65) return 'excellent'
  if (avg >= 50) return 'good'
  if (avg >= 35) return 'mediocre'
  return 'plonk'
}

// ─── generateRecommendations ────────────────────────────────────────────────────

/**
 * Generate vineyard recommendations
 * @example
 * generateRecommendations(vintages, blends, terroirs, stats) // string[]
 */
export function generateRecommendations(
  vintages: Vintage[],
  blends: Blend[],
  terroirs: Terroir[],
  stats: VineyardStats,
): string[] {
  const recs: string[] = []

  const corkedFiles = vintages.filter(v => v.isCorked)
  if (corkedFiles.length > 0) {
    recs.push(`Investigate ${corkedFiles.length} corked file(s) for fundamental issues`)
  }

  const vinegarFiles = vintages.filter(v => v.isVinegar)
  if (vinegarFiles.length > 0) {
    recs.push(`Modernize or deprecate ${vinegarFiles.length} vinegar file(s)`)
  }

  const lowAging = vintages.filter(v => v.agingPotential < 40)
  if (lowAging.length > 0) {
    recs.push(`Improve aging potential of ${lowAging.length} file(s) with documentation and simplification`)
  }

  const mismatched = blends.filter(b => b.grade === 'mismatched')
  if (mismatched.length > 0) {
    recs.push(`Establish consistent patterns in ${mismatched.length} mismatched blend(s)`)
  }

  const poorTerroirs = terroirs.filter(t => t.influence === 'degrading')
  if (poorTerroirs.length > 0) {
    recs.push(`Improve conventions in ${poorTerroirs.length} poor terroir(s): ${poorTerroirs.map(t => t.name).join(', ')}`)
  }

  if (stats.avgFinish < 40) {
    recs.push('Low documentation finish - add JSDoc and inline comments')
  }

  if (stats.avgClarity < 40) {
    recs.push('Low clarity scores - improve naming and reduce line length')
  }

  if (stats.cellarRating < 40) {
    recs.push('Cellar rating critically low - comprehensive code quality review needed')
  }

  return Array.from(new Set(recs))
}

// ─── buildVineyardResult ────────────────────────────────────────────────────────

/**
 * Build complete vineyard analysis result
 * @example
 * buildVineyardResult(['a.ts'], ['export function f() {}'], {}) // VineyardResult
 */
export function buildVineyardResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): VineyardResult {
  const vintages: Vintage[] = []

  for (let i = 0; i < files.length; i++) {
    vintages.push(evaluateVintage(contents[i] ?? '',files[i] ?? ''))
  }

  const dirMap = new Map<string, { files: string[]; contents: string[] }>()
  for (let i = 0; i < files.length; i++) {
    const dir = (files[i] ?? '').split('/').slice(0, -1).join('/') || 'root'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.files.push(files[i] ?? '')
      existing.contents.push(contents[i] ?? '')
    } else {
      dirMap.set(dir, { files: [files[i] ?? ''], contents: [contents[i] ?? ''] })
    }
  }

  const blends: Blend[] = []
  for (const [dir, data] of dirMap) {
    if (data.files.length > 1) {
      blends.push(analyzeBlend(data.files, data.contents, dir))
    }
  }

  const terroirs: Terroir[] = []
  for (const [dir, data] of dirMap) {
    terroirs.push(analyzeTerroir(data.files, data.contents, dir))
  }

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const grandCruCount = vintages.filter(v => v.classification === 'grand-cru').length
  const vinegarCount = vintages.filter(v => v.isVinegar).length
  const corkedCount = vintages.filter(v => v.isCorked).length
  const exceptionalBlends = blends.filter(b => b.grade === 'exceptional-blend').length
  const mismatchedBlends = blends.filter(b => b.grade === 'mismatched').length

  const cellarRating = computeCellarRating(vintages, blends)
  const agingIndex = computeAgingIndex(vintages)
  const blendQuality = computeBlendQuality(blends)
  const overallVintage = classifyOverall(cellarRating, agingIndex)

  const bestTerroir = terroirs.length > 0
    ? terroirs.reduce((best, t) => t.avgQuality > best.avgQuality ? t : best).name
    : 'none'
  const worstTerroir = terroirs.length > 0
    ? terroirs.reduce((worst, t) => t.avgQuality < worst.avgQuality ? t : worst).name
    : 'none'

  const stats: VineyardStats = {
    totalVintages: vintages.length,
    grandCruCount,
    vinegarCount,
    corkedCount,
    avgQuality: avg(vintages.map(v => v.quality)),
    avgBody: avg(vintages.map(v => v.body)),
    avgClarity: avg(vintages.map(v => v.clarity)),
    avgFinish: avg(vintages.map(v => v.finish)),
    avgBalance: avg(vintages.map(v => v.balance)),
    avgAgingPotential: avg(vintages.map(v => v.agingPotential)),
    totalBlends: blends.length,
    exceptionalBlends,
    mismatchedBlends,
    avgBlendHarmony: blends.length > 0 ? avg(blends.map(b => b.harmony)) : 50,
    totalTerroirs: terroirs.length,
    bestTerroir,
    worstTerroir,
    overallVintage,
    cellarRating,
    agingIndex,
    blendQuality,
  }

  const recommendations = generateRecommendations(vintages, blends, terroirs, stats)

  return { vintages, blends, terroirs, stats, recommendations }
}
