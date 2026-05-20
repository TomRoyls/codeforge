// ─── Types ──────────────────────────────────────────────────────────────────

export type SectionType = 'function' | 'class' | 'interface' | 'type' | 'constant' | 'enum'
export type SectionQuality = 'excellent' | 'good' | 'adequate' | 'poor' | 'missing'
export type ScrollClassification = 'illuminated-manuscript' | 'well-written' | 'standard' | 'faded' | 'blank-scroll' | 'damaged'
export type MarginaliaType = 'helpful-note' | 'noise' | 'outdated' | 'todo' | 'fixme' | 'explanation' | 'warning'
export type MarginaliaQuality = 'valuable' | 'neutral' | 'misleading' | 'noise'
export type Legibility = 'crystal-clear' | 'legible' | 'readable' | 'faded' | 'illegible'
export type ScriptoriumGrade = 'master-scribe' | 'skilled-scribe' | 'apprentice' | 'novice' | 'illiterate'

export interface ScrollSection {
  name: string
  type: SectionType
  hasJSDoc: boolean
  jsDocQuality: number
  hasParamDocs: boolean
  hasReturnDoc: boolean
  hasExample: boolean
  isExported: boolean
  needsDoc: boolean
  description: string
  quality: SectionQuality
}

export interface MarginaliaItem {
  type: MarginaliaType
  line: number
  content: string
  quality: MarginaliaQuality
  description: string
}

export interface InkQuality {
  clarity: number
  accuracy: number
  freshness: number
  completeness: number
}

export interface Scroll {
  file: string
  preservation: number
  ink: number
  illumination: number
  marginalia: number
  completeness: number
  age: string
  sections: ScrollSection[]
  classification: ScrollClassification
}

export interface ParchmentStats {
  totalScrolls: number
  illuminatedManuscripts: number
  blankScrolls: number
  damagedScrolls: number
  totalSections: number
  documentedSections: number
  undocumentedSections: number
  exportedWithoutDocs: number
  totalMarginalia: number
  valuableMarginalia: number
  noiseMarginalia: number
  outdatedMarginalia: number
  avgPreservation: number
  avgInk: number
  avgIllumination: number
  avgMarginalia: number
  avgCompleteness: number
  documentationCoverage: number
  jsDocCoverage: number
  exportDocCoverage: number
  overallLegibility: Legibility
  scriptoriumGrade: ScriptoriumGrade
}

export interface ParchmentResult {
  scrolls: Scroll[]
  stats: ParchmentStats
  recommendations: string[]
}

// ─── analyzeSections ────────────────────────────────────────────────────────

/**
 * Analyze per-symbol documentation
 * @example
 * analyzeSections('export function add(a: number): number { return a }', 'a.ts') // ScrollSection[]
 */
export function analyzeSections(content: string, _filePath: string): ScrollSection[] {
  const sections: ScrollSection[] = []
  const lines = content.split('\n')

  const functionMatches = content.matchAll(/(?:\/\*\*[\s\S]*?\*\/\s*)?(export\s+)?(?:async\s+)?function\s+(\w+)/g) || []
  for (const m of functionMatches) {
    const offset = m.index ?? 0
    const preceding = content.slice(Math.max(0, offset - 500), offset + m[0].length)
    sections.push(buildSection(m[2], 'function', m[1] !== undefined, preceding, content, lines))
  }

  const classMatches = content.matchAll(/(?:\/\*\*[\s\S]*?\*\/\s*)?(export\s+)?class\s+(\w+)/g) || []
  for (const m of classMatches) {
    const offset = m.index ?? 0
    const preceding = content.slice(Math.max(0, offset - 500), offset + m[0].length)
    sections.push(buildSection(m[2], 'class', m[1] !== undefined, preceding, content, lines))
  }

  const ifaceMatches = content.matchAll(/(?:\/\*\*[\s\S]*?\*\/\s*)?(export\s+)?interface\s+(\w+)/g) || []
  for (const m of ifaceMatches) {
    const offset = m.index ?? 0
    const preceding = content.slice(Math.max(0, offset - 500), offset + m[0].length)
    sections.push(buildSection(m[2], 'interface', m[1] !== undefined, preceding, content, lines))
  }

  const typeMatches = content.matchAll(/(?:\/\*\*[\s\S]*?\*\/\s*)?(export\s+)?type\s+(\w+)/g) || []
  for (const m of typeMatches) {
    const offset = m.index ?? 0
    const preceding = content.slice(Math.max(0, offset - 500), offset + m[0].length)
    sections.push(buildSection(m[2], 'type', m[1] !== undefined, preceding, content, lines))
  }

  const constMatches = content.matchAll(/(?:\/\*\*[\s\S]*?\*\/\s*)?(export\s+)?const\s+(\w+)/g) || []
  for (const m of constMatches) {
    const offset = m.index ?? 0
    const preceding = content.slice(Math.max(0, offset - 500), offset + m[0].length)
    sections.push(buildSection(m[2], 'constant', m[1] !== undefined, preceding, content, lines))
  }

  const enumMatches = content.matchAll(/(?:\/\*\*[\s\S]*?\*\/\s*)?(export\s+)?enum\s+(\w+)/g) || []
  for (const m of enumMatches) {
    const offset = m.index ?? 0
    const preceding = content.slice(Math.max(0, offset - 500), offset + m[0].length)
    sections.push(buildSection(m[2], 'enum', m[1] !== undefined, preceding, content, lines))
  }

  return sections
}

