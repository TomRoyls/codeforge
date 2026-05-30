// ─── Interfaces ──────────────────────────────────────────

export interface TypefaceMeasure {
  style: 'serif' | 'sans-serif' | 'monospace' | 'gothic' | 'script' | 'hieroglyph'
  clarity: number
  hasConsistentFont: boolean
  hasKerning: boolean
  hasOrphans: boolean
  hasWidows: boolean
  hasLigatures: boolean
  isReadable: boolean
  orphanCount: number
  widowCount: number
}

export interface InkMeasure {
  quality: number
  isDark: boolean
  isFaded: boolean
  isSmudged: boolean
  hasBleed: boolean
  isWaterproof: boolean
  hasIllustrations: boolean
  hasColophon: boolean
  illustrationCount: number
}

export interface PlateMeasure {
  quality: number
  hasEngraving: boolean
  hasWoodcut: boolean
  hasLithograph: boolean
  hasPhotogravure: boolean
  isWellInked: boolean
  hasPlateWear: boolean
  hasPlateMarks: boolean
}

export interface PaperMeasure {
  quality: number
  weight: number
  hasWatermark: boolean
  hasDeckleEdge: boolean
  isAcidFree: boolean
  hasFoxing: boolean
  isSmooth: boolean
  hasTooth: boolean
}

export interface BindingMeasure {
  quality: number
  style: 'hardcover' | 'softcover' | 'spiral' | 'perfect-bind' | 'saddle-stitch' | 'loose-leaf'
  hasTableOfContents: boolean
  hasIndex: boolean
  hasBibliography: boolean
  hasGlossary: boolean
  isWellBound: boolean
  hasLoosePages: boolean
  hasDogEars: boolean
}

export interface CirculationMeasure {
  reach: number
  isFirstEdition: boolean
  hasRevisions: boolean
  hasErrata: boolean
  hasTranslations: boolean
  hasAnnotations: boolean
  isPublicDomain: boolean
  isRareManuscript: boolean
  errataCount: number
}

export interface PrintMeasure {
  run: number
  hasFullColor: boolean
  hasSpotColor: boolean
  isBlackAndWhite: boolean
  hasBlankPages: boolean
  hasOverprint: boolean
  blankPageCount: number
  isComplete: boolean
}

export interface PrintedPage {
  file: string
  typeClarity: number
  documentationQuality: number
  reproducibility: number
  circulationReach: number
  printRun: number
  bindingQuality: number
  typeface: TypefaceMeasure
  ink: InkMeasure
  plate: PlateMeasure
  paper: PaperMeasure
  binding: BindingMeasure
  circulation: CirculationMeasure
  print: PrintMeasure
  condition: 'gutenberg-bible' | 'first-edition' | 'quality-print' | 'mass-market' | 'mimeograph' | 'smudged-manuscript'
  qualityScore: number
}

export interface PrintShop {
  directory: string
  pages: PrintedPage[]
  avgTypeClarity: number
  avgDocQuality: number
  avgBinding: number
  gutenbergCount: number
  smudgedCount: number
  completeDocCount: number
  hasIllustrationsCount: number
  shopType: 'royal-press' | 'university-press' | 'commercial-press' | 'vanity-press' | 'fanzine' | 'typewriter'
  condition: 'prestigious-press' | 'quality-publisher' | 'standard-publisher' | 'budget-printer' | 'amateur-press' | 'handwritten'
}

export interface PrintingLibrary {
  avgTypeClarity: number
  avgDocQuality: number
  avgBinding: number
  totalIllustrations: number
  isWellDocumented: boolean
  overallPublishing: number
}

export interface PrintingPressStats {
  totalFiles: number
  totalShops: number
  avgTypeClarity: number
  avgDocumentationQuality: number
  avgReproducibility: number
  avgCirculationReach: number
  avgPrintRun: number
  avgBindingQuality: number
  gutenbergBibleCount: number
  firstEditionCount: number
  qualityPrintCount: number
  massMarketCount: number
  mimeographCount: number
  smudgedManuscriptCount: number
  serifFontCount: number
  monospaceFontCount: number
  hieroglyphFontCount: number
  hasConsistentFontCount: number
  hasIllustrationsCount: number
  hasColophonCount: number
  isAcidFreeCount: number
  hasTableOfContentsCount: number
  hasIndexCount: number
  hasTranslationsCount: number
  hasErrataCount: number
  fullColorDocCount: number
  blankPagesCount: number
  overallPublishing: number
  publisherGrade: 'master-publisher' | 'publisher' | 'editor' | 'typesetter' | 'proofreader' | 'scribe'
  clearestType: string
  bestDocumented: string
  bestBound: string
  widestCirculation: string
  mostReproducible: string
}

