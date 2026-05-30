// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ScriptsInfo {
  hieroglyphic: number
  demotic: number
  greek: number
  isMultiscript: boolean
  dominantScript: string
}

export interface GlyphInfo {
  totalGlyphs: number
  clearGlyphs: number
  ambiguousGlyphs: number
  obscureGlyphs: number
  phonetic: number
  logographic: number
  decorative: number
}

export interface TranslationInfo {
  surfaceLevel: number
  deepLevel: number
  expertLevel: number
  canBeTranslatedBy: string[]
  translationDifficulty: 'trivial' | 'easy' | 'moderate' | 'difficult' | 'obscure' | 'undecipherable'
}

export interface PreservationInfo {
  weathering: number
  erosion: number
  isIntact: boolean
  hasDamage: boolean
  hasBeenRestored: boolean
  isFragmentary: boolean
  damageCount: number
}

export interface ReadingInfo {
  isSelfDocumenting: boolean
  needsCommentary: boolean
  hasGlossary: boolean
  readingLevel: 'scholar' | 'literate' | 'basic' | 'cryptic' | 'unknown'
  timeToDecipher: number
}

export type InscriptionType = 'decree' | 'law' | 'prayer' | 'record' | 'letter' | 'graffiti' | 'doodle'
export type InscriptionCondition = 'pristine' | 'well-preserved' | 'legible' | 'weathered' | 'fragmentary' | 'eroded' | 'lost'

export interface Inscription {
  file: string
  translatability: number
  inscriptionQuality: number
  preservation: number
  glyphClarity: number
  scriptConsistency: number
  decipherability: number
  scripts: ScriptsInfo
  glyphs: GlyphInfo
  translation: TranslationInfo
  preservationDetail: PreservationInfo
  reading: ReadingInfo
  inscriptionType: InscriptionType
  condition: InscriptionCondition
  qualityScore: number
}

export type TabletCondition = 'library' | 'museum' | 'archive' | 'field' | 'ruins' | 'lost'

export interface StoneTablet {
  directory: string
  inscriptions: Inscription[]
  avgTranslatability: number
  avgGlyphClarity: number
  avgDecipherability: number
  dominantScript: string
  multilingualCount: number
  selfDocumentingCount: number
  crypticCount: number
  avgReadingLevel: string
  isLibrary: boolean
  isArchive: boolean
  isRuins: boolean
  condition: TabletCondition
  tabletQuality: number
}

export interface RosettaStoneStats {
  totalFiles: number
  totalTablets: number
  avgTranslatability: number
  avgInscriptionQuality: number
  avgPreservation: number
  avgGlyphClarity: number
  avgScriptConsistency: number
  avgDecipherability: number
  multilingualFiles: number
  selfDocumentingFiles: number
  crypticFiles: number
  pristineCount: number
  erodedCount: number
  lostCount: number
  totalClearGlyphs: number
  totalAmbiguousGlyphs: number
  totalObscureGlyphs: number
  scholarLevel: number
  crypticLevel: number
  overallReadability: number
  translatorGrade: 'master-linguist' | 'polyglot' | 'translator' | 'reader' | 'illiterate' | 'blind'
  mostReadable: string
  leastReadable: string
  bestPreserved: string
  mostCryptic: string
}

export interface RosettaStoneResult {
  inscriptions: Inscription[]
  tablets: StoneTablet[]
  stats: RosettaStoneStats
  recommendations: string[]
}

// ─── Content Primitives ──────────────────────────────────────────────────────

/**
 * Count lines of code
 * @example
 * countLoc('const x = 1\nconst y = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count imports
 * @example
 * countImports('import { x } from "y"') // 1
 */
export function countImports(content: string): number {
  return (content.match(/^import\s+/gm) ?? []).length
}

/**
 * Count exports
 * @example
 * countExports('export function a() {}') // 1
 */
export function countExports(content: string): number {
  return (content.match(/\bexport\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+/g) ?? []).length
}

/**
 * Count functions
 * @example
 * countFunctions('function a() {}') // 1
 */
export function countFunctions(content: string): number {
  return (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) ?? []).length
}

/**
 * Count error handling
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{|\bcatch\s*\(|\.catch\s*\(|\bthrow\s+/g) ?? []).length
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)/g) ?? []).length
}

/**
 * Count branches
 * @example
 * countBranches('if (a) {}') // 1
 */
