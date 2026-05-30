// ─── Types ──────────────────────────────────────────────────────────────────

export type CatalogSystem = 'dewey-decimal' | 'library-of-congress' | 'universal-decimal' | 'colon-classification' | 'alphabetical' | 'chaotic'
export type ShelfLocation = 'reference' | 'stacks' | 'special-collections' | 'periodicals' | 'reserves' | 'storage'
export type CircStatus = 'available' | 'checked-out' | 'on-hold' | 'reference-only' | 'lost' | 'withdrawn'
export type ReadLevel = 'children' | 'young-adult' | 'general' | 'academic' | 'technical' | 'esoteric'
export type ValueCategory = 'rare-first-edition' | 'valuable' | 'standard-reference' | 'general-collection' | 'pulp' | 'pamphlet'
export type BookCondition = 'rare-manuscript' | 'first-edition' | 'reference-work' | 'well-thumbed' | 'pamphlet' | 'scrap-paper'
export type FloorType = 'rare-books' | 'reference-room' | 'main-stacks' | 'periodicals' | 'storage' | 'dumpster'
export type FloorCondition = 'prestigious-library' | 'university-library' | 'public-library' | 'school-library' | 'private-collection' | 'book-dumpster'
export type LibrarianGrade = 'head-librarian' | 'senior-librarian' | 'librarian' | 'library-assistant' | 'page' | 'bookworm'

export interface CatalogMeasure {
  quality: number
  system: CatalogSystem
  hasProperCallNumber: boolean
  hasAuthorEntry: boolean
  hasTitleEntry: boolean
  hasSubjectHeadings: boolean
  hasISBN: boolean
  hasBarcode: boolean
  hasMARCRecord: boolean
  isProperlyClassified: boolean
  hasMisplacedEntry: boolean
  subjectHeadingCount: number
}

export interface ShelfMeasure {
  order: number
  location: ShelfLocation
  isProperlyShelved: boolean
  isAccessible: boolean
  hasProperSpine: boolean
  hasDustJacket: boolean
  hasBookmarks: boolean
  hasTableOfContents: boolean
  hasIndex: boolean
  hasDogEared: boolean
  bookmarkCount: number
}

export interface ReferenceMeasure {
  system: number
  hasBibliography: boolean
  hasFootnotes: boolean
  hasCrossReferences: boolean
  hasGlossary: boolean
  hasAppendix: boolean
  hasConcordance: boolean
  hasCitations: boolean
  hasErrata: boolean
  citationCount: number
  crossReferenceCount: number
}

export interface CirculationMeasure {
  rate: number
  status: CircStatus
  isPopular: boolean
  isFrequentlyReferenced: boolean
  isRare: boolean
  isFirstEdition: boolean
  isLaterEdition: boolean
  hasWaitList: boolean
  hasOverdue: boolean
  hasDamage: boolean
  checkoutCount: number
}

export interface ReadingMeasure {
  quality: number
  level: ReadLevel
  isEngaging: boolean
  hasClearProse: boolean
  hasIllustrations: boolean
  hasLargePrint: boolean
  hasForeignLanguage: boolean
  hasTranslations: boolean
  hasChapterBreaks: boolean
  hasPageNumbers: boolean
  illustrationCount: number
}

export interface ValueMeasure {
  score: number
  category: ValueCategory
  isArchival: boolean
  hasHistoricalValue: boolean
  hasResearchValue: boolean
  hasPracticalValue: boolean
  hasCulturalValue: boolean
  isReplacementCandidate: boolean
  isPreservationCandidate: boolean
  valueFactors: string[]
}

export interface LibraryBook {
  file: string
  cataloguingQuality: number
  shelfOrder: number
  referenceSystem: number
  circulation: number
  readingRoom: number
  collectionValue: number
  catalog: CatalogMeasure
  shelf: ShelfMeasure
  reference: ReferenceMeasure
  circulationMeasure: CirculationMeasure
  reading: ReadingMeasure
  value: ValueMeasure
  condition: BookCondition
  qualityScore: number
}