export interface PrintingPressResult {
  pages: PrintedPage[]
  shops: PrintShop[]
  library: PrintingLibrary
  stats: PrintingPressStats
  recommendations: string[]
}

// ─── Utility helpers ──────────────────────────────────────

const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n))

function countLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').length
}

function countImports(content: string): number {
  return (content.match(/^import\s/gm) || []).length
}

function countExports(content: string): number {
  return (content.match(/^export\s/gm) || []).length
}

function countFunctions(content: string): number {
  return (content.match(/\bfunction\s+\w+/g) || []).length + (content.match(/\b\w+\s*=\s*(?:async\s+)?\(/g) || []).length
}

function countClasses(content: string): number {
  return (content.match(/\bclass\s+\w+/g) || []).length
}

function countInterfaces(content: string): number {
  return (content.match(/\binterface\s+\w+/g) || []).length
}

function countTypeAliases(content: string): number {
  return (content.match(/\btype\s+\w+\s*=/g) || []).length
}

function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)\b/g) || []).length
    + (content.match(/:\s*\w+\[/g) || []).length
}

function countJSDoc(content: string): number {
  return (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
}

function countComments(content: string): number {
  return (content.match(/\/\/.*$/gm) || []).length + countJSDoc(content)
}

function countTests(content: string): number {
  return (content.match(/\b(it|test|describe)\s*\(/g) || []).length
}

function countErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{/g) || []).length + (content.match(/\bthrow\s/g) || []).length + (content.match(/\.catch\s*\(/g) || []).length
}

function countTODO(content: string): number {
  return (content.match(/\bTODO\b/g) || []).length + (content.match(/\bFIXME\b/g) || []).length
}

function countDeprecated(content: string): number {
  return (content.match(/@deprecated\b/g) || []).length
}

function countCodeExamples(content: string): number {
  return (content.match(/@example\b/g) || []).length
}

function countNesting(content: string): number {
  let maxDepth = 0
  let depth = 0
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('}') || trimmed.endsWith('}')) {
      depth = Math.max(0, depth - 1)
    }
    if (trimmed.includes('{')) {
      depth++
      maxDepth = Math.max(maxDepth, depth)
    }
  }
  return maxDepth
}

// ─── Measure functions ────────────────────────────────────

/**
 * @example
 * const tf = measureTypeface('function processData() {}')
 * // tf.clarity >= 0
 */
export function measureTypeface(content: string): TypefaceMeasure {
  const loc = countLines(content)
  const functions = countFunctions(content)
  const exports = countExports(content)
  const camelCase = (content.match(/\b[a-z][a-zA-Z0-9]{3,}\b/g) || []).length
  const snakeCase = (content.match(/\b[a-z][a-z0-9]*_[a-z0-9_]*\b/g) || []).length
  const total = camelCase + snakeCase

  const clarity = loc === 0 ? 100 : clamp(Math.round(
    (functions > 0 ? 30 : 0) +
    (exports > 0 ? 20 : 0) +
    (total > 5 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 30 : 0)
  ), 0, 100)

  const hasConsistentFont = total > 0 && (camelCase === 0 || snakeCase === 0)
  const hasKerning = loc > 0 && (loc / Math.max(functions, 1)) < 30
  const orphanCount = (content.match(/\bundefined\b/g) || []).length
  const widowCount = (content.match(/\bnull\b/g) || []).length
  const hasOrphans = orphanCount > 3
  const hasWidows = widowCount > 3
  const hasLigatures = countClasses(content) > 0 && countInterfaces(content) > 0
  const isReadable = clarity >= 50

  let style: TypefaceMeasure['style']
  if (clarity >= 80) style = 'serif'
  else if (clarity >= 60) style = 'sans-serif'
  else if (clarity >= 40) style = 'monospace'
  else if (clarity >= 25) style = 'gothic'
  else if (clarity >= 15) style = 'script'
  else style = 'hieroglyph'

  return {
    clarity,
    hasConsistentFont,
    hasKerning,
    hasLigatures,
    hasOrphans,
    hasWidows,
    isReadable,
    orphanCount,
    style,
    widowCount,
  }
}