export function countBranches(content: string): number {
  return (content.match(/\bif\s*\(|\?\s*[^?]\s*:|\bswitch\s*\(/g) ?? []).length
}

/**
 * Count max nesting depth
 * @example
 * maxNesting('{{{}}}') // 3
 */
export function maxNesting(content: string): number {
  let max = 0
  let cur = 0
  for (const ch of content) {
    if (ch === '{') { cur++; if (cur > max) max = cur }
    else if (ch === '}') { cur = Math.max(0, cur - 1) }
  }
  return max
}

/**
 * Count console statements
 * @example
 * countConsole('console.log("x")') // 1
 */
export function countConsole(content: string): number {
  return (content.match(/console\.\w+\s*\(/g) ?? []).length
}

/**
 * Count comments
 * @example
 * countComments('// hello') // 1
 */
export function countComments(content: string): number {
  return (content.match(/\/\//g) ?? []).length + (content.match(/\/\*/g) ?? []).length
}

/**
 * Count TODO markers
 * @example
 * countTodos('TODO: fix') // 1
 */
export function countTodos(content: string): number {
  return (content.match(/TODO|FIXME|HACK|XXX/gi) ?? []).length
}

/**
 * Count identifiers in code
 * @example
 * countIdentifiers('const myVar = 1') // 1
 */
export function countIdentifiers(content: string): number {
  return (content.match(/\b[a-z][a-zA-Z0-9]{2,}\b/g) ?? []).length
}

// ─── Core Measurements ───────────────────────────────────────────────────────

/**
 * Measure translatability (cross-audience clarity)
 * @example
 * measureTranslatability('export function calc(x: number): number { return x }') // number
 */
export function measureTranslatability(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const hasDocs = countComments(content) > 0 ? 15 : 0
  const hasExports = countExports(content) > 0 ? 15 : 0
  const lowNesting = maxNesting(content) <= 3 ? 20 : maxNesting(content) <= 5 ? 10 : 0
  const lowBranches = countBranches(content) <= 5 ? 15 : countBranches(content) <= 10 ? 8 : 0
  const sizeOk = loc <= 100 ? 15 : loc <= 250 ? 8 : 0

  return Math.min(100, hasTypes + hasDocs + hasExports + lowNesting + lowBranches + sizeOk)
}

/**
 * Measure inscription quality (code expressiveness)
 * @example
 * measureInscriptionQuality('function calculateTotal(price: number): number { return price * 1.1 }') // number
 */
export function measureInscriptionQuality(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const hasDocs = /\/\*\*/.test(content) ? 20 : countComments(content) > 0 ? 10 : 0
  const hasReturn = /\breturn\b/.test(content) ? 15 : 0
  const hasError = countErrorHandling(content) > 0 ? 15 : 0
  const fewConsole = countConsole(content) <= 1 ? 15 : 0
  const fewTodos = countTodos(content) <= 1 ? 15 : 0

  return Math.min(100, hasTypes + hasDocs + hasReturn + hasError + fewConsole + fewTodos)
}

/**
 * Measure preservation (code health)
 * @example
 * measurePreservation('export function calc() { return 1 }') // number
 */
export function measurePreservation(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const noTodos = countTodos(content) === 0 ? 20 : 0
  const noConsole = countConsole(content) === 0 ? 15 : countConsole(content) <= 2 ? 8 : 0
  const noVar = !/\bvar\b/.test(content) ? 15 : 0
  const lowNesting = maxNesting(content) <= 4 ? 20 : maxNesting(content) <= 6 ? 10 : 0
  const hasDocs = countComments(content) > 0 ? 15 : 0
  const hasError = countErrorHandling(content) > 0 ? 15 : 0

  return Math.min(100, noTodos + noConsole + noVar + lowNesting + hasDocs + hasError)
}

/**
 * Measure glyph clarity (naming quality)
 * @example
 * measureGlyphClarity('function calculateTotal() {}') // number
 */
export function measureGlyphClarity(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const longNames = (content.match(/\b[a-z][a-zA-Z]{4,}\b/g) ?? []).length
  const shortNames = (content.match(/\b[a-z]{1,2}\b/g) ?? []).length
  const singleLetters = (content.match(/[^a-zA-Z][a-z][^a-zA-Z]/g) ?? []).length

  const longRatio = longNames > 0 ? Math.min(40, longNames * 5) : 0
  const shortPenalty = Math.min(30, shortNames * 3)
  const singlePenalty = Math.min(30, singleLetters * 2)

  return Math.max(0, Math.min(100, longRatio + 30 - shortPenalty - singlePenalty + (countTypeAnnotations(content) > 0 ? 20 : 0)))
}

/**
 * Measure script consistency (style uniformity)
 * @example
 * measureScriptConsistency('const x = 1\nconst y = 2') // number
 */
export function measureScriptConsistency(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const usesConst = /\bconst\b/.test(content)
  const usesVar = /\bvar\b/.test(content)

  let styleScore = 20
  if (usesConst && !usesVar) styleScore += 20
  if (!usesVar) styleScore += 15
  if (usesVar) styleScore -= 20

  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const hasImports = countImports(content) > 0 ? 10 : 0
  const lowConsole = countConsole(content) <= 1 ? 15 : 0

  return Math.max(0, Math.min(100, styleScore + hasTypes + hasImports + lowConsole))
}

/**
 * Measure decipherability (new-reader comprehension)
 * @example
 * measureDecipherability('export function calculateSum(a: number, b: number): number { return a + b }') // number
 */
export function measureDecipherability(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const hasExports = countExports(content) > 0 ? 15 : 0
  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const hasDocs = countComments(content) > 0 ? 15 : 0
  const hasJSDoc = /\/\*\*/.test(content) ? 10 : 0
  const lowNesting = maxNesting(content) <= 3 ? 20 : maxNesting(content) <= 5 ? 10 : 0
  const sizeOk = loc <= 100 ? 20 : loc <= 250 ? 10 : 0

  return Math.min(100, hasExports + hasTypes + hasDocs + hasJSDoc + lowNesting + sizeOk)
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify inscription type from content
 * @example
 * classifyInscriptionType('export function calc() {}') // string
 */
export function classifyInscriptionType(content: string): InscriptionType {
  const exports = countExports(content)
  const imports = countImports(content)
  const loc = countLoc(content)

  if (exports > 3 && imports > 0 && loc > 30) return 'decree'
  if (/\bclass\b/.test(content) && loc > 30) return 'law'
  if (/test|spec|describe|expect/.test(content)) return 'prayer'
  if (exports > 0 && loc <= 50) return 'letter'
  if (imports > 0 && exports === 0) return 'record'
  if (countConsole(content) > 3 || countTodos(content) > 2) return 'graffiti'
  return 'doodle'
}

/**
 * Classify condition from quality score
 * @example
 * classifyCondition(90) // 'pristine'
 */
export function classifyCondition(quality: number): InscriptionCondition {
  if (quality >= 80) return 'pristine'
  if (quality >= 65) return 'well-preserved'
  if (quality >= 45) return 'legible'
  if (quality >= 30) return 'weathered'
  if (quality >= 15) return 'fragmentary'
  if (quality >= 5) return 'eroded'
  return 'lost'
}

/**
 * Classify translator grade from average readability
 * @example
 * classifyTranslatorGrade(80) // 'master-linguist'
 */
export function classifyTranslatorGrade(avgReadability: number): RosettaStoneStats['translatorGrade'] {
  if (avgReadability >= 75) return 'master-linguist'
  if (avgReadability >= 60) return 'polyglot'
  if (avgReadability >= 40) return 'translator'
  if (avgReadability >= 25) return 'reader'
  if (avgReadability >= 10) return 'illiterate'
  return 'blind'
}

/**
 * Classify reading level from content
 * @example
 * classifyReadingLevel(content) // string
 */
export function classifyReadingLevel(content: string): ReadingInfo['readingLevel'] {
  const decipherability = measureDecipherability(content)
  const hasTypes = countTypeAnnotations(content) > 0
  const hasDocs = /\/\*\*/.test(content)

  if (decipherability >= 70 && hasTypes && hasDocs) return 'scholar'
  if (decipherability >= 50 && hasTypes) return 'literate'
  if (decipherability >= 30) return 'basic'
  if (decipherability > 0) return 'cryptic'
  return 'unknown'
}

/**
 * Classify translation difficulty
 * @example
 * classifyTranslationDifficulty(80) // 'trivial'
 */
export function classifyTranslationDifficulty(decipherability: number): TranslationInfo['translationDifficulty'] {
  if (decipherability >= 80) return 'trivial'
  if (decipherability >= 60) return 'easy'
  if (decipherability >= 40) return 'moderate'
  if (decipherability >= 25) return 'difficult'
  if (decipherability >= 10) return 'obscure'
  return 'undecipherable'
}

/**
 * Classify tablet condition from quality
 * @example
 * classifyTabletCondition(80) // 'library'
 */
export function classifyTabletCondition(quality: number): TabletCondition {
  if (quality >= 75) return 'library'
  if (quality >= 55) return 'museum'
  if (quality >= 35) return 'archive'
  if (quality >= 15) return 'field'
  if (quality >= 5) return 'ruins'
  return 'lost'
}

// ─── Glyph Analysis ──────────────────────────────────────────────────────────

/**
 * Count and classify glyphs (identifiers)
 * @example
 * countGlyphs('function calculateTotal(price: number) {}') // GlyphInfo
 */
export function countGlyphs(content: string): GlyphInfo {
  const allIdentifiers = content.match(/\b[a-z][a-zA-Z0-9]{2,}\b/g) ?? []
  const totalGlyphs = allIdentifiers.length

  const clearGlyphs = allIdentifiers.filter(id => id.length >= 5 && /[a-z]/.test(id) && /[A-Z]/.test(id) === false || id.length >= 8).length
  const obscureGlyphs = allIdentifiers.filter(id => id.length <= 3).length
  const ambiguousGlyphs = Math.max(0, totalGlyphs - clearGlyphs - obscureGlyphs)

  const phonetic = allIdentifiers.filter(id => id.length >= 6).length
  const logographic = allIdentifiers.filter(id => id.length >= 2 && id.length <= 5).length
  const decorative = Math.max(0, obscureGlyphs - 3)

  return { totalGlyphs, clearGlyphs, ambiguousGlyphs, obscureGlyphs, phonetic, logographic, decorative }
}

// ─── Scripts Analysis ────────────────────────────────────────────────────────

/**
 * Analyze scripts (intent/implementation/detail levels)
 * @example
 * analyzeScripts(content) // ScriptsInfo
 */
export function analyzeScripts(content: string): ScriptsInfo {
  const hieroglyphic = Math.min(100, Math.round(
    (countComments(content) > 0 ? 25 : 0) +
    (/\/\*\*/.test(content) ? 25 : 0) +
    (countExports(content) === 1 ? 25 : 10) +
    (countLoc(content) <= 80 ? 25 : 10),
  ))

  const demotic = Math.min(100, Math.round(
    (countFunctions(content) > 0 ? 25 : 0) +
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (countErrorHandling(content) > 0 ? 25 : 0) +
    (countBranches(content) <= 5 ? 25 : 10),
  ))

  const greek = Math.min(100, Math.round(
    (countImports(content) > 0 ? 20 : 0) +
    (countExports(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 2 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countLoc(content) > 10 ? 20 : 0),
  ))

  const vals = [
    { name: 'hieroglyphic', val: hieroglyphic },
    { name: 'demotic', val: demotic },
    { name: 'greek', val: greek },
  ]
  const sorted = Array.from(vals).sort((a, b) => b.val - a.val)
  const isMultiscript = hieroglyphic >= 40 && demotic >= 40 && greek >= 40
  const dominantScript = sorted[0]?.name ?? 'greek'

  return { hieroglyphic, demotic, greek, isMultiscript, dominantScript }
}

// ─── Preservation Assessment ─────────────────────────────────────────────────

/**
 * Assess preservation (code health)
 * @example
 * assessPreservation(content) // PreservationInfo
 */
export function assessPreservation(content: string): PreservationInfo {
  const todos = countTodos(content)
  const console_ = countConsole(content)
  const nesting = maxNesting(content)
  const loc = countLoc(content)

  const weathering = Math.min(100, Math.round(todos * 10 + console_ * 5 + Math.max(0, nesting - 4) * 10))
  const erosion = Math.min(100, Math.round(
    (countComments(content) === 0 && loc > 20 ? 30 : 0) +
    (countTypeAnnotations(content) === 0 && loc > 15 ? 30 : 0) +
    (countErrorHandling(content) === 0 && loc > 30 ? 20 : 0) +
    (countExports(content) === 0 ? 20 : 0),
  ))

  const damageCount = todos + console_ + (nesting > 5 ? nesting - 5 : 0)
  const isIntact = damageCount === 0 && weathering < 20
  const hasDamage = damageCount > 0
  const hasBeenRestored = countComments(content) > 5 && countTypeAnnotations(content) > 3
  const isFragmentary = loc > 0 && loc < 5

  return { weathering, erosion, isIntact, hasDamage, hasBeenRestored, isFragmentary, damageCount }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as an inscription
 * @example
 * analyzeInscription('export function calc() { return 1 }', 'calc.ts') // Inscription
 */
export function analyzeInscription(content: string, filePath: string): Inscription {
  const translatability = measureTranslatability(content)
  const inscriptionQuality = measureInscriptionQuality(content)
  const preservation = measurePreservation(content)
  const glyphClarity = measureGlyphClarity(content)
  const scriptConsistency = measureScriptConsistency(content)
  const decipherability = measureDecipherability(content)

  const scripts = analyzeScripts(content)
  const glyphs = countGlyphs(content)

  const surfaceLevel = Math.min(100, Math.round(
    (countExports(content) > 0 ? 30 : 0) +
    (countComments(content) > 0 ? 25 : 0) +
    (countLoc(content) <= 60 ? 25 : 10) +
    (glyphs.clearGlyphs > glyphs.obscureGlyphs ? 20 : 5),
  ))

  const deepLevel = Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (countErrorHandling(content) > 0 ? 25 : 0) +
    (maxNesting(content) <= 3 ? 25 : 10) +
    (countFunctions(content) > 0 ? 25 : 0),
  ))

  const expertLevel = Math.min(100, Math.round(
    (countImports(content) > 0 ? 20 : 0) +
    (countExports(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 2 ? 20 : 0) +
    (/interface|type\s+\w/.test(content) ? 20 : 0) +
    (countLoc(content) > 10 ? 20 : 0),
  ))

  const canBeTranslatedBy: string[] = []
  if (surfaceLevel >= 50) canBeTranslatedBy.push('junior')
  if (deepLevel >= 50) canBeTranslatedBy.push('mid-level')
  if (expertLevel >= 50) canBeTranslatedBy.push('senior')

  const translationDifficulty = classifyTranslationDifficulty(decipherability)

  const translation: TranslationInfo = {
    surfaceLevel, deepLevel, expertLevel, canBeTranslatedBy, translationDifficulty,
  }

  const preservationDetail = assessPreservation(content)

  const loc = countLoc(content)
  const isSelfDocumenting = glyphClarity >= 60 && countTypeAnnotations(content) > 0 && countExports(content) > 0
  const needsCommentary = countComments(content) === 0 && loc > 20
  const hasGlossary = countTypeAnnotations(content) > 0 || /interface|type\s+\w/.test(content)
  const readingLevel = classifyReadingLevel(content)
  const timeToDecipher = Math.max(1, Math.round(loc / 10 + maxNesting(content) * 2 - countComments(content)))

  const reading: ReadingInfo = {
    isSelfDocumenting, needsCommentary, hasGlossary, readingLevel, timeToDecipher: Math.max(0, timeToDecipher),
  }

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    translatability * 0.2 +
    inscriptionQuality * 0.2 +
    (100 - preservationDetail.weathering) * 0.1 +
    glyphClarity * 0.15 +
    scriptConsistency * 0.1 +
    decipherability * 0.25,
  )))

  const condition = classifyCondition(qualityScore)
  const inscriptionType = classifyInscriptionType(content)

  return {
    file: filePath, translatability, inscriptionQuality, preservation,
    glyphClarity, scriptConsistency, decipherability, scripts, glyphs,
    translation, preservationDetail, reading, inscriptionType, condition, qualityScore,
  }
}

// ─── Tablet Analysis ─────────────────────────────────────────────────────────

/**
 * Analyze a directory as a stone tablet
 * @example
 * analyzeStoneTablet(inscriptions, 'src') // StoneTablet
 */
export function analyzeStoneTablet(inscriptions: Inscription[], dirPath: string): StoneTablet {
  if (inscriptions.length === 0) {
    return {
      directory: dirPath, inscriptions: [], avgTranslatability: 0,
      avgGlyphClarity: 0, avgDecipherability: 0, dominantScript: 'greek',
      multilingualCount: 0, selfDocumentingCount: 0, crypticCount: 0,
      avgReadingLevel: 'unknown', isLibrary: false, isArchive: false,
      isRuins: true, condition: 'lost', tabletQuality: 0,
    }
  }

  const n = inscriptions.length
  const avgTranslatability = Math.round(inscriptions.reduce((s, i) => s + i.translatability, 0) / n)
  const avgGlyphClarity = Math.round(inscriptions.reduce((s, i) => s + i.glyphClarity, 0) / n)
  const avgDecipherability = Math.round(inscriptions.reduce((s, i) => s + i.decipherability, 0) / n)

  const scriptCounts: Record<string, number> = {}
  for (const ins of inscriptions) {
    scriptCounts[ins.scripts.dominantScript] = (scriptCounts[ins.scripts.dominantScript] ?? 0) + 1
  }
  const dominantScript = Array.from(Object.entries(scriptCounts)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'greek'

  const multilingualCount = inscriptions.filter(i => i.scripts.isMultiscript).length
  const selfDocumentingCount = inscriptions.filter(i => i.reading.isSelfDocumenting).length
  const crypticCount = inscriptions.filter(i => i.reading.readingLevel === 'cryptic' || i.reading.readingLevel === 'unknown').length

  const readingLevels = inscriptions.map(i => i.reading.readingLevel)
  const levelCounts: Record<string, number> = {}
  for (const l of readingLevels) levelCounts[l] = (levelCounts[l] ?? 0) + 1
  const avgReadingLevel = Array.from(Object.entries(levelCounts)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown'

  const tabletQuality = Math.round(
    avgTranslatability * 0.25 + avgGlyphClarity * 0.2 +
    avgDecipherability * 0.25 + (selfDocumentingCount / n * 100) * 0.15 +
    (multilingualCount / n * 100) * 0.15,
  )

  const isLibrary = tabletQuality >= 70
  const isArchive = tabletQuality >= 40 && tabletQuality < 70
  const isRuins = tabletQuality < 30
  const condition = classifyTabletCondition(tabletQuality)

  return {
    directory: dirPath, inscriptions, avgTranslatability, avgGlyphClarity,
    avgDecipherability, dominantScript, multilingualCount, selfDocumentingCount,
    crypticCount, avgReadingLevel, isLibrary, isArchive, isRuins, condition, tabletQuality,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate rosetta stone recommendations
 * @example
 * generateRecommendations(inscriptions, tablets, stats) // string[]
 */
export function generateRecommendations(
  _inscriptions: Inscription[],
  tablets: StoneTablet[],
  stats: RosettaStoneStats,
): string[] {
  const recs: string[] = []

  if (stats.crypticFiles > 0) {
    recs.push(`Cryptic files: ${stats.crypticFiles} need clearer naming and documentation`)
  }

  if (stats.totalAmbiguousGlyphs > 20) {
    recs.push(`Ambiguous glyphs: ${stats.totalAmbiguousGlyphs} identifiers need better names`)
  }

  if (stats.erodedCount > 0) {
    recs.push(`Eroded files: ${stats.erodedCount} need restoration (docs and types)`)
  }

  if (stats.lostCount > 0) {
    recs.push(`Lost files: ${stats.lostCount} are unreadable and need complete rewrite`)
  }

  if (stats.overallReadability >= 60) {
    recs.push('Good readability: codebase is generally well-translated')
  }

  if (stats.mostReadable !== 'none') {
    recs.push(`Most readable: ${stats.mostReadable} — use as style template`)
  }

  const ruinsTablets = tablets.filter(t => t.isRuins)
  if (ruinsTablets.length > 0) {
    recs.push(`Ruined tablets: ${ruinsTablets.length} directories need documentation overhaul`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete rosetta stone result from files and contents
 * @example
 * buildRosettaStoneResult(['a.ts'], ['export function a() {}'], {}) // RosettaStoneResult
 */
export function buildRosettaStoneResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): RosettaStoneResult {
  void options

  const inscriptions: Inscription[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeInscription(content, file)
    } catch {
      return analyzeInscription('', file)
    }
  })

  const dirMap = new Map<string, Inscription[]>()
  for (const ins of inscriptions) {
    const dir = ins.file.includes('/') ? ins.file.slice(0, ins.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(ins) } else { dirMap.set(dir, [ins]) }
  }

  const tablets: StoneTablet[] = Array.from(dirMap.entries()).map(([dir, is]) =>
    analyzeStoneTablet(is, dir),
  )

  const n = inscriptions.length || 1
  const avgTranslatability = Math.round(inscriptions.reduce((s, i) => s + i.translatability, 0) / n)
  const avgInscriptionQuality = Math.round(inscriptions.reduce((s, i) => s + i.inscriptionQuality, 0) / n)
  const avgPreservation = Math.round(inscriptions.reduce((s, i) => s + i.preservation, 0) / n)
  const avgGlyphClarity = Math.round(inscriptions.reduce((s, i) => s + i.glyphClarity, 0) / n)
  const avgScriptConsistency = Math.round(inscriptions.reduce((s, i) => s + i.scriptConsistency, 0) / n)
  const avgDecipherability = Math.round(inscriptions.reduce((s, i) => s + i.decipherability, 0) / n)

  const overallReadability = Math.round(
    avgTranslatability * 0.25 + avgInscriptionQuality * 0.2 +
    avgGlyphClarity * 0.2 + avgDecipherability * 0.2 +
    avgScriptConsistency * 0.15,
  )

  const stats: RosettaStoneStats = {
    totalFiles: files.length,
    totalTablets: tablets.length,
    avgTranslatability,
    avgInscriptionQuality,
    avgPreservation,
    avgGlyphClarity,
    avgScriptConsistency,
    avgDecipherability,
    multilingualFiles: inscriptions.filter(i => i.scripts.isMultiscript).length,
    selfDocumentingFiles: inscriptions.filter(i => i.reading.isSelfDocumenting).length,
    crypticFiles: inscriptions.filter(i => i.reading.readingLevel === 'cryptic' || i.reading.readingLevel === 'unknown').length,
    pristineCount: inscriptions.filter(i => i.condition === 'pristine').length,
    erodedCount: inscriptions.filter(i => i.condition === 'eroded').length,
    lostCount: inscriptions.filter(i => i.condition === 'lost').length,
    totalClearGlyphs: inscriptions.reduce((s, i) => s + i.glyphs.clearGlyphs, 0),
    totalAmbiguousGlyphs: inscriptions.reduce((s, i) => s + i.glyphs.ambiguousGlyphs, 0),
    totalObscureGlyphs: inscriptions.reduce((s, i) => s + i.glyphs.obscureGlyphs, 0),
    scholarLevel: inscriptions.filter(i => i.reading.readingLevel === 'scholar').length,
    crypticLevel: inscriptions.filter(i => i.reading.readingLevel === 'cryptic').length,
    overallReadability,
    translatorGrade: classifyTranslatorGrade(overallReadability),
    mostReadable: inscriptions.length > 0
      ? inscriptions.reduce((b, i) => i.qualityScore > b.qualityScore ? i : b, inscriptions[0] as typeof inscriptions[number]).file : 'none',
    leastReadable: inscriptions.length > 0
      ? inscriptions.reduce((w, i) => i.qualityScore < w.qualityScore ? i : w, inscriptions[0] as typeof inscriptions[number]).file : 'none',
    bestPreserved: inscriptions.length > 0
      ? inscriptions.reduce((b, i) => i.preservation > b.preservation ? i : b, inscriptions[0] as typeof inscriptions[number]).file : 'none',
    mostCryptic: inscriptions.length > 0
      ? inscriptions.reduce((c, i) => i.glyphs.obscureGlyphs > c.glyphs.obscureGlyphs ? i : c, inscriptions[0] as typeof inscriptions[number]).file : 'none',
  }

  const recommendations = generateRecommendations(inscriptions, tablets, stats)

  return { inscriptions, tablets, stats, recommendations }
}