export interface LibraryFloor {
  directory: string
  books: LibraryBook[]
  avgCataloguing: number
  avgShelfOrder: number
  avgReadingQuality: number
  rareManuscriptCount: number
  scrapPaperCount: number
  properlyShelvedCount: number
  frequentlyReferencedCount: number
  floorType: FloorType
  condition: FloorCondition
}

export interface LibraryStacksStats {
  totalFiles: number
  totalFloors: number
  avgCataloguingQuality: number
  avgShelfOrder: number
  avgReferenceSystem: number
  avgCirculation: number
  avgReadingRoom: number
  avgCollectionValue: number
  rareManuscriptCount: number
  firstEditionCount: number
  referenceWorkCount: number
  wellThumbedCount: number
  pamphletCount: number
  scrapPaperCount: number
  hasProperCallNumberCount: number
  isProperlyShelvedCount: number
  hasBibliographyCount: number
  hasCrossReferencesCount: number
  isPopularCount: number
  isFrequentlyReferencedCount: number
  hasClearProseCount: number
  hasIllustrationsCount: number
  isArchivalCount: number
  hasPracticalValueCount: number
  overallOrganization: number
  librarianGrade: LibrarianGrade
  bestBook: string
  bestOrganized: string
  bestReferenced: string
  mostPopular: string
  mostReadable: string
}

export interface LibraryStacksResult {
  books: LibraryBook[]
  floors: LibraryFloor[]
  library: {
    avgCataloguing: number
    avgShelfOrder: number
    avgReadingQuality: number
    isWellOrganized: boolean
    overallOrganization: number
  }
  stats: LibraryStacksStats
  recommendations: string[]
}

// ─── Regex Patterns ─────────────────────────────────────────────────────────