/**
 * @example
 * const ink = measureInk('export function core() {}')
 * // ink.quality >= 0
 */
export function measureInk(content: string): InkMeasure {
  const loc = countLines(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const examples = countCodeExamples(content)

  const quality = loc === 0 ? 100 : clamp(Math.round(
    (jsdoc > 0 ? 30 : 0) +
    (comments > loc * 0.1 ? 25 : 0) +
    (examples > 0 ? 25 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0)
  ), 0, 100)

  const isDark = jsdoc >= 3 && comments >= loc * 0.15
  const isFaded = comments < loc * 0.05 && jsdoc < 2
  const isSmudged = comments > 0 && jsdoc === 0 && loc > 10
  const hasBleed = jsdoc > 0 && examples === 0 && loc > 20
  const isWaterproof = quality >= 60 && countErrorHandling(content) > 0
  const illustrationCount = examples
  const hasIllustrations = examples > 0
  const hasColophon = (content.match(/^\/\//gm) || []).length > 0 && loc > 3 && (content.split('\n')[0]?.startsWith('//') ?? false)

  return {
    hasColophon,
    hasIllustrations,
    hasBleed,
    illustrationCount,
    isDark,
    isFaded,
    isSmudged,
    isWaterproof,
    quality,
  }
}

/**
 * @example
 * const plate = measurePlate('interface Config { name: string }')
 * // plate.hasEngraving = true
 */
export function measurePlate(content: string): PlateMeasure {
  const loc = countLines(content)
  const types = countTypeAliases(content)
  const interfaces = countInterfaces(content)
  const classes = countClasses(content)
  const functions = countFunctions(content)
  const deprecated = countDeprecated(content)
  const todo = countTODO(content)

  const quality = loc === 0 ? 100 : clamp(Math.round(
    (interfaces > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (classes > 0 ? 15 : 0) +
    (functions > 0 ? 15 : 0) +
    (countExports(content) > 0 ? 15 : 0) +
    (deprecated === 0 ? 10 : 0)
  ), 0, 100)

  const hasEngraving = interfaces > 0
  const hasWoodcut = functions > 0 && interfaces === 0
  const hasLithograph = classes > 0 && interfaces > 0
  const hasPhotogravure = classes > 0 && interfaces > 0 && types > 0
  const isWellInked = quality >= 50
  const hasPlateWear = deprecated > 0
  const hasPlateMarks = todo > 0

  return {
    hasEngraving,
    hasLithograph,
    hasPhotogravure,
    hasPlateMarks,
    hasPlateWear,
    hasWoodcut,
    isWellInked,
    quality,
  }
}

/**
 * @example
 * const paper = measurePaper('const x = 1')
 * // paper.weight >= 0
 */
export function measurePaper(content: string): PaperMeasure {
  const loc = countLines(content)
  const weight = clamp(Math.round(loc / 3), 0, 100)
  const quality = loc === 0 ? 100 : clamp(Math.round(
    (loc < 50 ? 30 : 0) +
    (countNesting(content) < 4 ? 25 : 0) +
    (countErrorHandling(content) > 0 ? 25 : 0) +
    (countTODO(content) === 0 ? 20 : 0)
  ), 0, 100)

  const hasWatermark = (content.match(/@version\b/g) || []).length > 0 || (content.match(/@author\b/g) || []).length > 0
  const hasDeckleEdge = countTODO(content) > 0
  const isAcidFree = countDeprecated(content) === 0
  const hasFoxing = countDeprecated(content) > 0
  const isSmooth = countNesting(content) < 3
  const hasTooth = countNesting(content) >= 4

  return {
    hasDeckleEdge,
    hasFoxing,
    hasTooth,
    hasWatermark,
    isAcidFree,
    isSmooth,
    quality,
    weight,
  }
}

/**
 * @example
 * const binding = measureBinding('export { a, b, c }')
 * // binding.hasBibliography = true
 */
export function measureBinding(content: string): BindingMeasure {
  const loc = countLines(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const tests = countTests(content)

  const quality = loc === 0 ? 100 : clamp(Math.round(
    (imports > 0 ? 15 : 0) +
    (exports > 0 ? 15 : 0) +
    (functions > 0 ? 15 : 0) +
    (classes > 0 ? 10 : 0) +
    (tests > 0 ? 20 : 0) +
    (countInterfaces(content) > 0 ? 15 : 0) +
    (countErrorHandling(content) > 0 ? 10 : 0)
  ), 0, 100)

  const hasTableOfContents = exports >= 3
  const hasIndex = (content.match(/\bexport\s+(default\s+)?\w+/g) || []).length >= 2
  const hasBibliography = imports > 0
  const hasGlossary = countInterfaces(content) > 0 || countTypeAliases(content) > 0
  const isWellBound = quality >= 50
  const hasLoosePages = functions > 0 && exports === 0
  const hasDogEars = tests > 0

  let style: BindingMeasure['style']
  if (quality >= 80) style = 'hardcover'
  else if (quality >= 60) style = 'perfect-bind'
  else if (quality >= 45) style = 'softcover'
  else if (quality >= 30) style = 'spiral'
  else if (quality >= 15) style = 'saddle-stitch'
  else style = 'loose-leaf'

  return {
    hasBibliography,
    hasDogEars,
    hasGlossary,
    hasIndex,
    hasLoosePages,
    hasTableOfContents,
    isWellBound,
    quality,
    style,
  }
}

/**
 * @example
 * const circ = measureCirculation('export function api(): void {}')
 * // circ.hasTranslations = true
 */
export function measureCirculation(content: string): CirculationMeasure {
  const loc = countLines(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const todo = countTODO(content)

  const reach = loc === 0 ? 100 : clamp(Math.round(
    (exports > 0 ? 30 : 0) +
    (types > 0 ? 25 : 0) +
    (comments > 0 ? 20 : 0) +
    (countJSDoc(content) > 0 ? 25 : 0)
  ), 0, 100)

  const isFirstEdition = !content.includes('//') && !content.includes('/*') && loc > 0
  const hasRevisions = (content.match(/\/\/\s*(changed|updated|modified)/gi) || []).length > 0
  const errataCount = todo
  const hasErrata = errataCount > 0
  const hasTranslations = types > 0
  const hasAnnotations = comments > 0
  const isPublicDomain = exports > 0
  const isRareManuscript = exports === 0 && comments === 0 && loc > 5

  return {
    errataCount,
    hasAnnotations,
    hasErrata,
    hasRevisions,
    hasTranslations,
    isFirstEdition,
    isPublicDomain,
    isRareManuscript,
    reach,
  }
}

/**
 * @example
 * const print = measurePrint('export function a() {}')
 * // print.run >= 0
 */
export function measurePrint(content: string): PrintMeasure {
  const loc = countLines(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const examples = countCodeExamples(content)

  const docLines = jsdoc * 3 + comments + examples * 5
  const run = loc === 0 ? 100 : clamp(Math.round((docLines / loc) * 100), 0, 100)

  const hasFullColor = jsdoc >= 3 && examples >= 2
  const hasSpotColor = jsdoc >= 1 && jsdoc < 3
  const isBlackAndWhite = jsdoc === 0 && comments > 0
  const blankPageCount = loc > 10 && jsdoc === 0 && comments < 3 ? 1 : 0
  const hasBlankPages = blankPageCount > 0
  const hasOverprint = comments > loc * 0.5
  const isComplete = run >= 50

  return {
    blankPageCount,
    hasBlankPages,
    hasFullColor,
    hasOverprint,
    hasSpotColor,
    isBlackAndWhite,
    isComplete,
    run,
  }
}

// ─── Classification ───────────────────────────────────────

/**
 * @example
 * classifyPageCondition(85, 80, 75) // 'gutenberg-bible'
 */
export function classifyPageCondition(
  typeClarity: number,
  docQuality: number,
  bindingQuality: number,
): PrintedPage['condition'] {
  const score = (typeClarity + docQuality + bindingQuality) / 3
  if (score >= 75 && typeClarity >= 70) return 'gutenberg-bible'
  if (score >= 60 && docQuality >= 50) return 'first-edition'
  if (score >= 45) return 'quality-print'
  if (score >= 30) return 'mass-market'
  if (score >= 15) return 'mimeograph'
  return 'smudged-manuscript'
}

/**
 * @example
 * classifyShopType(pages) // 'royal-press'
 */
export function classifyShopType(pages: PrintedPage[]): PrintShop['shopType'] {
  if (pages.length === 0) return 'typewriter'
  const avgDoc = pages.reduce((s, p) => s + p.documentationQuality, 0) / pages.length
  const gutenbergRatio = pages.filter((p) => p.condition === 'gutenberg-bible').length / pages.length
  const smudgedRatio = pages.filter((p) => p.condition === 'smudged-manuscript').length / pages.length

  if (avgDoc >= 70 && gutenbergRatio >= 0.3) return 'royal-press'
  if (avgDoc >= 55) return 'university-press'
  if (avgDoc >= 40) return 'commercial-press'
  if (smudgedRatio >= 0.4) return 'fanzine'
  if (avgDoc >= 20) return 'vanity-press'
  return 'typewriter'
}

/**
 * @example
 * classifyShopCondition(avgDoc, avgBinding) // 'prestigious-press'
 */
export function classifyShopCondition(
  avgDoc: number,
  avgBinding: number,
): PrintShop['condition'] {
  const score = (avgDoc + avgBinding) / 2
  if (score >= 75) return 'prestigious-press'
  if (score >= 60) return 'quality-publisher'
  if (score >= 45) return 'standard-publisher'
  if (score >= 30) return 'budget-printer'
  if (score >= 15) return 'amateur-press'
  return 'handwritten'
}

/**
 * @example
 * classifyPublisherGrade(85) // 'master-publisher'
 */
export function classifyPublisherGrade(avgPublishing: number): PrintingPressStats['publisherGrade'] {
  if (avgPublishing >= 80) return 'master-publisher'
  if (avgPublishing >= 65) return 'publisher'
  if (avgPublishing >= 50) return 'editor'
  if (avgPublishing >= 35) return 'typesetter'
  if (avgPublishing >= 20) return 'proofreader'
  return 'scribe'
}

// ─── Analyze functions ────────────────────────────────────

/**
 * @example
 * const page = analyzePrintedPage(content, 'src/core.ts')
 * // page.typeClarity >= 0
 */
export function analyzePrintedPage(content: string, filePath: string): PrintedPage {
  const typeface = measureTypeface(content)
  const ink = measureInk(content)
  const paper = measurePaper(content)
  const binding = measureBinding(content)
  const circulation = measureCirculation(content)
  const print = measurePrint(content)

  const plate = measurePlate(content)

  const typeClarity = typeface.clarity
  const documentationQuality = ink.quality
  const reproducibility = clamp(Math.round(
    (countExports(content) > 0 ? 30 : 0) +
    (countFunctions(content) > 0 ? 20 : 0) +
    (countInterfaces(content) > 0 ? 20 : 0) +
    (print.isComplete ? 15 : 0) +
    (circulation.hasTranslations ? 15 : 0)
  ), 0, 100)
  const circulationReach = circulation.reach
  const printRun = print.run
  const bindingQuality = binding.quality

  const condition = classifyPageCondition(typeClarity, documentationQuality, bindingQuality)

  const qualityScore = clamp(Math.round(
    (typeClarity * 0.15) +
    (documentationQuality * 0.2) +
    (reproducibility * 0.15) +
    (circulationReach * 0.1) +
    (printRun * 0.1) +
    (bindingQuality * 0.15) +
    (paper.quality * 0.05) +
    (plate.quality * 0.1)
  ), 0, 100)

  return {
    binding,
    bindingQuality,
    circulation,
    circulationReach,
    condition,
    documentationQuality,
    file: filePath,
    ink,
    paper,
    plate,
    print,
    printRun,
    qualityScore,
    reproducibility,
    typeClarity,
    typeface,
  }
}

/**
 * @example
 * const shop = analyzePrintShop(pages, 'src')
 * // shop.shopType is defined
 */
export function analyzePrintShop(pages: PrintedPage[], dirPath: string): PrintShop {
  if (pages.length === 0) {
    return {
      avgBinding: 0,
      avgDocQuality: 0,
      avgTypeClarity: 0,
      completeDocCount: 0,
      condition: 'handwritten',
      directory: dirPath,
      gutenbergCount: 0,
      hasIllustrationsCount: 0,
      pages: [],
      shopType: 'typewriter',
      smudgedCount: 0,
    }
  }

  const avgTypeClarity = Math.round(pages.reduce((s, p) => s + p.typeClarity, 0) / pages.length)
  const avgDocQuality = Math.round(pages.reduce((s, p) => s + p.documentationQuality, 0) / pages.length)
  const avgBinding = Math.round(pages.reduce((s, p) => s + p.bindingQuality, 0) / pages.length)
  const gutenbergCount = pages.filter((p) => p.condition === 'gutenberg-bible').length
  const smudgedCount = pages.filter((p) => p.condition === 'smudged-manuscript').length
  const completeDocCount = pages.filter((p) => p.print.isComplete).length
  const hasIllustrationsCount = pages.filter((p) => p.ink.hasIllustrations).length

  const shopType = classifyShopType(pages)
  const condition = classifyShopCondition(avgDocQuality, avgBinding)

  return {
    avgBinding,
    avgDocQuality,
    avgTypeClarity,
    completeDocCount,
    condition,
    directory: dirPath,
    gutenbergCount,
    hasIllustrationsCount,
    pages,
    shopType,
    smudgedCount,
  }
}

// ─── Recommendation generation ────────────────────────────

/**
 * @example
 * const recs = generateRecommendations(pages, shops, library, stats)
 * // recs.length > 0
 */
export function generateRecommendations(
  _pages: PrintedPage[],
  _shops: PrintShop[],
  library: PrintingLibrary,
  stats: PrintingPressStats,
): string[] {
  const recs: string[] = []

  if (library.overallPublishing < 35) {
    recs.push('Overall publishing quality is low - invest in documentation and type clarity')
  }

  if (stats.smudgedManuscriptCount > 0) {
    recs.push(`${stats.smudgedManuscriptCount} file(s) are smudged manuscripts - improve naming and documentation`)
  }

  if (stats.blankPagesCount > stats.totalFiles * 0.3) {
    recs.push('Many files lack documentation - add JSDoc comments and code examples')
  }

  if (stats.hieroglyphFontCount > 0) {
    recs.push(`${stats.hieroglyphFontCount} file(s) have hieroglyphic naming - use clear, consistent naming conventions`)
  }

  if (stats.hasErrataCount > 3) {
    recs.push('Many files have TODO/FIXME errata - resolve these to improve print quality')
  }

  if (stats.hasTranslationsCount < stats.totalFiles * 0.3) {
    recs.push('Few files have type annotations - add TypeScript types for better translations')
  }

  if (stats.hasIllustrationsCount < stats.totalFiles * 0.2) {
    recs.push('Few files have code examples in documentation - add @example blocks')
  }

  if (stats.hasColophonCount === 0 && stats.totalFiles >= 5) {
    recs.push('No files have file headers - consider adding colophon metadata to key modules')
  }

  if (library.avgDocQuality < 40) {
    recs.push('Documentation quality is below average - prioritize adding JSDoc to exported functions')
  }

  if (recs.length === 0) {
    recs.push('Your printing press is producing high-quality documentation - excellent code publishing')
  }

  return recs
}

// ─── Orchestrator ─────────────────────────────────────────

/**
 * @example
 * const result = buildPrintingPressResult(files, contents, {})
 * // result.stats.totalFiles > 0
 */
export function buildPrintingPressResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): PrintingPressResult {
  const pages: PrintedPage[] = files.map((file, i) =>
    analyzePrintedPage(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, PrintedPage[]>()
  for (const page of pages) {
    const dir = page.file.includes('/') ? page.file.substring(0, page.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(page)
    } else {
      dirMap.set(dir, [page])
    }
  }

  const shops: PrintShop[] = Array.from(dirMap.entries()).map(([dir, ps]) =>
    analyzePrintShop(ps, dir),
  )

  const avgTypeClarity = pages.length === 0 ? 0 : Math.round(pages.reduce((s, p) => s + p.typeClarity, 0) / pages.length)
  const avgDocQuality = pages.length === 0 ? 0 : Math.round(pages.reduce((s, p) => s + p.documentationQuality, 0) / pages.length)
  const avgBinding = pages.length === 0 ? 0 : Math.round(pages.reduce((s, p) => s + p.bindingQuality, 0) / pages.length)
  const totalIllustrations = pages.reduce((s, p) => s + p.ink.illustrationCount, 0)
  const overallPublishing = clamp(Math.round(
    (avgTypeClarity * 0.2) + (avgDocQuality * 0.3) + (avgBinding * 0.2) +
    (pages.length === 0 ? 0 : Math.round(pages.reduce((s, p) => s + p.reproducibility, 0) / pages.length) * 0.15) +
    (pages.length === 0 ? 0 : Math.round(pages.reduce((s, p) => s + p.printRun, 0) / pages.length) * 0.15)
  ), 0, 100)

  const library: PrintingLibrary = {
    avgBinding,
    avgDocQuality,
    avgTypeClarity,
    isWellDocumented: overallPublishing >= 55,
    overallPublishing,
    totalIllustrations,
  }

  const avgReproducibility = pages.length === 0 ? 0 : Math.round(pages.reduce((s, p) => s + p.reproducibility, 0) / pages.length)
  const avgCirculationReach = pages.length === 0 ? 0 : Math.round(pages.reduce((s, p) => s + p.circulationReach, 0) / pages.length)
  const avgPrintRun = pages.length === 0 ? 0 : Math.round(pages.reduce((s, p) => s + p.printRun, 0) / pages.length)
  const avgBindingQuality = avgBinding

  const stats: PrintingPressStats = {
    avgBindingQuality,
    avgCirculationReach,
    avgDocumentationQuality: avgDocQuality,
    avgPrintRun,
    avgReproducibility,
    avgTypeClarity,
    bestBound: findMax(pages, (p) => p.bindingQuality),
    bestDocumented: findMax(pages, (p) => p.documentationQuality),
    blankPagesCount: pages.filter((p) => p.print.hasBlankPages).length,
    clearestType: findMax(pages, (p) => p.typeClarity),
    firstEditionCount: pages.filter((p) => p.condition === 'first-edition').length,
    fullColorDocCount: pages.filter((p) => p.print.hasFullColor).length,
    gutenbergBibleCount: pages.filter((p) => p.condition === 'gutenberg-bible').length,
    hasColophonCount: pages.filter((p) => p.ink.hasColophon).length,
    hasConsistentFontCount: pages.filter((p) => p.typeface.hasConsistentFont).length,
    hasErrataCount: pages.filter((p) => p.circulation.hasErrata).length,
    hasIllustrationsCount: pages.filter((p) => p.ink.hasIllustrations).length,
    hasIndexCount: pages.filter((p) => p.binding.hasIndex).length,
    hasTableOfContentsCount: pages.filter((p) => p.binding.hasTableOfContents).length,
    hasTranslationsCount: pages.filter((p) => p.circulation.hasTranslations).length,
    hieroglyphFontCount: pages.filter((p) => p.typeface.style === 'hieroglyph').length,
    isAcidFreeCount: pages.filter((p) => p.paper.isAcidFree).length,
    massMarketCount: pages.filter((p) => p.condition === 'mass-market').length,
    mimeographCount: pages.filter((p) => p.condition === 'mimeograph').length,
    monospaceFontCount: pages.filter((p) => p.typeface.style === 'monospace').length,
    mostReproducible: findMax(pages, (p) => p.reproducibility),
    overallPublishing,
    publisherGrade: classifyPublisherGrade(overallPublishing),
    qualityPrintCount: pages.filter((p) => p.condition === 'quality-print').length,
    serifFontCount: pages.filter((p) => p.typeface.style === 'serif').length,
    smudgedManuscriptCount: pages.filter((p) => p.condition === 'smudged-manuscript').length,
    totalFiles: files.length,
    totalShops: shops.length,
    widestCirculation: findMax(pages, (p) => p.circulationReach),
  }

  const recommendations = generateRecommendations(pages, shops, library, stats)

  return {
    library,
    pages,
    recommendations,
    shops,
    stats,
  }
}

function findMax(pages: PrintedPage[], getter: (p: PrintedPage) => number): string {
  if (pages.length === 0) return 'none'
  let best = pages[0] as PrintedPage
  let bestVal = getter(best)
  for (let i = 1; i < pages.length; i++) {
    const page = pages[i] as PrintedPage
    const val = getter(page)
    if (val > bestVal) {
      best = page
      bestVal = val
    }
  }
  return best?.file ?? ''
}
