// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Inclusion {
  type: 'feather' | 'crystal' | 'cloud' | 'pinpoint' | 'laser-line' | 'cavity' | 'chip' | 'bruise'
  severity: 'minor' | 'moderate' | 'significant' | 'severe'
  location: string
  description: string
  visible: 'magnification' | 'loupe' | 'naked-eye' | 'obvious'
}

export interface Facets {
  total: number
  wellCut: number
  poorlyCut: number
  missing: number
  asymmetric: number
}

export interface LoupeFindings {
  surfaceScratches: number
  internalFractures: number
  cloudiness: number
  fluorescence: number
  phosphorescence: number
  foreignMaterial: number
}

export interface CutAngles {
  crown: number
  pavilion: number
  girdle: number
  table: number
}

export interface LightPerformance {
  refraction: number
  reflection: number
  dispersion: number
  scintillation: number
}

export interface Appraisal {
  value: number
  rarity: number
  demand: number
  investmentGrade: boolean
}

export interface GemstoneInspection {
  file: string
  clarity: number
  brilliance: number
  cutQuality: number
  caratWeight: number
  facetPrecision: number
  hardness: number
  luster: number
  gemType: 'diamond' | 'ruby' | 'sapphire' | 'emerald' | 'opal' | 'topaz' | 'quartz' | 'glass'
  clarityGrade: 'FL' | 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2' | 'SI1' | 'SI2' | 'I1' | 'I2' | 'I3'
  cutGrade: 'ideal' | 'excellent' | 'very-good' | 'good' | 'fair' | 'poor'
  colorGrade: 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M'
  inclusions: Inclusion[]
  facets: Facets
  loupeFindings: LoupeFindings
  cutAngles: CutAngles
  lightPerformance: LightPerformance
  appraisal: Appraisal
  condition: 'flawless' | 'excellent' | 'very-good' | 'good' | 'fair' | 'poor' | 'damaged' | 'shattered'
  qualityScore: number
}

export interface GemDisplay {
  directory: string
  gems: GemstoneInspection[]
  avgClarity: number
  avgBrilliance: number
  avgCutQuality: number
  avgCaratWeight: number
  dominantGemType: string
  flawlessCount: number
  damagedCount: number
  totalInclusions: number
  avgInclusionSeverity: number
  investmentGradeCount: number
  displayQuality: number
  displayGrade: 'museum' | 'gallery' | 'collection' | 'display' | 'pawn-shop' | 'rubble'
}

export interface MagnifyingLensStats {
  totalFiles: number
  totalDisplays: number
  avgClarity: number
  avgBrilliance: number
  avgCutQuality: number
  avgCaratWeight: number
  avgFacetPrecision: number
  avgHardness: number
  avgLuster: number
  flawlessGems: number
  excellentGems: number
  poorGems: number
  damagedGems: number
  shatteredGems: number
  diamondFiles: number
  glassFiles: number
  idealCuts: number
  poorCuts: number
  totalInclusions: number
  totalSurfaceScratches: number
  totalInternalFractures: number
  totalCloudiness: number
  totalFluorescence: number
  investmentGradeFiles: number
  overallBrilliance: number
  gemologistGrade: 'master-gemologist' | 'gemologist' | 'appraiser' | 'jeweler' | 'amateur' | 'blind'
  finestGem: string
  worstGem: string
  heaviestGem: string
  mostBrilliant: string
}

export interface MagnifyingLensResult {
  gems: GemstoneInspection[]
  displays: GemDisplay[]
  stats: MagnifyingLensStats
  recommendations: string[]
}

// ─── Content Analysis Primitives ─────────────────────────────────────────────

/**
 * Count meaningful lines vs total
 * @example
 * countMeaningfulLines('const x = 1\n\n// comment') // { total: 3, meaningful: 1 }
 */
export function countMeaningfulLines(content: string): { total: number; meaningful: number } {
  const lines = content.split('\n')
  const total = lines.length
  const meaningful = lines.filter(l => {
    const t = l.trim()
    return t.length > 0 && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*')
  }).length
  return { total, meaningful }
}

/**
 * Count branches in content
 * @example
 * countBranches('if (a) {} else if (b) {}') // 2
 */