const IMPORT_RE = /import\s+(?:\{[^}]*\}|\w+)\s+from\s+['"]([^'"]+)['"]/g
const EXPORT_RE = /export\s+(?:default\s+)?(?:function|const|class|interface|type|enum|async\s+function)\s+(\w+)/g
const EXPORT_DEFAULT_RE = /export\s+default\s+/g
const FUNCTION_RE = /\bfunction\s+(\w+)/g
const ARROW_RE = /=>\s*[{(]/g
const TYPE_ANNOTATION_RE = /:\s*(?:string|number|boolean|void|Promise|Record|Map|Set|Array|Date|RegExp|Error|[A-Z]\w+)/
const INTERFACE_RE = /(?:interface|type)\s+\w+\s*(?:<[^>]+>)?\s*\{/
const CLASS_RE = /\bclass\s+\w+/
const GENERIC_RE = /<\w+>/
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const COMMENT_RE = /\/\/.*$/gm
const TRY_CATCH_RE = /try\s*\{/g
const PIPE_RE = /[.\s](map|filter|reduce|forEach|flatMap|find|some|every)\s*\(/g
const CONST_RE = /\bconst\s+/g
const LET_RE = /\blet\s+/g
const MUTATION_RE = /\.\s*(push|pop|shift|unshift|splice|sort|reverse)\s*\(/g
const SIDE_EFFECT_RE = /\b(console|process|fs|fetch|http|writeFile|readFile)\b/g
const ANY_TYPE_RE = /:\s*any\b/
const DEAD_CODE_RE = /\b(debugger|with)\s*[(;]/

// ─── measureCatalog ─────────────────────────────────────────────────────────

/**
 * Measure naming and organization quality
 * @example
 * measureCatalog('export function processData(input: Data): Result {}') // { quality: 70, ... }
 */
export function measureCatalog(content: string): CatalogMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      quality: 0, system: 'chaotic', hasProperCallNumber: false, hasAuthorEntry: false,
      hasTitleEntry: false, hasSubjectHeadings: false, hasISBN: false, hasBarcode: false,
      hasMARCRecord: false, isProperlyClassified: false, hasMisplacedEntry: false, subjectHeadingCount: 0,
    }
  }

  const exports = (content.match(EXPORT_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const defaults = (content.match(EXPORT_DEFAULT_RE) ?? []).length

  const hasProperCallNumber = exports > 0 && functions > 0
  const hasAuthorEntry = jsdoc > 0
  const hasTitleEntry = exports > 0
  const hasSubjectHeadings = interfaces > 0
  const hasISBN = exports > 0 && types > 0
  const hasBarcode = types > 0 && functions > 0
  const hasMARCRecord = jsdoc > 0 && types > 0
  const isProperlyClassified = hasProperCallNumber && hasBarcode
  const hasMisplacedEntry = defaults > 0

  let quality = 0
  if (hasProperCallNumber) quality += 20
  if (hasAuthorEntry) quality += 15
  if (hasTitleEntry) quality += 15
  if (hasSubjectHeadings) quality += 15
  if (hasISBN) quality += 15
  if (hasBarcode) quality += 10
  if (hasMARCRecord) quality += 10
  if (hasMisplacedEntry) quality -= 5
  quality = Math.max(0, Math.min(100, quality))

  let system: CatalogSystem = 'chaotic'
  if (quality >= 85) system = 'dewey-decimal'
  else if (quality >= 70) system = 'library-of-congress'
  else if (quality >= 55) system = 'universal-decimal'
  else if (quality >= 40) system = 'colon-classification'
  else if (quality >= 20) system = 'alphabetical'

  return {
    quality, system, hasProperCallNumber, hasAuthorEntry, hasTitleEntry,
    hasSubjectHeadings, hasISBN, hasBarcode, hasMARCRecord,
    isProperlyClassified, hasMisplacedEntry,
    subjectHeadingCount: interfaces,
  }
}

// ─── measureShelf ───────────────────────────────────────────────────────────

/**
 * Measure structural organization
 * @example
 * measureShelf('export function a() {} export function b() {}') // { order: 60, ... }
 */
export function measureShelf(content: string): ShelfMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      order: 0, location: 'storage', isProperlyShelved: false, isAccessible: false,
      hasProperSpine: false, hasDustJacket: false, hasBookmarks: false,
      hasTableOfContents: false, hasIndex: false, hasDogEared: false, bookmarkCount: 0,
    }
  }

  const exports = (content.match(EXPORT_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length

  const hasProperSpine = exports > 0
  const hasDustJacket = tryCatch > 0
  const hasBookmarks = imports > 0
  const hasTableOfContents = functions > 3 || classes > 0
  const hasIndex = interfaces > 0
  const hasDogEared = functions > 5

  let order = 0
  if (hasProperSpine) order += 25
  if (hasBookmarks) order += 15
  if (hasTableOfContents) order += 20
  if (hasIndex) order += 15
  if (hasDustJacket) order += 15
  if (hasDogEared) order -= 5
  order = Math.max(0, Math.min(100, order))

  const isProperlyShelved = order >= 60
  const isAccessible = exports > 0 || imports > 0

  let location: ShelfLocation = 'storage'
  if (order >= 80) location = 'reference'
  else if (order >= 60) location = 'stacks'
  else if (order >= 40) location = 'special-collections'
  else if (order >= 20) location = 'periodicals'
  else if (order >= 10) location = 'reserves'

  return {
    order, location, isProperlyShelved, isAccessible, hasProperSpine,
    hasDustJacket, hasBookmarks, hasTableOfContents, hasIndex,
    hasDogEared, bookmarkCount: imports,
  }
}

// ─── measureReference ───────────────────────────────────────────────────────

/**
 * Measure type system quality
 * @example
 * measureReference('import { X } from "y"; interface Z { a: number }') // { system: 70, ... }
 */
export function measureReference(content: string): ReferenceMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      system: 0, hasBibliography: false, hasFootnotes: false, hasCrossReferences: false,
      hasGlossary: false, hasAppendix: false, hasConcordance: false, hasCitations: false,
      hasErrata: false, citationCount: 0, crossReferenceCount: 0,
    }
  }

  const imports = (content.match(IMPORT_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length

  const hasBibliography = imports > 0
  const hasFootnotes = tryCatch > 0
  const hasCrossReferences = interfaces > 0
  const hasGlossary = interfaces > 0 && types > 0
  const hasAppendix = generics > 0
  const hasConcordance = classes > 0 && interfaces > 0
  const hasCitations = jsdoc > 0
  const hasErrata = anyTypes > 0

  let system = 0
  if (hasBibliography) system += 15
  if (hasFootnotes) system += 10
  if (hasCrossReferences) system += 15
  if (hasGlossary) system += 15
  if (hasAppendix) system += 10
  if (hasConcordance) system += 10
  if (hasCitations) system += 15
  system += Math.min(types * 2, 10)
  if (hasErrata) system -= 10
  system = Math.max(0, Math.min(100, system))

  return {
    system, hasBibliography, hasFootnotes, hasCrossReferences, hasGlossary,
    hasAppendix, hasConcordance, hasCitations, hasErrata,
    citationCount: jsdoc, crossReferenceCount: interfaces,
  }
}

// ─── measureCirculation ─────────────────────────────────────────────────────

/**
 * Measure code reuse and popularity
 * @example
 * measureCirculation('export function util() {} export function helper() {}') // { rate: 60, ... }
 */
export function measureCirculation(content: string): CirculationMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      rate: 0, status: 'withdrawn', isPopular: false, isFrequentlyReferenced: false,
      isRare: true, isFirstEdition: false, isLaterEdition: false, hasWaitList: false,
      hasOverdue: false, hasDamage: false, checkoutCount: 0,
    }
  }

  const exports = (content.match(EXPORT_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const mutations = (content.match(MUTATION_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length

  const reuseRatio = functions > 0 ? exports / functions : 0
  let rate = Math.round(reuseRatio * 50 + Math.min(exports * 5, 25) + Math.min(imports * 3, 25))
  rate = Math.max(0, Math.min(100, rate))

  const isPopular = exports >= 3
  const isFrequentlyReferenced = imports >= 3
  const isRare = exports === 0 && imports === 0
  const isFirstEdition = exports > 0 && mutations === 0
  const isLaterEdition = mutations > 0 && consts > 0
  const hasWaitList = imports > exports && exports > 0
  const hasOverdue = sideEffects > 0 && tryCatch_count(content) === 0
  const hasDamage = mutations > 0 || sideEffects > 0

  let status: CircStatus = 'available'
  if (rate >= 70) status = 'checked-out'
  else if (hasOverdue) status = 'on-hold'
  else if (exports === 0) status = 'reference-only'
  else if (rate <= 10) status = 'lost'

  return {
    rate, status, isPopular, isFrequentlyReferenced, isRare,
    isFirstEdition, isLaterEdition, hasWaitList, hasOverdue, hasDamage,
    checkoutCount: exports + imports,
  }
}

function tryCatch_count(content: string): number {
  return (content.match(TRY_CATCH_RE) ?? []).length
}

// ─── measureReading ─────────────────────────────────────────────────────────

/**
 * Measure readability
 * @example
 * measureReading('function add(a: number, b: number) { return a + b }') // { quality: 60, ... }
 */
export function measureReading(content: string): ReadingMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      quality: 0, level: 'esoteric', isEngaging: false, hasClearProse: false,
      hasIllustrations: false, hasLargePrint: false, hasForeignLanguage: false,
      hasTranslations: false, hasChapterBreaks: false, hasPageNumbers: false, illustrationCount: 0,
    }
  }

  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const comments = (content.match(COMMENT_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const deadCode = (content.match(DEAD_CODE_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length
  const lets = (content.match(LET_RE) ?? []).length

  const isEngaging = functions > 0 && pipes > 0
  const hasClearProse = types > 0 && (jsdoc > 0 || comments > 0)
  const hasIllustrations = jsdoc > 0
  const hasLargePrint = consts > 0 && lets === 0
  const hasForeignLanguage = anyTypes > 0
  const hasTranslations = pipes > 0 && functions > 0
  const hasChapterBreaks = functions > 2
  const hasPageNumbers = types > 0

  let quality = 20
  if (hasClearProse) quality += 20
  if (hasIllustrations) quality += 15
  if (hasLargePrint) quality += 10
  if (hasTranslations) quality += 10
  if (hasChapterBreaks) quality += 10
  if (hasPageNumbers) quality += 10
  if (hasForeignLanguage) quality -= 10
  if (deadCode > 0) quality -= 15
  quality = Math.max(0, Math.min(100, quality))

  let level: ReadLevel = 'esoteric'
  if (quality >= 85) level = 'children'
  else if (quality >= 70) level = 'young-adult'
  else if (quality >= 55) level = 'general'
  else if (quality >= 40) level = 'academic'
  else if (quality >= 20) level = 'technical'

  return {
    quality, level, isEngaging, hasClearProse, hasIllustrations,
    hasLargePrint, hasForeignLanguage, hasTranslations, hasChapterBreaks,
    hasPageNumbers, illustrationCount: jsdoc,
  }
}

// ─── measureValue ───────────────────────────────────────────────────────────

/**
 * Measure collection value
 * @example
 * measureValue('export function core(): Result {}') // { score: 60, ... }
 */
export function measureValue(content: string): ValueMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      score: 0, category: 'pamphlet', isArchival: false, hasHistoricalValue: false,
      hasResearchValue: false, hasPracticalValue: false, hasCulturalValue: false,
      isReplacementCandidate: false, isPreservationCandidate: false, valueFactors: [],
    }
  }

  const exports = (content.match(EXPORT_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const deadCode = (content.match(DEAD_CODE_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length

  const isArchival = exports > 0 && types > 0 && deadCode === 0
  const hasHistoricalValue = interfaces > 0
  const hasResearchValue = generics > 0
  const hasPracticalValue = exports > 0
  const hasCulturalValue = jsdoc > 0 && types > 0
  const isReplacementCandidate = deadCode > 0 || anyTypes > 2
  const isPreservationCandidate = exports > 0 && sideEffects === 0

  const valueFactors: string[] = []
  if (isArchival) valueFactors.push('archival')
  if (hasHistoricalValue) valueFactors.push('historical')
  if (hasResearchValue) valueFactors.push('research')
  if (hasPracticalValue) valueFactors.push('practical')
  if (hasCulturalValue) valueFactors.push('cultural')

  let score = 0
  if (isArchival) score += 25
  if (hasHistoricalValue) score += 15
  if (hasResearchValue) score += 15
  if (hasPracticalValue) score += 20
  if (hasCulturalValue) score += 15
  if (isReplacementCandidate) score -= 10
  score = Math.max(0, Math.min(100, score))

  let category: ValueCategory = 'pamphlet'
  if (score >= 85) category = 'rare-first-edition'
  else if (score >= 70) category = 'valuable'
  else if (score >= 50) category = 'standard-reference'
  else if (score >= 30) category = 'general-collection'
  else if (score >= 15) category = 'pulp'

  return {
    score, category, isArchival, hasHistoricalValue, hasResearchValue,
    hasPracticalValue, hasCulturalValue, isReplacementCandidate,
    isPreservationCandidate, valueFactors,
  }
}

// ─── analyzeLibraryBook ─────────────────────────────────────────────────────

/**
 * Analyze a single file as a library book
 * @example
 * analyzeLibraryBook('const x = 1', 'test.ts') // { qualityScore: 40, condition: 'pamphlet', ... }
 */
export function analyzeLibraryBook(content: string, filePath: string): LibraryBook {
  const catalog = measureCatalog(content)
  const shelf = measureShelf(content)
  const reference = measureReference(content)
  const circulation = measureCirculation(content)
  const reading = measureReading(content)
  const value = measureValue(content)

  const cataloguingQuality = catalog.quality
  const shelfOrder = shelf.order
  const referenceSystem = reference.system
  const circulationRate = circulation.rate
  const readingRoom = reading.quality
  const collectionValue = value.score

  const qualityScore = Math.round(
    (cataloguingQuality + shelfOrder + referenceSystem + circulationRate + readingRoom + collectionValue) / 6,
  )

  let condition: BookCondition = 'scrap-paper'
  if (qualityScore >= 90) condition = 'rare-manuscript'
  else if (qualityScore >= 75) condition = 'first-edition'
  else if (qualityScore >= 60) condition = 'reference-work'
  else if (qualityScore >= 40) condition = 'well-thumbed'
  else if (qualityScore >= 20) condition = 'pamphlet'

  return {
    file: filePath,
    cataloguingQuality, shelfOrder, referenceSystem, circulation: circulationRate,
    readingRoom, collectionValue,
    catalog, shelf, reference, circulationMeasure: circulation, reading, value,
    condition, qualityScore,
  }
}

// ─── classifyFloorType ──────────────────────────────────────────────────────

/**
 * Classify floor type based on books
 * @example
 * classifyFloorType(books) // 'main-stacks'
 */
export function classifyFloorType(books: LibraryBook[]): FloorType {
  if (books.length === 0) return 'dumpster'

  const avgQuality = books.reduce((s, x) => s + x.qualityScore, 0) / books.length
  const rareCount = books.filter((b) => b.condition === 'rare-manuscript').length

  if (avgQuality >= 80 && rareCount >= 2) return 'rare-books'
  if (avgQuality >= 65) return 'reference-room'
  if (avgQuality >= 50) return 'main-stacks'
  if (avgQuality >= 35) return 'periodicals'
  if (avgQuality >= 15) return 'storage'
  return 'dumpster'
}

// ─── classifyLibrarianGrade ─────────────────────────────────────────────────

/**
 * Classify librarian grade based on average organization
 * @example
 * classifyLibrarianGrade(85) // 'senior-librarian'
 */
export function classifyLibrarianGrade(avgOrg: number): LibrarianGrade {
  if (avgOrg >= 90) return 'head-librarian'
  if (avgOrg >= 75) return 'senior-librarian'
  if (avgOrg >= 55) return 'librarian'
  if (avgOrg >= 35) return 'library-assistant'
  if (avgOrg >= 15) return 'page'
  return 'bookworm'
}

// ─── classifyFloorCondition ─────────────────────────────────────────────────

function classifyFloorCondition(avgOrg: number): FloorCondition {
  if (avgOrg >= 85) return 'prestigious-library'
  if (avgOrg >= 65) return 'university-library'
  if (avgOrg >= 45) return 'public-library'
  if (avgOrg >= 25) return 'school-library'
  if (avgOrg >= 10) return 'private-collection'
  return 'book-dumpster'
}

// ─── analyzeLibraryFloor ────────────────────────────────────────────────────

/**
 * Analyze a directory as a library floor
 * @example
 * analyzeLibraryFloor(books, 'src/') // { floorType: 'main-stacks', ... }
 */
export function analyzeLibraryFloor(books: LibraryBook[], dirPath: string): LibraryFloor {
  if (books.length === 0) {
    return {
      directory: dirPath, books: [],
      avgCataloguing: 0, avgShelfOrder: 0, avgReadingQuality: 0,
      rareManuscriptCount: 0, scrapPaperCount: 0, properlyShelvedCount: 0,
      frequentlyReferencedCount: 0,
      floorType: 'dumpster', condition: 'book-dumpster',
    }
  }

  const avgCataloguing = Math.round(books.reduce((s, x) => s + x.cataloguingQuality, 0) / books.length)
  const avgShelfOrder = Math.round(books.reduce((s, x) => s + x.shelfOrder, 0) / books.length)
  const avgReadingQuality = Math.round(books.reduce((s, x) => s + x.readingRoom, 0) / books.length)
  const avgQuality = Math.round(books.reduce((s, x) => s + x.qualityScore, 0) / books.length)

  return {
    directory: dirPath, books,
    avgCataloguing, avgShelfOrder, avgReadingQuality,
    rareManuscriptCount: books.filter((b) => b.condition === 'rare-manuscript').length,
    scrapPaperCount: books.filter((b) => b.condition === 'scrap-paper').length,
    properlyShelvedCount: books.filter((b) => b.shelf.isProperlyShelved).length,
    frequentlyReferencedCount: books.filter((b) => b.circulationMeasure.isFrequentlyReferenced).length,
    floorType: classifyFloorType(books),
    condition: classifyFloorCondition(avgQuality),
  }
}

// ─── generateRecommendations ────────────────────────────────────────────────

/**
 * Generate improvement recommendations
 * @example
 * generateRecommendations(books, floors, library, stats) // ['Improve cataloguing...']
 */
export function generateRecommendations(
  books: LibraryBook[],
  floors: LibraryFloor[],
  _library: { avgCataloguing: number; avgShelfOrder: number; avgReadingQuality: number; isWellOrganized: boolean; overallOrganization: number },
  stats: LibraryStacksStats,
): string[] {
  const recs: string[] = []

  if (stats.scrapPaperCount > stats.totalFiles * 0.3) {
    recs.push('Too much scrap paper — refactor or remove low-value files')
  }
  if (stats.avgCataloguingQuality < 40) {
    recs.push('Poor cataloguing — add exports, type annotations, and JSDoc documentation')
  }
  if (stats.hasBibliographyCount < stats.totalFiles * 0.3) {
    recs.push('Missing bibliographies — most files lack import sections')
  }
  if (stats.hasCrossReferencesCount < stats.totalFiles * 0.2) {
    recs.push('Weak cross-reference system — add interfaces and shared types')
  }
  if (stats.avgReadingRoom < 40) {
    recs.push('Poor readability — add comments, type annotations, and clear naming')
  }
  if (stats.isProperlyShelvedCount < stats.totalFiles * 0.5) {
    recs.push('Improperly shelved books — improve file structure and exports')
  }
  if (stats.avgCirculation < 30) {
    recs.push('Low circulation — code is not being reused, extract utilities')
  }

  const worst = books.length > 0
    ? books.reduce((w, b) => b.qualityScore < w.qualityScore ? b : w, books[0] as typeof books[number])
    : null
  if (worst && worst.qualityScore < 25) {
    recs.push(`Weakest book "${worst.file}" needs cataloguing (score: ${worst.qualityScore})`)
  }

  if (floors.some((f) => f.condition === 'book-dumpster')) {
    recs.push('Some floors are book dumpsters — consider major reorganization')
  }

  return recs.length > 0 ? recs : ['Library is well-organized — maintain current practices']
}

// ─── buildLibraryStacksResult ───────────────────────────────────────────────

/**
 * Build the complete library stacks result
 * @example
 * buildLibraryStacksResult(['a.ts'], ['const x = 1'], {}) // { books: [...], ... }
 */
export function buildLibraryStacksResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): LibraryStacksResult {
  const books: LibraryBook[] = []
  for (let i = 0; i < files.length; i++) {
    books.push(analyzeLibraryBook(contents[i] ?? '', files[i] ?? ''))
  }

  const dirMap = new Map<string, LibraryBook[]>()
  for (const book of books) {
    const dir = book.file.includes('/') ? book.file.substring(0, book.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(book)
    } else {
      dirMap.set(dir, [book])
    }
  }

  const floors: LibraryFloor[] = []
  for (const [dir, dirBooks] of dirMap) {
    floors.push(analyzeLibraryFloor(dirBooks, dir))
  }

  const avgCataloguing = books.length > 0 ? Math.round(books.reduce((s, x) => s + x.cataloguingQuality, 0) / books.length) : 0
  const avgShelfOrder = books.length > 0 ? Math.round(books.reduce((s, x) => s + x.shelfOrder, 0) / books.length) : 0
  const avgReadingQuality = books.length > 0 ? Math.round(books.reduce((s, x) => s + x.readingRoom, 0) / books.length) : 0
  const overallOrganization = books.length > 0 ? Math.round(books.reduce((s, x) => s + x.qualityScore, 0) / books.length) : 0

  const library = {
    avgCataloguing, avgShelfOrder, avgReadingQuality,
    isWellOrganized: overallOrganization >= 60,
    overallOrganization,
  }

  const conditions = books.map((b) => b.condition)
  const bestBook = books.length > 0
    ? books.reduce((b, x) => x.qualityScore > b.qualityScore ? x : b, books[0] as typeof books[number])
    : null
  const bestOrganized = books.length > 0
    ? books.reduce((b, x) => x.cataloguingQuality > b.cataloguingQuality ? x : b, books[0] as typeof books[number])
    : null
  const bestReferenced = books.length > 0
    ? books.reduce((b, x) => x.referenceSystem > b.referenceSystem ? x : b, books[0] as typeof books[number])
    : null
  const mostPopular = books.length > 0
    ? books.reduce((b, x) => x.circulation > b.circulation ? x : b, books[0] as typeof books[number])
    : null
  const mostReadable = books.length > 0
    ? books.reduce((b, x) => x.readingRoom > b.readingRoom ? x : b, books[0] as typeof books[number])
    : null

  const stats: LibraryStacksStats = {
    totalFiles: books.length,
    totalFloors: floors.length,
    avgCataloguingQuality: avgCataloguing,
    avgShelfOrder,
    avgReferenceSystem: books.length > 0 ? Math.round(books.reduce((s, x) => s + x.referenceSystem, 0) / books.length) : 0,
    avgCirculation: books.length > 0 ? Math.round(books.reduce((s, x) => s + x.circulation, 0) / books.length) : 0,
    avgReadingRoom: avgReadingQuality,
    avgCollectionValue: books.length > 0 ? Math.round(books.reduce((s, x) => s + x.collectionValue, 0) / books.length) : 0,
    rareManuscriptCount: conditions.filter((c) => c === 'rare-manuscript').length,
    firstEditionCount: conditions.filter((c) => c === 'first-edition').length,
    referenceWorkCount: conditions.filter((c) => c === 'reference-work').length,
    wellThumbedCount: conditions.filter((c) => c === 'well-thumbed').length,
    pamphletCount: conditions.filter((c) => c === 'pamphlet').length,
    scrapPaperCount: conditions.filter((c) => c === 'scrap-paper').length,
    hasProperCallNumberCount: books.filter((b) => b.catalog.hasProperCallNumber).length,
    isProperlyShelvedCount: books.filter((b) => b.shelf.isProperlyShelved).length,
    hasBibliographyCount: books.filter((b) => b.reference.hasBibliography).length,
    hasCrossReferencesCount: books.filter((b) => b.reference.hasCrossReferences).length,
    isPopularCount: books.filter((b) => b.circulationMeasure.isPopular).length,
    isFrequentlyReferencedCount: books.filter((b) => b.circulationMeasure.isFrequentlyReferenced).length,
    hasClearProseCount: books.filter((b) => b.reading.hasClearProse).length,
    hasIllustrationsCount: books.filter((b) => b.reading.hasIllustrations).length,
    isArchivalCount: books.filter((b) => b.value.isArchival).length,
    hasPracticalValueCount: books.filter((b) => b.value.hasPracticalValue).length,
    overallOrganization,
    librarianGrade: classifyLibrarianGrade(overallOrganization),
    bestBook: bestBook?.file ?? '',
    bestOrganized: bestOrganized?.file ?? '',
    bestReferenced: bestReferenced?.file ?? '',
    mostPopular: mostPopular?.file ?? '',
    mostReadable: mostReadable?.file ?? '',
  }

  const recommendations = generateRecommendations(books, floors, library, stats)

  return { books, floors, library, stats, recommendations }
}