function buildSection(name: string, type: SectionType, isExported: boolean, preceding: string, _content: string, _lines: string[]): ScrollSection {
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(preceding)
  const jsDocText = hasJSDoc ? (preceding.match(/\/\*\*([\s\S]*?)\*\//) || ['', ''])[1] : ''

  let jsDocQuality = 0
  if (hasJSDoc) {
    jsDocQuality = 20
    if (jsDocText.includes('@param')) jsDocQuality += 20
    if (jsDocText.includes('@returns') || jsDocText.includes('@return')) jsDocQuality += 20
    if (jsDocText.includes('@example')) jsDocQuality += 20
    const descLines = jsDocText.split('\n').filter(l => l.trim().length > 0 && !l.trim().startsWith('@'))
    if (descLines.length >= 2) jsDocQuality += 20
  }

  const hasParamDocs = jsDocText.includes('@param')
  const hasReturnDoc = jsDocText.includes('@returns') || jsDocText.includes('@return')
  const hasExample = jsDocText.includes('@example')
  const needsDoc = !hasJSDoc && isExported

  let quality: SectionQuality = 'missing'
  if (jsDocQuality >= 80) quality = 'excellent'
  else if (jsDocQuality >= 60) quality = 'good'
  else if (jsDocQuality >= 40) quality = 'adequate'
  else if (jsDocQuality > 0) quality = 'poor'

  const desc = hasJSDoc ? 'Documented' : 'Undocumented'

  return { name, type, hasJSDoc, jsDocQuality, hasParamDocs, hasReturnDoc, hasExample, isExported, needsDoc, description: desc, quality }
}

// ─── analyzeMarginalia ──────────────────────────────────────────────────────

/**
 * Analyze inline comments (marginalia)
 * @example
 * analyzeMarginalia('const x = 1 // important note') // MarginaliaItem[]
 */
export function analyzeMarginalia(content: string): MarginaliaItem[] {
  const items: MarginaliaItem[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const commentMatch = line.match(/\/\/\s*(.+)$/)
    if (!commentMatch) continue

    const text = commentMatch[1].trim()
    const lineNum = i + 1

    if (/^TODO[\s:]/i.test(text)) {
      items.push({ type: 'todo', line: lineNum, content: text, quality: 'valuable', description: 'Action item' })
    } else if (/^FIXME[\s:]/i.test(text)) {
      items.push({ type: 'fixme', line: lineNum, content: text, quality: 'valuable', description: 'Fix needed' })
    } else if (/^WARNING|^CAUTION|^NOTE[\s:]/i.test(text)) {
      items.push({ type: 'warning', line: lineNum, content: text, quality: 'valuable', description: 'Important caveat' })
    } else if (/^HACK|^XXX/i.test(text)) {
      items.push({ type: 'outdated', line: lineNum, content: text, quality: 'misleading', description: 'Hack or workaround' })
    } else if (text.length < 5) {
      items.push({ type: 'noise', line: lineNum, content: text, quality: 'noise', description: 'Trivial comment' })
    } else {
      const codeBefore = line.slice(0, line.indexOf('//')).trim()
      if (codeBefore.length > 0 && isNoiseComment(text, codeBefore)) {
        items.push({ type: 'noise', line: lineNum, content: text, quality: 'noise', description: 'Restates code' })
      } else if (text.length > 20) {
        items.push({ type: 'explanation', line: lineNum, content: text, quality: 'valuable', description: 'Detailed explanation' })
      } else {
        items.push({ type: 'helpful-note', line: lineNum, content: text, quality: 'neutral', description: 'Inline note' })
      }
    }
  }

  return items
}

function isNoiseComment(comment: string, code: string): boolean {
  const normalized = comment.toLowerCase().replace(/[^a-z0-9]/g, '')
  const codeNorm = code.toLowerCase().replace(/[^a-z0-9]/g, '')
  return normalized.length > 3 && codeNorm.includes(normalized.slice(0, Math.min(10, normalized.length)))
}

// ─── evaluateInkQuality ─────────────────────────────────────────────────────

/**
 * Evaluate documentation clarity metrics
 * @example
 * evaluateInkQuality('export function f(): void {}') // InkQuality
 */
export function evaluateInkQuality(content: string): InkQuality {
  const jsDocBlocks = content.match(/\/\*\*[\s\S]*?\*\//g) || []
  const inlineComments = content.match(/\/\/.+/g) || []

  let clarity = 30
  if (jsDocBlocks.length > 0) clarity += 20
  if (inlineComments.length > 0) clarity += 10
  const hasTypes = /:\s*(string|number|boolean|void|Promise)/.test(content)
  if (hasTypes) clarity += 15
  if (content.includes('@example')) clarity += 15
  if (content.includes('@param')) clarity += 10

  let accuracy = 50
  const hasMismatch = /\/\*\*[\s\S]*?@param\s+\w+\s/
  if (jsDocBlocks.length > 0 && hasMismatch.test(content)) accuracy += 20
  const params = (content.match(/\(\s*[^)]*?:/g) || []).length
  const paramDocs = (content.match(/@param/g) || []).length
  if (params > 0 && paramDocs >= params) accuracy += 20

  let freshness = 60
  if (content.includes('TODO') || content.includes('FIXME')) freshness -= 20
  if (content.includes('@deprecated')) freshness -= 10
  if (jsDocBlocks.length > 0) freshness += 10

  let completeness = 25
  if (jsDocBlocks.length > 0) completeness += 15
  if (content.includes('@returns') || content.includes('@return')) completeness += 15
  if (content.includes('@param')) completeness += 15
  if (content.includes('@example')) completeness += 15
  if (content.includes('@throws') || content.includes('@exception')) completeness += 15

  return {
    clarity: Math.max(0, Math.min(100, clarity)),
    accuracy: Math.max(0, Math.min(100, accuracy)),
    freshness: Math.max(0, Math.min(100, freshness)),
    completeness: Math.max(0, Math.min(100, completeness)),
  }
}

// ─── evaluateScroll ─────────────────────────────────────────────────────────

/**
 * Evaluate overall documentation quality for a file
 * @example
 * evaluateScroll('export function f() {}', 'a.ts') // Scroll
 */
export function evaluateScroll(content: string, filePath: string): Scroll {
  const sections = analyzeSections(content, filePath)
  const marginaliaItems = analyzeMarginalia(content)
  const inkQuality = evaluateInkQuality(content)

  const jsDocBlocks = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  const codeLines = content.split('\n').filter(l => l.trim().length > 0).length
  const hasTypes = /:\s*(string|number|boolean|void|Promise|Record)/.test(content)

  let preservation = 30
  if (jsDocBlocks > 0) preservation += 20
  if (hasTypes) preservation += 15
  if (inkQuality.freshness > 70) preservation += 15
  if (sections.length > 0 && sections.filter(s => s.hasJSDoc).length > 0) preservation += 20

  let ink = inkQuality.clarity

  let illumination = 20
  if (content.includes('@param')) illumination += 20
  if (content.includes('@returns') || content.includes('@return')) illumination += 20
  if (content.includes('@example')) illumination += 20
  if (jsDocBlocks > 0 && sections.some(s => s.hasJSDoc)) illumination += 20

  const valuableCount = marginaliaItems.filter(m => m.quality === 'valuable').length
  const noiseCount = marginaliaItems.filter(m => m.quality === 'noise').length
  let marginaliaScore = 40
  if (marginaliaItems.length > 0) marginaliaScore += Math.min(30, valuableCount * 10)
  if (noiseCount > valuableCount) marginaliaScore -= 15

  const documented = sections.filter(s => s.hasJSDoc).length
  const completeness = sections.length > 0
    ? Math.round((documented / sections.length) * 100)
    : (jsDocBlocks > 0 ? 70 : 20)

  const age = content.includes('@deprecated') ? 'aged' : hasTypes ? 'fresh' : 'established'
  const classification = classifyScroll(preservation, ink, illumination, completeness)

  return {
    file: filePath,
    preservation: Math.max(0, Math.min(100, preservation)),
    ink: Math.max(0, Math.min(100, ink)),
    illumination: Math.max(0, Math.min(100, illumination)),
    marginalia: Math.max(0, Math.min(100, marginaliaScore)),
    completeness: Math.max(0, Math.min(100, completeness)),
    age,
    sections,
    classification,
  }
}

// ─── computeDocumentationCoverage ───────────────────────────────────────────

/**
 * Compute documentation coverage 0-100
 * @example
 * computeDocumentationCoverage(sections) // 75
 */
export function computeDocumentationCoverage(sections: ScrollSection[]): number {
  if (sections.length === 0) return 50
  const documented = sections.filter(s => s.hasJSDoc || s.quality !== 'missing').length
  return Math.round((documented / sections.length) * 100)
}

// ─── computeJSDocCoverage ───────────────────────────────────────────────────

/**
 * Compute JSDoc coverage 0-100
 * @example
 * computeJSDocCoverage(sections) // 50
 */
export function computeJSDocCoverage(sections: ScrollSection[]): number {
  if (sections.length === 0) return 0
  const withJSDoc = sections.filter(s => s.hasJSDoc).length
  return Math.round((withJSDoc / sections.length) * 100)
}

// ─── computeExportDocCoverage ───────────────────────────────────────────────

/**
 * Compute export documentation coverage 0-100
 * @example
 * computeExportDocCoverage(sections) // 60
 */
export function computeExportDocCoverage(sections: ScrollSection[]): number {
  const exported = sections.filter(s => s.isExported)
  if (exported.length === 0) return 100
  const documented = exported.filter(s => s.hasJSDoc).length
  return Math.round((documented / exported.length) * 100)
}

// ─── classifyScroll ─────────────────────────────────────────────────────────

/**
 * Classify scroll quality
 * @example
 * classifyScroll(90, 85, 80, 90) // 'illuminated-manuscript'
 */
export function classifyScroll(preservation: number, ink: number, illumination: number, completeness: number): ScrollClassification {
  const avg = (preservation + ink + illumination + completeness) / 4
  if (avg >= 80) return 'illuminated-manuscript'
  if (avg >= 65) return 'well-written'
  if (avg >= 45) return 'standard'
  if (avg >= 25) return 'faded'
  if (avg <= 15 && preservation <= 20) return 'damaged'
  return 'blank-scroll'
}

// ─── classifyLegibility ─────────────────────────────────────────────────────

/**
 * Classify overall documentation legibility
 * @example
 * classifyLegibility(80, 75) // 'crystal-clear'
 */
export function classifyLegibility(avgPreservation: number, avgInk: number): Legibility {
  const combined = (avgPreservation + avgInk) / 2
  if (combined >= 80) return 'crystal-clear'
  if (combined >= 65) return 'legible'
  if (combined >= 45) return 'readable'
  if (combined >= 25) return 'faded'
  return 'illegible'
}

// ─── classifyScriptoriumGrade ───────────────────────────────────────────────

/**
 * Classify documentation grade
 * @example
 * classifyScriptoriumGrade(80, 75, 90) // 'master-scribe'
 */
export function classifyScriptoriumGrade(coverage: number, illumination: number, exportCoverage: number): ScriptoriumGrade {
  const combined = coverage * 0.4 + illumination * 0.3 + exportCoverage * 0.3
  if (combined >= 80) return 'master-scribe'
  if (combined >= 65) return 'skilled-scribe'
  if (combined >= 45) return 'apprentice'
  if (combined >= 25) return 'novice'
  return 'illiterate'
}

// ─── generateRecommendations ────────────────────────────────────────────────

/**
 * Generate parchment analysis recommendations
 * @example
 * generateRecommendations(scrolls, allSections, stats) // string[]
 */
export function generateRecommendations(
  scrolls: Scroll[],
  _allSections: ScrollSection[],
  stats: ParchmentStats,
): string[] {
  const recs: string[] = []

  const blankScrolls = scrolls.filter(s => s.classification === 'blank-scroll')
  if (blankScrolls.length > 0) {
    recs.push(`Add documentation to ${blankScrolls.length} blank-scroll file(s)`)
  }

  if (stats.exportedWithoutDocs > 0) {
    recs.push(`Prioritize documenting ${stats.exportedWithoutDocs} exported symbol(s) without JSDoc`)
  }

  const faded = scrolls.filter(s => s.classification === 'faded')
  if (faded.length > 0) {
    recs.push(`Update outdated documentation in ${faded.length} faded file(s)`)
  }

  if (stats.noiseMarginalia > 3) {
    recs.push(`Remove or improve ${stats.noiseMarginalia} noise comment(s)`)
  }

  if (stats.jsDocCoverage < 40) {
    recs.push('Low JSDoc coverage - start a systematic documentation effort')
  }

  if (stats.exportDocCoverage < 50) {
    recs.push('Low export documentation coverage - public API needs documentation')
  }

  return Array.from(new Set(recs))
}

// ─── buildParchmentResult ───────────────────────────────────────────────────

/**
 * Build complete parchment analysis result
 * @example
 * buildParchmentResult(['a.ts'], ['export function f() {}'], {}) // ParchmentResult
 */
export function buildParchmentResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): ParchmentResult {
  const scrolls: Scroll[] = []

  for (let i = 0; i < files.length; i++) {
    scrolls.push(evaluateScroll(contents[i] || '', files[i]))
  }

  const allSections = scrolls.flatMap(s => s.sections)
  const allMarginalia = scrolls.flatMap(s => analyzeMarginalia(contents[scrolls.indexOf(s)] || ''))

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const docCoverage = computeDocumentationCoverage(allSections)
  const jsDocCov = computeJSDocCoverage(allSections)
  const exportCov = computeExportDocCoverage(allSections)
  const avgPreservation = avg(scrolls.map(s => s.preservation))
  const avgInk = avg(scrolls.map(s => s.ink))

  const stats: ParchmentStats = {
    totalScrolls: scrolls.length,
    illuminatedManuscripts: scrolls.filter(s => s.classification === 'illuminated-manuscript').length,
    blankScrolls: scrolls.filter(s => s.classification === 'blank-scroll').length,
    damagedScrolls: scrolls.filter(s => s.classification === 'damaged').length,
    totalSections: allSections.length,
    documentedSections: allSections.filter(s => s.hasJSDoc).length,
    undocumentedSections: allSections.filter(s => !s.hasJSDoc).length,
    exportedWithoutDocs: allSections.filter(s => s.isExported && !s.hasJSDoc).length,
    totalMarginalia: allMarginalia.length,
    valuableMarginalia: allMarginalia.filter(m => m.quality === 'valuable').length,
    noiseMarginalia: allMarginalia.filter(m => m.quality === 'noise').length,
    outdatedMarginalia: allMarginalia.filter(m => m.quality === 'misleading').length,
    avgPreservation,
    avgInk,
    avgIllumination: avg(scrolls.map(s => s.illumination)),
    avgMarginalia: avg(scrolls.map(s => s.marginalia)),
    avgCompleteness: avg(scrolls.map(s => s.completeness)),
    documentationCoverage: docCoverage,
    jsDocCoverage: jsDocCov,
    exportDocCoverage: exportCov,
    overallLegibility: classifyLegibility(avgPreservation, avgInk),
    scriptoriumGrade: classifyScriptoriumGrade(docCoverage, avg(scrolls.map(s => s.illumination)), exportCov),
  }

  const recommendations = generateRecommendations(scrolls, allSections, stats)

  return { scrolls, stats, recommendations }
}