export function countBranches(content: string): number {
  return (content.match(/\bif\s*\(/g) ?? []).length +
    (content.match(/\?\s*.+\s*:/g) ?? []).length +
    (content.match(/\bswitch\s*\(/g) ?? []).length
}

/**
 * Count error handling blocks
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{|\bcatch\s*\(|\.catch\s*\(|\bthrow\s+/g) ?? []).length
}

/**
 * Measure naming quality
 * @example
 * measureNamingQuality('const itemCount = 5') // number
 */
export function measureNamingQuality(content: string): number {
  const identifiers = content.match(/\b[a-zA-Z_]\w{2,}\b/g) ?? []
  if (identifiers.length === 0) return 50
  const short = identifiers.filter(id => id.length <= 2).length
  const long = identifiers.filter(id => id.length >= 30).length
  const ratio = 1 - (short + long) / identifiers.length
  return Math.round(ratio * 100)
}

/**
 * Count duplicate lines
 * @example
 * countDuplicateLines('a\na\nb') // 1
 */
export function countDuplicateLines(content: string): number {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const seen = new Map<string, number>()
  for (const line of lines) {
    seen.set(line, (seen.get(line) ?? 0) + 1)
  }
  return Array.from(seen.values()).filter(v => v > 1).reduce((s, v) => s + (v - 1), 0)
}

/**
 * Count TODO/FIXME markers
 * @example
 * countTodoMarkers('TODO: fix this') // 1
 */
export function countTodoMarkers(content: string): number {
  return (content.match(/TODO|FIXME|HACK|XXX|BUG/gi) ?? []).length
}

/**
 * Count console statements
 * @example
 * countConsoleStatements('console.log("a")') // 1
 */
export function countConsoleStatements(content: string): number {
  return (content.match(/console\.\w+\s*\(/g) ?? []).length
}

/**
 * Count empty catch blocks
 * @example
 * countEmptyCatchBlocks('try {} catch(e) {}') // 1
 */
export function countEmptyCatchBlocks(content: string): number {
  return (content.match(/\bcatch\s*\(\w*\)\s*\{\s*\}/g) ?? []).length
}

/**
 * Count deeply nested blocks (depth 4+)
 * @example
 * countDeepNesting('if(a){if(b){if(c){if(d){}}}}') // 1
 */
export function countDeepNesting(content: string): number {
  let depth = 0
  let count = 0
  for (const ch of content) {
    if (ch === '{') {
      depth++
      if (depth >= 4) count++
    } else if (ch === '}') {
      depth = Math.max(0, depth - 1)
    }
  }
  return count
}

// ─── Core Measurements ───────────────────────────────────────────────────────

/**
 * Measure clarity (code transparency)
 * @example
 * measureClarity('const itemCount = names.length') // number
 */
export function measureClarity(content: string): number {
  const { total, meaningful } = countMeaningfulLines(content)
  if (total === 0) return 0

  const namingScore = measureNamingQuality(content)
  const commentRatio = (() => {
    const commentLines = content.split('\n').filter(l => {
      const t = l.trim()
      return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')
    }).length
    return Math.min(100, Math.round((commentLines / Math.max(1, total)) * 200))
  })()

  const avgLineLength = (() => {
    const codeLines = content.split('\n').filter(l => l.trim().length > 0)
    if (codeLines.length === 0) return 0
    const totalLen = codeLines.reduce((s, l) => s + l.length, 0)
    const avg = totalLen / codeLines.length
    return avg <= 80 ? 30 : avg <= 120 ? 15 : 0
  })()

  const meaningfulRatio = Math.round((meaningful / total) * 40)

  return Math.min(100, namingScore * 0.3 + commentRatio * 0.1 + avgLineLength + meaningfulRatio)
}

/**
 * Measure brilliance (code elegance)
 * @example
 * measureBrilliance('const result = items.filter(isValid).map(transform)') // number
 */
export function measureBrilliance(content: string): number {
  const { total } = countMeaningfulLines(content)
  if (total === 0) return 0

  const hasChaining = /\.\w+\([^)]*\)\.\w+/.test(content) ? 15 : 0
  const hasDestructuring = /const\s*\{[^}]+\}\s*=/.test(content) ? 10 : 0
  const hasSpread = /\.\.\./.test(content) ? 10 : 0
  const hasOptionalChain = /\?\.\w/.test(content) ? 10 : 0
  const hasDefaultParams = /\(\s*\w+\s*=\s*/.test(content) ? 10 : 0
  const shortFunctions = (() => {
    const arrowShort = (content.match(/=>\s*[^{]/g) ?? []).length
    return Math.min(15, arrowShort * 5)
  })()
  const noVar = !/\bvar\s+/.test(content) ? 10 : 0
  const usesConst = /\bconst\s+/.test(content) ? 10 : 0

  return Math.min(100, hasChaining + hasDestructuring + hasSpread + hasOptionalChain + hasDefaultParams + shortFunctions + noVar + usesConst)
}

/**
 * Measure cut quality (code structure)
 * @example
 * measureCutQuality('function a() {}\nfunction b() {}') // number
 */
export function measureCutQuality(content: string): number {
  const { total } = countMeaningfulLines(content)
  if (total === 0) return 0

  const hasExports = /\bexport\b/.test(content) ? 15 : 0
  const hasImports = /\bimport\b/.test(content) ? 10 : 0
  const hasTypes = /:\s*(?:string|number|boolean|void)/.test(content) ? 15 : 0
  const hasErrorHandling = countErrorHandling(content) > 0 ? 15 : 0
  const lowNesting = countDeepNesting(content) === 0 ? 15 : 0
  const shortFile = total <= 50 ? 15 : total <= 100 ? 10 : total <= 200 ? 5 : 0

  return Math.min(100, hasExports + hasImports + hasTypes + hasErrorHandling + lowNesting + shortFile)
}

/**
 * Measure carat weight (code substance ratio)
 * @example
 * measureCaratWeight('const x = compute(y)') // number
 */
export function measureCaratWeight(content: string): number {
  const { total, meaningful } = countMeaningfulLines(content)
  if (total === 0) return 0
  return Math.round((meaningful / total) * 100)
}

/**
 * Measure facet precision (edge case handling)
 * @example
 * measureFacetPrecision('if (x === null) return') // number
 */
export function measureFacetPrecision(content: string): number {
  const branches = countBranches(content)
  const errorHandling = countErrorHandling(content)
  const hasNullCheck = /===?\s*null|!==?\s*null/.test(content) ? 15 : 0
  const hasTypeCheck = /typeof\s+\w+/.test(content) ? 15 : 0
  const hasDefaultCase = /\bdefault\s*:/.test(content) ? 10 : 0
  const hasFinally = /\bfinally\s*\{/.test(content) ? 10 : 0
  const emptyCatchPenalty = countEmptyCatchBlocks(content) > 0 ? 0 : 15

  const branchScore = branches > 0 ? Math.min(20, branches * 5) : 10

  return Math.min(100, branchScore + Math.min(20, errorHandling * 5) + hasNullCheck + hasTypeCheck + hasDefaultCase + hasFinally + emptyCatchPenalty)
}

/**
 * Measure hardness (robustness)
 * @example
 * measureHardness('try { x() } catch(e) { log(e) }') // number
 */
export function measureHardness(content: string): number {
  const { total } = countMeaningfulLines(content)
  if (total === 0) return 0

  const errorHandling = Math.min(30, countErrorHandling(content) * 10)
  const hasTypes = /:\s*(?:string|number|boolean|void|never)/.test(content) ? 20 : 0
  const hasStrictMode = /use strict|"strict"/.test(content) ? 10 : 0
  const noAny = !/\bany\b/.test(content) ? 15 : 0
  const noTsIgnore = !/@ts-ignore|@ts-expect-error/.test(content) ? 15 : 0
  const hasBoundaryCheck = />=|<=|===|!==/.test(content) ? 10 : 0

  return Math.min(100, errorHandling + hasTypes + hasStrictMode + noAny + noTsIgnore + hasBoundaryCheck)
}

/**
 * Measure luster (readability)
 * @example
 * measureLuster('function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0) }') // number
 */
export function measureLuster(content: string): number {
  const { total } = countMeaningfulLines(content)
  if (total === 0) return 0

  const naming = measureNamingQuality(content) * 0.3
  const consistentIndent = (() => {
    const lines = content.split('\n').filter(l => l.trim().length > 0)
    if (lines.length <= 1) return 20
    const spaces = lines.filter(l => l.startsWith('  ') && !l.startsWith('\t')).length
    const tabs = lines.filter(l => l.startsWith('\t')).length
    const consistent = spaces === 0 || tabs === 0
    return consistent ? 20 : 5
  })()

  const commentScore = Math.min(20, (content.match(/\/\//g) ?? []).length * 3)
  const spacing = (() => {
    const blankLines = content.split('\n\n').length - 1
    return Math.min(20, blankLines * 5)
  })()

  const avgLineLen = (() => {
    const codeLines = content.split('\n').filter(l => l.trim().length > 0)
    if (codeLines.length === 0) return 10
    const avg = codeLines.reduce((s, l) => s + l.length, 0) / codeLines.length
    return avg <= 100 ? 10 : 0
  })()

  return Math.min(100, Math.round(naming + consistentIndent + commentScore + spacing + avgLineLen))
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify gem type from overall quality
 * @example
 * classifyGemType(90) // 'diamond'
 */
export function classifyGemType(avgQuality: number): GemstoneInspection['gemType'] {
  if (avgQuality >= 80) return 'diamond'
  if (avgQuality >= 70) return 'ruby'
  if (avgQuality >= 60) return 'sapphire'
  if (avgQuality >= 50) return 'emerald'
  if (avgQuality >= 40) return 'topaz'
  if (avgQuality >= 30) return 'opal'
  if (avgQuality >= 20) return 'quartz'
  return 'glass'
}

/**
 * Classify clarity grade from issue count
 * @example
 * classifyClarityGrade(0) // 'FL'
 */
export function classifyClarityGrade(issueCount: number): GemstoneInspection['clarityGrade'] {
  if (issueCount === 0) return 'FL'
  if (issueCount <= 1) return 'IF'
  if (issueCount <= 2) return 'VVS1'
  if (issueCount <= 3) return 'VVS2'
  if (issueCount <= 5) return 'VS1'
  if (issueCount <= 7) return 'VS2'
  if (issueCount <= 10) return 'SI1'
  if (issueCount <= 13) return 'SI2'
  if (issueCount <= 17) return 'I1'
  if (issueCount <= 22) return 'I2'
  return 'I3'
}

/**
 * Classify cut grade from structure score
 * @example
 * classifyCutGrade(90) // 'ideal'
 */
export function classifyCutGrade(score: number): GemstoneInspection['cutGrade'] {
  if (score >= 85) return 'ideal'
  if (score >= 75) return 'excellent'
  if (score >= 65) return 'very-good'
  if (score >= 50) return 'good'
  if (score >= 30) return 'fair'
  return 'poor'
}

/**
 * Classify color grade from clarity score
 * @example
 * classifyColorGrade(95) // 'D'
 */
export function classifyColorGrade(clarity: number): GemstoneInspection['colorGrade'] {
  if (clarity >= 95) return 'D'
  if (clarity >= 88) return 'E'
  if (clarity >= 80) return 'F'
  if (clarity >= 72) return 'G'
  if (clarity >= 64) return 'H'
  if (clarity >= 56) return 'I'
  if (clarity >= 48) return 'J'
  if (clarity >= 36) return 'K'
  if (clarity >= 24) return 'L'
  return 'M'
}

/**
 * Classify gemologist grade from average brilliance
 * @example
 * classifyGemologistGrade(85) // 'master-gemologist'
 */
export function classifyGemologistGrade(avgBrilliance: number): MagnifyingLensStats['gemologistGrade'] {
  if (avgBrilliance >= 75) return 'master-gemologist'
  if (avgBrilliance >= 60) return 'gemologist'
  if (avgBrilliance >= 45) return 'appraiser'
  if (avgBrilliance >= 30) return 'jeweler'
  if (avgBrilliance >= 15) return 'amateur'
  return 'blind'
}

/**
 * Classify display grade from quality score
 * @example
 * classifyDisplayGrade(85) // 'museum'
 */
export function classifyDisplayGrade(quality: number): GemDisplay['displayGrade'] {
  if (quality >= 80) return 'museum'
  if (quality >= 65) return 'gallery'
  if (quality >= 50) return 'collection'
  if (quality >= 35) return 'display'
  if (quality >= 20) return 'pawn-shop'
  return 'rubble'
}

/**
 * Classify condition from quality score
 * @example
 * classifyCondition(95) // 'flawless'
 */
export function classifyCondition(qualityScore: number): GemstoneInspection['condition'] {
  if (qualityScore >= 90) return 'flawless'
  if (qualityScore >= 75) return 'excellent'
  if (qualityScore >= 60) return 'very-good'
  if (qualityScore >= 45) return 'good'
  if (qualityScore >= 30) return 'fair'
  if (qualityScore >= 20) return 'poor'
  if (qualityScore >= 10) return 'damaged'
  return 'shattered'
}

// ─── Inclusion Detection ─────────────────────────────────────────────────────

/**
 * Detect code issues as gemstone inclusions
 * @example
 * detectInclusions('console.log("debug")') // Inclusion[]
 */
export function detectInclusions(content: string): Inclusion[] {
  const inclusions: Inclusion[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1
    const t = line?.trim()

    if (/\bconsole\.\w+\s*\(/.test(t ?? '') && !/\bspec\b|\btest\b/.test(content.slice(Math.max(0, i - 5), i + 10))) {
      inclusions.push({
        type: 'pinpoint', severity: 'minor', location: `line ${lineNum}`,
        description: 'Console statement found', visible: 'loupe',
      })
    }

    if (/\bvar\s+/.test(t ?? '')) {
      inclusions.push({
        type: 'bruise', severity: 'moderate', location: `line ${lineNum}`,
        description: 'Var keyword used instead of const/let', visible: 'loupe',
      })
    }

    if (/\bany\b/.test(t ?? '') && !/\/\/|\/\*/.test(t ?? '')) {
      inclusions.push({
        type: 'cloud', severity: 'moderate', location: `line ${lineNum}`,
        description: 'Any type used', visible: 'magnification',
      })
    }

    if (/@ts-ignore|@ts-expect-error/.test(t ?? '')) {
      inclusions.push({
        type: 'cavity', severity: 'significant', location: `line ${lineNum}`,
        description: 'TypeScript suppression directive', visible: 'naked-eye',
      })
    }

    if (/\bcatch\s*\(\w*\)\s*\{\s*\}/.test(t ?? '')) {
      inclusions.push({
        type: 'cavity', severity: 'severe', location: `line ${lineNum}`,
        description: 'Empty catch block', visible: 'naked-eye',
      })
    }

    if (/TODO|FIXME|HACK|XXX/.test(t ?? '')) {
      inclusions.push({
        type: 'feather', severity: 'minor', location: `line ${lineNum}`,
        description: 'TODO/FIXME marker found', visible: 'magnification',
      })
    }
  }

  const dupes = countDuplicateLines(content)
  if (dupes > 3) {
    inclusions.push({
      type: 'crystal', severity: dupes > 10 ? 'significant' : 'moderate',
      location: 'multiple', description: `${dupes} duplicate lines found`, visible: 'loupe',
    })
  }

  if (countDeepNesting(content) > 0) {
    inclusions.push({
      type: 'laser-line', severity: 'moderate', location: 'structure',
      description: 'Deep nesting detected (4+ levels)', visible: 'loupe',
    })
  }

  return inclusions
}

// ─── Facet Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze branches/code paths as facets
 * @example
 * analyzeFacets('if (a) { x() } else { y() }') // Facets
 */
export function analyzeFacets(content: string): Facets {
  const total = countBranches(content)
  const errorHandling = countErrorHandling(content)
  const hasElse = (content.match(/\belse\s*\{/g) ?? []).length
  const hasDefaultCase = /\bdefault\s*:/.test(content)

  const wellCut = hasElse + (hasDefaultCase ? 1 : 0) + Math.min(total, Math.floor(errorHandling / 2))
  const poorlyCut = Math.max(0, total - wellCut - countEmptyCatchBlocks(content))
  const missing = countEmptyCatchBlocks(content)
  const asymmetric = Math.max(0, Math.floor((total - hasElse) / 3))

  return { total, wellCut, poorlyCut, missing, asymmetric }
}

// ─── Loupe Findings ──────────────────────────────────────────────────────────

/**
 * Measure loupe findings (surface-level scrutiny)
 * @example
 * measureLoupeFindings('  console.log("x")\nvar y = 1') // LoupeFindings
 */
export function measureLoupeFindings(content: string): LoupeFindings {
  const surfaceScratches = (() => {
    const lines = content.split('\n')
    let count = 0
    for (let i = 0; i < lines.length - 1; i++) {
      const curr = (lines[i] ?? '').trim()
      const next = (lines[i + 1] ?? '').trim()
      if (curr.length > 0 && next.length > 0 && (lines[i] ?? '').endsWith(' ') !== (lines[i + 1] ?? '').endsWith(' ')) {
        count++
      }
    }
    return count
  })()

  const internalFractures = countEmptyCatchBlocks(content) + countDeepNesting(content)
  const cloudiness = Math.min(100, countTodoMarkers(content) * 10 + (content.match(/\bany\b/g) ?? []).length * 10)
  const fluorescence = Math.min(100, Math.round(measureBrilliance(content) * 0.5 + measureClarity(content) * 0.5))
  const phosphorescence = countConsoleStatements(content) + countDuplicateLines(content)
  const foreignMaterial = countDuplicateLines(content)

  return { surfaceScratches, internalFractures, cloudiness, fluorescence, phosphorescence, foreignMaterial }
}

// ─── Cut Angles ──────────────────────────────────────────────────────────────

/**
 * Measure cut angles (interface/implementation quality)
 * @example
 * measureCutAngles('export function calc(x: number): number { return x }') // CutAngles
 */
export function measureCutAngles(content: string): CutAngles {
  const crown = Math.min(100, (() => {
    const exports = (content.match(/\bexport\b/g) ?? []).length
    const types = (content.match(/:\s*(?:string|number|boolean|void)/g) ?? []).length
    return exports * 10 + types * 10
  })())

  const pavilion = Math.min(100, (() => {
    const functions = (content.match(/\bfunction\b|=>/g) ?? []).length
    const returns = (content.match(/\breturn\b/g) ?? []).length
    return Math.min(60, functions * 5) + Math.min(40, returns * 5)
  })())

  const girdle = Math.min(100, (() => {
    const errorHandling = countErrorHandling(content)
    const nullChecks = (content.match(/===?\s*null|!==?\s*null/g) ?? []).length
    return Math.min(50, errorHandling * 10) + Math.min(50, nullChecks * 15)
  })())

  const table = Math.min(100, (() => {
    const jsdoc = (content.match(/\/\*\*/g) ?? []).length
    const comments = (content.match(/\/\//g) ?? []).length
    return Math.min(50, jsdoc * 15) + Math.min(50, comments * 3)
  })())

  return { crown, pavilion, girdle, table }
}

// ─── Light Performance ───────────────────────────────────────────────────────

/**
 * Measure light performance (data transformation quality)
 * @example
 * measureLightPerformance('const r = items.map(x => x * 2)') // LightPerformance
 */
export function measureLightPerformance(content: string): LightPerformance {
  const refraction = Math.min(100, (() => {
    const transforms = (content.match(/\.map\s*\(|\.reduce\s*\(|\.filter\s*\(|\.transform/g) ?? []).length
    return transforms * 15
  })())

  const reflection = Math.min(100, (() => {
    const returns = (content.match(/\breturn\b/g) ?? []).length
    return Math.min(50, returns * 5) + (countErrorHandling(content) > 0 ? 20 : 0)
  })())

  const dispersion = Math.min(100, (() => {
    const types = new Set(content.match(/\b(string|number|boolean|object|Array|Map|Set|Promise)\b/g) ?? [])
    return Math.min(60, types.size * 12) + (/\bgenerics?\b|<\w+>/.test(content) ? 20 : 0)
  })())

  const scintillation = Math.min(100, (() => {
    const optionalChain = (content.match(/\?\.\w/g) ?? []).length
    const destructuring = (content.match(/\{[^}]+\}\s*=/g) ?? []).length
    const spread = (content.match(/\.\.\./g) ?? []).length
    return Math.min(40, optionalChain * 10) + Math.min(30, destructuring * 10) + Math.min(30, spread * 10)
  })())

  return { refraction, reflection, dispersion, scintillation }
}

// ─── Appraisal ───────────────────────────────────────────────────────────────

/**
 * Appraise code value
 * @example
 * appraiseValue({ clarity: 80, brilliance: 70, cutQuality: 75, qualityScore: 75 }) // Appraisal
 */
export function appraiseValue(metrics: { clarity: number; brilliance: number; cutQuality: number; qualityScore: number }): Appraisal {
  const value = Math.round(metrics.qualityScore * 0.4 + metrics.clarity * 0.3 + metrics.brilliance * 0.3)
  const rarity = Math.min(100, Math.round(metrics.brilliance * 0.5 + metrics.cutQuality * 0.5))
  const demand = Math.min(100, Math.round(metrics.clarity * 0.4 + metrics.cutQuality * 0.3 + metrics.qualityScore * 0.3))
  const investmentGrade = value >= 60 && metrics.clarity >= 50

  return { value, rarity, demand, investmentGrade }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Inspect a single file as a gemstone
 * @example
 * inspectGemstone('export function calc() { return 1 }', 'calc.ts') // GemstoneInspection
 */
export function inspectGemstone(content: string, filePath: string): GemstoneInspection {
  const clarity = measureClarity(content)
  const brilliance = measureBrilliance(content)
  const cutQuality = measureCutQuality(content)
  const caratWeight = measureCaratWeight(content)
  const facetPrecision = measureFacetPrecision(content)
  const hardness = measureHardness(content)
  const luster = measureLuster(content)

  const inclusions = detectInclusions(content)
  const facets = analyzeFacets(content)
  const loupeFindings = measureLoupeFindings(content)
  const cutAngles = measureCutAngles(content)
  const lightPerformance = measureLightPerformance(content)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    clarity * 0.2 +
    brilliance * 0.2 +
    cutQuality * 0.2 +
    facetPrecision * 0.15 +
    hardness * 0.1 +
    luster * 0.1 +
    caratWeight * 0.05,
  )))

  const avgMetric = (clarity + brilliance + cutQuality) / 3
  const gemType = classifyGemType(avgMetric)
  const clarityGrade = classifyClarityGrade(inclusions.length)
  const cutGrade = classifyCutGrade(cutQuality)
  const colorGrade = classifyColorGrade(clarity)
  const condition = classifyCondition(qualityScore)
  const appraisal = appraiseValue({ clarity, brilliance, cutQuality, qualityScore })

  return {
    file: filePath,
    clarity,
    brilliance,
    cutQuality,
    caratWeight,
    facetPrecision,
    hardness,
    luster,
    gemType,
    clarityGrade,
    cutGrade,
    colorGrade,
    inclusions,
    facets,
    loupeFindings,
    cutAngles,
    lightPerformance,
    appraisal,
    condition,
    qualityScore,
  }
}

// ─── Display Analysis ────────────────────────────────────────────────────────

/**
 * Analyze a directory as a gem display
 * @example
 * analyzeGemDisplay(gems, 'src') // GemDisplay
 */
export function analyzeGemDisplay(gems: GemstoneInspection[], dirPath: string): GemDisplay {
  if (gems.length === 0) {
    return {
      directory: dirPath, gems: [], avgClarity: 0, avgBrilliance: 0,
      avgCutQuality: 0, avgCaratWeight: 0, dominantGemType: 'glass',
      flawlessCount: 0, damagedCount: 0, totalInclusions: 0,
      avgInclusionSeverity: 0, investmentGradeCount: 0, displayQuality: 0,
      displayGrade: 'rubble',
    }
  }

  const n = gems.length
  const avgClarity = Math.round(gems.reduce((s, g) => s + g.clarity, 0) / n)
  const avgBrilliance = Math.round(gems.reduce((s, g) => s + g.brilliance, 0) / n)
  const avgCutQuality = Math.round(gems.reduce((s, g) => s + g.cutQuality, 0) / n)
  const avgCaratWeight = Math.round(gems.reduce((s, g) => s + g.caratWeight, 0) / n)

  const typeCounts: Record<string, number> = {}
  for (const g of gems) {
    typeCounts[g.gemType] = (typeCounts[g.gemType] ?? 0) + 1
  }
  const dominantGemType = Array.from(Object.entries(typeCounts)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'glass'

  const flawlessCount = gems.filter(g => g.condition === 'flawless').length
  const damagedCount = gems.filter(g => g.condition === 'damaged' || g.condition === 'shattered').length
  const totalInclusions = gems.reduce((s, g) => s + g.inclusions.length, 0)

  const severityMap: Record<string, number> = { minor: 1, moderate: 2, significant: 3, severe: 4 }
  const avgInclusionSeverity = totalInclusions > 0
    ? Math.round(gems.reduce((s, g) => s + g.inclusions.reduce((is, i) => is + (severityMap[i.severity] ?? 0), 0), 0) / totalInclusions * 25)
    : 0

  const investmentGradeCount = gems.filter(g => g.appraisal.investmentGrade).length

  const displayQuality = Math.round(
    avgClarity * 0.25 + avgBrilliance * 0.25 + avgCutQuality * 0.25 +
    (flawlessCount / n * 100) * 0.15 + (investmentGradeCount / n * 100) * 0.1,
  )

  const displayGrade = classifyDisplayGrade(displayQuality)

  return {
    directory: dirPath, gems, avgClarity, avgBrilliance, avgCutQuality,
    avgCaratWeight, dominantGemType, flawlessCount, damagedCount,
    totalInclusions, avgInclusionSeverity, investmentGradeCount,
    displayQuality, displayGrade,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate magnifying lens recommendations
 * @example
 * generateRecommendations(gems, displays, stats) // string[]
 */
export function generateRecommendations(
  _gems: GemstoneInspection[],
  displays: GemDisplay[],
  stats: MagnifyingLensStats,
): string[] {
  const recs: string[] = []

  if (stats.totalInclusions > 20) {
    recs.push(`High inclusions: ${stats.totalInclusions} issues found — examine under loupe`)
  }

  if (stats.poorCuts > 0) {
    recs.push(`Poor cuts: ${stats.poorCuts} files need restructuring`)
  }

  if (stats.glassFiles > stats.totalFiles * 0.3) {
    recs.push(`Many glass files: ${stats.glassFiles} low-quality — invest in refactoring`)
  }

  if (stats.totalSurfaceScratches > 10) {
    recs.push('Surface scratches: inconsistent formatting — run formatter')
  }

  if (stats.totalInternalFractures > 5) {
    recs.push(`Internal fractures: ${stats.totalInternalFractures} structural issues — fix error handling`)
  }

  if (stats.totalCloudiness > 30) {
    recs.push('Cloudy code: unclear types and markers — improve clarity')
  }

  if (stats.damagedGems > 0) {
    recs.push(`Damaged gems: ${stats.damagedGems} files in poor condition — priority repair`)
  }

  if (stats.shatteredGems > 0) {
    recs.push(`Shattered gems: ${stats.shatteredGems} files beyond repair — consider rewriting`)
  }

  if (stats.overallBrilliance >= 60) {
    recs.push('Good overall brilliance: codebase shows elegance')
  }

  const pawnShops = displays.filter(d => d.displayGrade === 'pawn-shop' || d.displayGrade === 'rubble')
  if (pawnShops.length > 0) {
    recs.push(`Low-quality displays: ${pawnShops.length} directories need attention`)
  }

  if (stats.finestGem !== 'none') {
    recs.push(`Finest gem: ${stats.finestGem} — reference for quality standards`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete magnifying lens result from files and contents
 * @example
 * buildMagnifyingLensResult(['a.ts'], ['export function a() {}'], {}) // MagnifyingLensResult
 */
export function buildMagnifyingLensResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): MagnifyingLensResult {
  void options

  const gems: GemstoneInspection[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return inspectGemstone(content, file)
    } catch {
      return inspectGemstone('', file)
    }
  })

  const dirMap = new Map<string, GemstoneInspection[]>()
  for (const g of gems) {
    const dir = g.file.includes('/') ? g.file.slice(0, g.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(g)
    } else {
      dirMap.set(dir, [g])
    }
  }

  const displays: GemDisplay[] = Array.from(dirMap.entries()).map(([dir, gs]) =>
    analyzeGemDisplay(gs, dir),
  )

  const n = gems.length || 1
  const avgClarity = Math.round(gems.reduce((s, g) => s + g.clarity, 0) / n)
  const avgBrilliance = Math.round(gems.reduce((s, g) => s + g.brilliance, 0) / n)
  const avgCutQuality = Math.round(gems.reduce((s, g) => s + g.cutQuality, 0) / n)
  const avgCaratWeight = Math.round(gems.reduce((s, g) => s + g.caratWeight, 0) / n)
  const avgFacetPrecision = Math.round(gems.reduce((s, g) => s + g.facetPrecision, 0) / n)
  const avgHardness = Math.round(gems.reduce((s, g) => s + g.hardness, 0) / n)
  const avgLuster = Math.round(gems.reduce((s, g) => s + g.luster, 0) / n)
  const overallBrilliance = Math.round((avgBrilliance + avgClarity + avgCutQuality) / 3)

  const stats: MagnifyingLensStats = {
    totalFiles: files.length,
    totalDisplays: displays.length,
    avgClarity,
    avgBrilliance,
    avgCutQuality,
    avgCaratWeight,
    avgFacetPrecision,
    avgHardness,
    avgLuster,
    flawlessGems: gems.filter(g => g.condition === 'flawless').length,
    excellentGems: gems.filter(g => g.condition === 'excellent').length,
    poorGems: gems.filter(g => g.condition === 'poor' || g.condition === 'fair').length,
    damagedGems: gems.filter(g => g.condition === 'damaged').length,
    shatteredGems: gems.filter(g => g.condition === 'shattered').length,
    diamondFiles: gems.filter(g => g.gemType === 'diamond').length,
    glassFiles: gems.filter(g => g.gemType === 'glass').length,
    idealCuts: gems.filter(g => g.cutGrade === 'ideal').length,
    poorCuts: gems.filter(g => g.cutGrade === 'poor').length,
    totalInclusions: gems.reduce((s, g) => s + g.inclusions.length, 0),
    totalSurfaceScratches: gems.reduce((s, g) => s + g.loupeFindings.surfaceScratches, 0),
    totalInternalFractures: gems.reduce((s, g) => s + g.loupeFindings.internalFractures, 0),
    totalCloudiness: gems.reduce((s, g) => s + g.loupeFindings.cloudiness, 0),
    totalFluorescence: gems.reduce((s, g) => s + g.loupeFindings.fluorescence, 0),
    investmentGradeFiles: gems.filter(g => g.appraisal.investmentGrade).length,
    overallBrilliance,
    gemologistGrade: classifyGemologistGrade(overallBrilliance),
    finestGem: gems.length > 0
      ? gems.reduce((f, g) => g.qualityScore > f.qualityScore ? g : f, gems[0] as typeof gems[number]).file : 'none',
    worstGem: gems.length > 0
      ? gems.reduce((w, g) => g.qualityScore < w.qualityScore ? g : w, gems[0] as typeof gems[number]).file : 'none',
    heaviestGem: gems.length > 0
      ? gems.reduce((h, g) => g.caratWeight > h.caratWeight ? g : h, gems[0] as typeof gems[number]).file : 'none',
    mostBrilliant: gems.length > 0
      ? gems.reduce((b, g) => g.brilliance > b.brilliance ? g : b, gems[0] as typeof gems[number]).file : 'none',
  }

  const recommendations = generateRecommendations(gems, displays, stats)

  return { gems, displays, stats, recommendations }
}
