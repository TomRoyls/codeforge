// ─── Regex Constants ────────────────────────────────────────────────────────

const EXPORT_REGEX = /\bexport\s+/g
const IMPORT_REGEX = /\bimport\s+/g
const FUNCTION_REGEX = /\bfunction\s+\w+/g
const ARROW_REGEX = /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g
const CLASS_REGEX = /\bclass\s+\w+/g
const INTERFACE_REGEX = /\binterface\s+\w+/g
const TYPE_REGEX = /\btype\s+\w+/g
const ENUM_REGEX = /\benum\s+\w+/g
const JSDOC_REGEX = /\/\*\*[\s\S]*?\*\//g
const ASYNC_REGEX = /\basync\s+/g
const TRY_CATCH_REGEX = /\btry\s*\{/g
const DEEP_NESTED_REGEX = /\{[^{}]*\{[^{}]*\{[^{}]*\}/g
const CONSOLE_REGEX = /\bconsole\.\w+/g
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi
const GENERICS_REGEX = /<[^>]+>/g
const PRIVATE_REGEX = /private\s+/g
const PROTECTED_REGEX = /protected\s+/g
const ANY_REGEX = /\bany\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g
const COMMENT_REGEX = /\/\/.*$/gm
const BLOCK_COMMENT_REGEX = /\/\*[\s\S]*?\*\//g
const DECORATOR_REGEX = /@\w+/g

// ─── Helper Functions ────────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function countImportKeywords(content: string): number { return countMatches(content, IMPORT_REGEX) }
function countExportKeywords(content: string): number { return countMatches(content, EXPORT_REGEX) }
function countClassKeywords(content: string): number { return countMatches(content, CLASS_REGEX) }
function countInterfaceKeywords(content: string): number { return countMatches(content, INTERFACE_REGEX) }
function countTypeKeywords(content: string): number { return countMatches(content, TYPE_REGEX) }
function countEnumKeywords(content: string): number { return countMatches(content, ENUM_REGEX) }
function countFunctionKeywords(content: string): number { return countMatches(content, FUNCTION_REGEX) }
function countArrowFunctions(content: string): number { return countMatches(content, ARROW_REGEX) }
function countJSDocBlocks(content: string): number { return countMatches(content, JSDOC_REGEX) }
function countAsyncKeywords(content: string): number { return countMatches(content, ASYNC_REGEX) }
function countTryCatch(content: string): number { return countMatches(content, TRY_CATCH_REGEX) }
function countDeepNested(content: string): number { return countMatches(content, DEEP_NESTED_REGEX) }
function countConsoleUsage(content: string): number { return countMatches(content, CONSOLE_REGEX) }
function countTodoComments(content: string): number { return countMatches(content, TODO_REGEX) }
function countGenericsUsage(content: string): number { return countMatches(content, GENERICS_REGEX) }
function countPrivateMembers(content: string): number { return countMatches(content, PRIVATE_REGEX) }
function countProtectedMembers(content: string): number { return countMatches(content, PROTECTED_REGEX) }
function countAnyUsage(content: string): number { return countMatches(content, ANY_REGEX) }
function countCommentedCode(content: string): number { return countMatches(content, COMMENTED_CODE_REGEX) }
function countReExports(content: string): number { return countMatches(content, REEXPORT_REGEX) }
function countLineComments(content: string): number { return countMatches(content, COMMENT_REGEX) }
function countBlockComments(content: string): number { return countMatches(content, BLOCK_COMMENT_REGEX) }
function countDecorators(content: string): number { return countMatches(content, DECORATOR_REGEX) }

function genericsCount_safe(content: string): number { return countMatches(content, GENERICS_REGEX) }
function reExportCount_safe(content: string): number { return countMatches(content, REEXPORT_REGEX) }
function enumCount_safe(content: string): number { return countMatches(content, ENUM_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface ScrollMeasure {
  quality: number
  condition: 'pristine-scroll' | 'well-preserved' | 'aged' | 'fragmentary' | 'damaged' | 'lost'
  hasHighQuality: boolean
  hasProperInk: boolean
  hasClearScript: boolean
  hasNoFading: boolean
  hasIllumination: boolean
  hasNoSmudging: boolean
  hasProperBinding: boolean
  hasMarginalia: boolean
  hasNoWaterDamage: boolean
  hasTableOfContents: boolean
  fadingCount: number
  smudgingCount: number
}

export interface ScholarlyMeasure {
  depth: number
  rank: 'grand-scholar' | 'professor' | 'scholar' | 'student' | 'novice' | 'illiterate'
  hasHighDepth: boolean
  hasThorough: boolean
  hasProperCitations: boolean
  hasNoPlagiarism: boolean
  hasOriginalThought: boolean
  hasNoSuperficiality: boolean
  hasPeerReview: boolean
  hasProperMethodology: boolean
  hasNoErrors: boolean
  hasCrossReference: boolean
  plagiarismCount: number
  errorCount: number
}

export interface CatalogMeasure {
  organization: number
  system: 'dewey-perfect' | 'well-cataloged' | 'organized' | 'partial' | 'chaotic' | 'nonexistent'
  hasHighOrganization: boolean
  hasProperShelving: boolean
  hasAlphabetical: boolean
  hasNoMisplaced: boolean
  hasProperIndex: boolean
  hasNoOrphans: boolean
  hasSubjectHeadings: boolean
  hasNoDuplicates: boolean
  hasProperCrossRef: boolean
  hasNoGaps: boolean
  misplacedCount: number
  orphanCount: number
}

export interface PreservationMeasure {
  quality: number
  state: 'timeless' | 'enduring' | 'stable' | 'aging' | 'decaying' | 'crumbling'
  hasHighQuality: boolean
  hasClimateControl: boolean
  hasProperStorage: boolean
  hasNoMold: boolean
  hasAcidFree: boolean
  hasNoPestDamage: boolean
  hasProperRestoration: boolean
  hasNoDegradation: boolean
  hasBackup: boolean
  hasNoLoss: boolean
  moldCount: number
  pestCount: number
}

export interface IlluminationMeasure {
  beauty: number
  style: 'masterwork' | 'ornate' | 'elegant' | 'plain' | 'rough' | 'ugly'
  hasHighBeauty: boolean
  hasGoldLeaf: boolean
  hasProperCalligraphy: boolean
  hasDecorativeBorders: boolean
  hasNoSmears: boolean
  hasVibrant: boolean
  hasProperSpacing: boolean
  hasNoClutter: boolean
  hasHarmonious: boolean
  hasNoStains: boolean
  smearCount: number
  clutterCount: number
}

export interface WisdomMeasure {
  level: number
  grade: 'enlightened' | 'wise' | 'learned' | 'informed' | 'ignorant' | 'foolish'
  hasHighWisdom: boolean
  hasTeachingValue: boolean
  hasHistoricalContext: boolean
  hasNoFalsehoods: boolean
  hasPracticalApplication: boolean
  hasNoDogma: boolean
  hasTransferable: boolean
  hasNoOutdated: boolean
  hasEnduring: boolean
  hasNoConfusion: boolean
  falsehoodCount: number
  dogmaCount: number
}

export interface ManuscriptPage {
  file: string
  scrollQuality: number
  scholarlyDepth: number
  catalogOrganization: number
  preservationQuality: number
  illuminationBeauty: number
  wisdomLevel: number
  scroll: ScrollMeasure
  scholarly: ScholarlyMeasure
  catalog: CatalogMeasure
  preservation: PreservationMeasure
  illumination: IlluminationMeasure
  wisdom: WisdomMeasure
  condition: 'sacred-text' | 'valued-manuscript' | 'reference-work' | 'pamphlet' | 'fragment' | 'dust'
  qualityScore: number
}

export interface LibraryWing {
  directory: string
  pages: ManuscriptPage[]
  avgScroll: number
  avgScholarly: number
  avgWisdom: number
  sacredCount: number
  dustCount: number
  scholarCount: number
  organizedCount: number
  wingType: 'grand-archive' | 'reading-room' | 'study-hall' | 'scroll-rack' | 'bookshelf' | 'empty-shelf'
  condition: 'great-library' | 'scholars-haven' | 'reading-room' | 'storage' | 'attic' | 'ruins'
}

export interface AncientLibraryResult {
  pages: ManuscriptPage[]
  wings: LibraryWing[]
  institution: {
    avgScroll: number
    avgScholarly: number
    avgWisdom: number
    isWise: boolean
    overallWisdom: number
  }
  stats: {
    totalFiles: number
    totalWings: number
    avgScrollQuality: number
    avgScholarlyDepth: number
    avgCatalogOrganization: number
    avgPreservationQuality: number
    avgIlluminationBeauty: number
    avgWisdomLevel: number
    sacredTextCount: number
    valuedManuscriptCount: number
    referenceWorkCount: number
    pamphletCount: number
    fragmentCount: number
    dustCount: number
    hasHighDocCount: number
    hasHighDepthCount: number
    hasHighOrgCount: number
    hasHighPreservationCount: number
    hasHighBeautyCount: number
    hasHighWisdomCount: number
    overallWisdom: number
    librarianGrade: 'head-librarian' | 'senior-scholar' | 'librarian' | 'clerk' | 'apprentice' | 'book-burner'
    bestPage: string
    bestDocumented: string
    deepest: string
    mostOrganized: string
    bestPreserved: string
    mostBeautiful: string
  }
  recommendations: string[]
}

// ─── Scroll Measurement ─────────────────────────────────────────────────────

/** @example measureScroll(content) returns scroll analysis */
export function measureScroll(content: string): ScrollMeasure {
  const jsdocCount = countJSDocBlocks(content)
  const lineCommentCount = countLineComments(content)
  const blockCommentCount = countBlockComments(content)
  const exportCount = countExportKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const classCount = countClassKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const decoratorCount = countDecorators(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0
  const hasDocumentation = jsdocCount > 0 || lineCommentCount > 0 || blockCommentCount > 0

  let quality = 20
  if (hasDocumentation) quality += 15
  if (jsdocCount > 0) quality += 10
  if (hasStructure) quality += 10
  if (hasTypes) quality += 10
  if (hasFunctions) quality += 8
  if (exportCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 5
  if (todoCount === 0) quality += 5
  if (deepNestedCount === 0) quality += 5
  if (decoratorCount > 0) quality += 2
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const fadingCount = consoleCount + anyCount
  const smudgingCount = todoCount + deepNestedCount

  const hasHighQuality = quality >= 75 && hasDocumentation && hasTypes
  const hasProperInk = jsdocCount > 0
  const hasClearScript = hasStructure && hasTypes
  const hasNoFading = fadingCount === 0
  const hasIllumination = decoratorCount > 0
  const hasNoSmudging = smudgingCount === 0
  const hasProperBinding = exportCount > 0 && hasStructure
  const hasMarginalia = lineCommentCount > 0
  const hasNoWaterDamage = consoleCount === 0
  const hasTableOfContents = interfaceCount > 0 && typeCount > 0

  let condition: ScrollMeasure['condition'] = 'lost'
  if (hasHighQuality && hasNoFading && hasNoSmudging && hasProperBinding) condition = 'pristine-scroll'
  else if (hasHighQuality && hasNoFading) condition = 'well-preserved'
  else if (hasHighQuality) condition = 'aged'
  else if (hasDocumentation && hasStructure) condition = 'fragmentary'
  else if (quality > 30) condition = 'damaged'

  return {
    quality, condition, hasHighQuality, hasProperInk, hasClearScript,
    hasNoFading, hasIllumination, hasNoSmudging, hasProperBinding,
    hasMarginalia, hasNoWaterDamage, hasTableOfContents, fadingCount, smudgingCount,
  }
}

// ─── Scholarly Measurement ──────────────────────────────────────────────────

/** @example measureScholarly(content) returns scholarly analysis */
export function measureScholarly(content: string): ScholarlyMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let depth = 20
  if (hasStructure) depth += 12
  if (hasTypes) depth += 12
  if (hasFunctions) depth += 10
  if (jsdocCount > 0) depth += 10
  if (genericsCount > 0) depth += 8
  if (exportCount > 0) depth += 5
  if (importCount > 0) depth += 5
  if (asyncCount > 0) depth += 5
  if (tryCatchCount > 0) depth += 5
  if (anyCount === 0) depth += 5
  if (consoleCount === 0) depth += 3
  depth = Math.min(100, Math.max(0, Math.round(depth)))

  const plagiarismCount = commentedCodeCount
  const errorCount = anyCount + consoleCount

  const hasHighDepth = depth >= 75 && hasStructure && hasTypes
  const hasThorough = hasStructure && hasTypes && hasFunctions
  const hasProperCitations = importCount > 0 && exportCount > 0
  const hasNoPlagiarism = plagiarismCount === 0
  const hasOriginalThought = genericsCount > 0 && hasFunctions
  const hasNoSuperficiality = deepNestedCount === 0
  const hasPeerReview = tryCatchCount > 0
  const hasProperMethodology = hasStructure && hasTypes && tryCatchCount > 0
  const hasNoErrors = errorCount === 0
  const hasCrossReference = importCount > 0 && exportCount > 0 && genericsCount > 0

  let rank: ScholarlyMeasure['rank'] = 'illiterate'
  if (hasHighDepth && hasNoErrors && hasNoPlagiarism && hasProperMethodology) rank = 'grand-scholar'
  else if (hasHighDepth && hasNoErrors) rank = 'professor'
  else if (hasHighDepth) rank = 'scholar'
  else if (hasThorough && hasProperCitations) rank = 'student'
  else if (depth > 30) rank = 'novice'

  return {
    depth, rank, hasHighDepth, hasThorough, hasProperCitations,
    hasNoPlagiarism, hasOriginalThought, hasNoSuperficiality, hasPeerReview,
    hasProperMethodology, hasNoErrors, hasCrossReference, plagiarismCount, errorCount,
  }
}

// ─── Catalog Measurement ────────────────────────────────────────────────────

/** @example measureCatalog(content) returns catalog analysis */
export function measureCatalog(content: string): CatalogMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const enumCount = enumCount_safe(content)
  const reExportCount = reExportCount_safe(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let organization = 20
  if (hasStructure) organization += 12
  if (hasTypes) organization += 12
  if (hasFunctions) organization += 10
  if (exportCount > 0) organization += 10
  if (importCount > 0) organization += 8
  if (enumCount > 0) organization += 5
  if (reExportCount > 0) organization += 5
  if (anyCount === 0) organization += 5
  if (consoleCount === 0) organization += 5
  if (deepNestedCount === 0) organization += 5
  if (privateCount === 0 && protectedCount === 0) organization += 3
  organization = Math.min(100, Math.max(0, Math.round(organization)))

  const misplacedCount = anyCount + consoleCount
  const orphanCount = todoCount + deepNestedCount

  const hasHighOrganization = organization >= 75 && hasStructure && hasTypes
  const hasProperShelving = hasStructure && hasTypes && hasFunctions
  const hasAlphabetical = exportCount > 0 && importCount > 0
  const hasNoMisplaced = misplacedCount === 0
  const hasProperIndex = interfaceCount > 0 && typeCount > 0 && classCount > 0
  const hasNoOrphans = orphanCount === 0
  const hasSubjectHeadings = enumCount > 0
  const hasNoDuplicates = deepNestedCount === 0 && commentedCodeCount_safe(content) === 0
  const hasProperCrossRef = reExportCount > 0 && importCount > 0
  const hasNoGaps = consoleCount === 0 && anyCount === 0

  let system: CatalogMeasure['system'] = 'nonexistent'
  if (hasHighOrganization && hasNoMisplaced && hasNoOrphans && hasProperCrossRef) system = 'dewey-perfect'
  else if (hasHighOrganization && hasNoMisplaced) system = 'well-cataloged'
  else if (hasHighOrganization) system = 'organized'
  else if (hasProperShelving && hasAlphabetical) system = 'partial'
  else if (organization > 30) system = 'chaotic'

  return {
    organization, system, hasHighOrganization, hasProperShelving,
    hasAlphabetical, hasNoMisplaced, hasProperIndex, hasNoOrphans,
    hasSubjectHeadings, hasNoDuplicates, hasProperCrossRef, hasNoGaps,
    misplacedCount, orphanCount,
  }
}

function commentedCodeCount_safe(content: string): number { return countMatches(content, COMMENTED_CODE_REGEX) }

// ─── Preservation Measurement ───────────────────────────────────────────────

/** @example measurePreservation(content) returns preservation analysis */
export function measurePreservation(content: string): PreservationMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let quality = 20
  if (hasStructure) quality += 10
  if (hasTypes) quality += 10
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 10
  if (tryCatchCount > 0) quality += 8
  if (asyncCount > 0) quality += 5
  if (genericsCount > 0) quality += 5
  if (exportCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 5
  if (todoCount === 0) quality += 2
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const moldCount = commentedCodeCount + anyCount
  const pestCount = todoCount + deepNestedCount

  const hasHighQuality = quality >= 75 && hasStructure && hasTypes && tryCatchCount > 0
  const hasClimateControl = tryCatchCount > 0 && asyncCount > 0
  const hasProperStorage = hasStructure && hasTypes && exportCount > 0
  const hasNoMold = moldCount === 0
  const hasAcidFree = consoleCount === 0 && deepNestedCount === 0
  const hasNoPestDamage = pestCount === 0
  const hasProperRestoration = jsdocCount > 0 && hasFunctions
  const hasNoDegradation = consoleCount === 0 && anyCount === 0 && deepNestedCount === 0
  const hasBackup = importCount > 0 && exportCount > 0
  const hasNoLoss = todoCount === 0 && commentedCodeCount === 0

  let state: PreservationMeasure['state'] = 'crumbling'
  if (hasHighQuality && hasNoMold && hasNoPestDamage && hasClimateControl) state = 'timeless'
  else if (hasHighQuality && hasNoMold) state = 'enduring'
  else if (hasHighQuality) state = 'stable'
  else if (hasProperStorage && hasClimateControl) state = 'aging'
  else if (quality > 30) state = 'decaying'

  return {
    quality, state, hasHighQuality, hasClimateControl, hasProperStorage,
    hasNoMold, hasAcidFree, hasNoPestDamage, hasProperRestoration,
    hasNoDegradation, hasBackup, hasNoLoss, moldCount, pestCount,
  }
}

// ─── Illumination Measurement ───────────────────────────────────────────────

/** @example measureIllumination(content) returns illumination analysis */
export function measureIllumination(content: string): IlluminationMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const decoratorCount = countDecorators(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let beauty = 20
  if (hasStructure) beauty += 10
  if (hasTypes) beauty += 10
  if (hasFunctions) beauty += 10
  if (jsdocCount > 0) beauty += 10
  if (genericsCount > 0) beauty += 8
  if (exportCount > 0) beauty += 5
  if (decoratorCount > 0) beauty += 5
  if (anyCount === 0) beauty += 5
  if (consoleCount === 0) beauty += 5
  if (deepNestedCount === 0) beauty += 5
  if (privateCount === 0) beauty += 7
  beauty = Math.min(100, Math.max(0, Math.round(beauty)))

  const smearCount = consoleCount + anyCount
  const clutterCount = deepNestedCount + privateCount

  const hasHighBeauty = beauty >= 75 && hasStructure && hasTypes
  const hasGoldLeaf = decoratorCount > 0
  const hasProperCalligraphy = hasStructure && hasTypes && hasFunctions
  const hasDecorativeBorders = genericsCount > 0 && jsdocCount > 0
  const hasNoSmears = smearCount === 0
  const hasVibrant = genericsCount > 0 && decoratorCount > 0
  const hasProperSpacing = deepNestedCount === 0
  const hasNoClutter = clutterCount === 0
  const hasHarmonious = hasStructure && hasTypes && exportCount > 0
  const hasNoStains = consoleCount === 0

  let style: IlluminationMeasure['style'] = 'ugly'
  if (hasHighBeauty && hasNoSmears && hasNoClutter && hasGoldLeaf) style = 'masterwork'
  else if (hasHighBeauty && hasNoSmears) style = 'ornate'
  else if (hasHighBeauty) style = 'elegant'
  else if (hasProperCalligraphy && hasDecorativeBorders) style = 'plain'
  else if (beauty > 30) style = 'rough'

  return {
    beauty, style, hasHighBeauty, hasGoldLeaf, hasProperCalligraphy,
    hasDecorativeBorders, hasNoSmears, hasVibrant, hasProperSpacing,
    hasNoClutter, hasHarmonious, hasNoStains, smearCount, clutterCount,
  }
}

// ─── Wisdom Measurement ─────────────────────────────────────────────────────

/** @example measureWisdom(content) returns wisdom analysis */
export function measureWisdom(content: string): WisdomMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 20
  if (hasStructure) level += 10
  if (hasTypes) level += 10
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 10
  if (tryCatchCount > 0) level += 8
  if (asyncCount > 0) level += 5
  if (genericsCount > 0) level += 5
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  if (todoCount === 0) level += 2
  level = Math.min(100, Math.max(0, Math.round(level)))

  const falsehoodCount = anyCount + consoleCount
  const dogmaCount = todoCount + deepNestedCount

  const hasHighWisdom = level >= 75 && hasStructure && hasTypes && tryCatchCount > 0
  const hasTeachingValue = jsdocCount > 0 && hasFunctions
  const hasHistoricalContext = importCount > 0 && exportCount > 0
  const hasNoFalsehoods = falsehoodCount === 0
  const hasPracticalApplication = hasFunctions && exportCount > 0
  const hasNoDogma = dogmaCount === 0
  const hasTransferable = genericsCount > 0 && exportCount > 0
  const hasNoOutdated = todoCount === 0
  const hasEnduring = hasStructure && hasTypes && tryCatchCount > 0
  const hasNoConfusion = deepNestedCount === 0 && anyCount === 0

  let grade: WisdomMeasure['grade'] = 'foolish'
  if (hasHighWisdom && hasNoFalsehoods && hasNoDogma && hasTeachingValue) grade = 'enlightened'
  else if (hasHighWisdom && hasNoFalsehoods) grade = 'wise'
  else if (hasHighWisdom) grade = 'learned'
  else if (hasStructure && hasTypes && hasPracticalApplication) grade = 'informed'
  else if (level > 30) grade = 'ignorant'

  return {
    level, grade, hasHighWisdom, hasTeachingValue, hasHistoricalContext,
    hasNoFalsehoods, hasPracticalApplication, hasNoDogma, hasTransferable,
    hasNoOutdated, hasEnduring, hasNoConfusion, falsehoodCount, dogmaCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(page) returns condition string */
export function classifyCondition(page: ManuscriptPage): ManuscriptPage['condition'] {
  const { qualityScore } = page
  if (qualityScore >= 80) return 'sacred-text'
  if (qualityScore >= 65) return 'valued-manuscript'
  if (qualityScore >= 50) return 'reference-work'
  if (qualityScore >= 35) return 'pamphlet'
  if (qualityScore >= 20) return 'fragment'
  return 'dust'
}

// ─── Page Analysis ──────────────────────────────────────────────────────────

/** @example analyzeManuscriptPage(content, filePath) returns full page */
export function analyzeManuscriptPage(content: string, filePath: string): ManuscriptPage {
  const scroll = measureScroll(content)
  const scholarly = measureScholarly(content)
  const catalog = measureCatalog(content)
  const preservation = measurePreservation(content)
  const illumination = measureIllumination(content)
  const wisdom = measureWisdom(content)

  const scrollQuality = scroll.quality
  const scholarlyDepth = scholarly.depth
  const catalogOrganization = catalog.organization
  const preservationQuality = preservation.quality
  const illuminationBeauty = illumination.beauty
  const wisdomLevel = wisdom.level

  const qualityScore = Math.round(
    scrollQuality * 0.15 +
    scholarlyDepth * 0.15 +
    catalogOrganization * 0.15 +
    preservationQuality * 0.2 +
    illuminationBeauty * 0.15 +
    wisdomLevel * 0.2,
  )

  const result: ManuscriptPage = {
    file: filePath,
    scrollQuality, scholarlyDepth, catalogOrganization,
    preservationQuality, illuminationBeauty, wisdomLevel,
    scroll, scholarly, catalog, preservation, illumination, wisdom,
    condition: 'dust',
    qualityScore,
  }

  result.condition = classifyCondition(result)

  return result
}

// ─── Wing Analysis ──────────────────────────────────────────────────────────

/** @example analyzeLibraryWing(pages, dirPath) returns wing */
export function analyzeLibraryWing(pages: ManuscriptPage[], dirPath: string): LibraryWing {
  if (pages.length === 0) {
    return {
      directory: dirPath, pages: [], avgScroll: 0, avgScholarly: 0, avgWisdom: 0,
      sacredCount: 0, dustCount: 0, scholarCount: 0, organizedCount: 0,
      wingType: 'empty-shelf', condition: 'ruins',
    }
  }

  const avgScroll = Math.round(pages.reduce((s, p) => s + p.scrollQuality, 0) / pages.length)
  const avgScholarly = Math.round(pages.reduce((s, p) => s + p.scholarlyDepth, 0) / pages.length)
  const avgWisdom = Math.round(pages.reduce((s, p) => s + p.wisdomLevel, 0) / pages.length)

  const sacredCount = pages.filter((p) => p.condition === 'sacred-text').length
  const dustCount = pages.filter((p) => p.condition === 'dust').length
  const scholarCount = pages.filter((p) => p.scholarly.hasHighDepth).length
  const organizedCount = pages.filter((p) => p.catalog.hasHighOrganization).length

  const wingType = classifyWingType(pages)
  const avgScore = pages.reduce((s, p) => s + p.qualityScore, 0) / pages.length
  const condition = classifyWingCondition(avgScore)

  return {
    directory: dirPath, pages, avgScroll, avgScholarly, avgWisdom,
    sacredCount, dustCount, scholarCount, organizedCount, wingType, condition,
  }
}

// ─── Wing Classification ────────────────────────────────────────────────────

/** @example classifyWingType(pages) returns wing type */
export function classifyWingType(pages: ManuscriptPage[]): LibraryWing['wingType'] {
  if (pages.length === 0) return 'empty-shelf'
  const avgScore = pages.reduce((s, p) => s + p.qualityScore, 0) / pages.length
  const sacredCnt = pages.filter((p) => p.condition === 'sacred-text').length
  if (avgScore >= 75 && sacredCnt >= Math.ceil(pages.length * 0.3)) return 'grand-archive'
  if (avgScore >= 60) return 'reading-room'
  if (avgScore >= 45) return 'study-hall'
  if (avgScore >= 30) return 'scroll-rack'
  if (avgScore >= 15) return 'bookshelf'
  return 'empty-shelf'
}

/** @example classifyWingCondition(avgScore) returns condition */
export function classifyWingCondition(avgScore: number): LibraryWing['condition'] {
  if (avgScore >= 80) return 'great-library'
  if (avgScore >= 65) return 'scholars-haven'
  if (avgScore >= 50) return 'reading-room'
  if (avgScore >= 35) return 'storage'
  if (avgScore >= 20) return 'attic'
  return 'ruins'
}

/** @example classifyLibrarianGrade(avgWisdom) returns grade */
export function classifyLibrarianGrade(avgWisdom: number): AncientLibraryResult['stats']['librarianGrade'] {
  if (avgWisdom >= 80) return 'head-librarian'
  if (avgWisdom >= 65) return 'senior-scholar'
  if (avgWisdom >= 50) return 'librarian'
  if (avgWisdom >= 35) return 'clerk'
  if (avgWisdom >= 20) return 'apprentice'
  return 'book-burner'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(pages, wings, institution, stats) returns recommendations */
export function generateRecommendations(
  pages: ManuscriptPage[],
  wings: LibraryWing[],
  institution: AncientLibraryResult['institution'],
  stats: AncientLibraryResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgScrollQuality < 50) recs.push('Improve scroll quality — add more documentation')
  if (stats.avgScholarlyDepth < 50) recs.push('Deepen scholarly analysis — increase code complexity and types')
  if (stats.avgCatalogOrganization < 50) recs.push('Organize the catalog — improve code structure and exports')
  if (stats.avgPreservationQuality < 50) recs.push('Enhance preservation — add error handling and durability')
  if (stats.avgIlluminationBeauty < 50) recs.push('Beautify illumination — improve code aesthetics and clarity')
  if (stats.avgWisdomLevel < 50) recs.push('Cultivate wisdom — improve overall code knowledge and quality')
  if (stats.dustCount > pages.length * 0.5) recs.push('Too much dust — over half the codebase lacks knowledge value')
  if (stats.hasHighWisdomCount === 0) recs.push('No enlightened wisdom found — study your code with patience')
  if (wings.length > 0 && institution.overallWisdom < 60) recs.push('Overall wisdom is low — consult the head librarian')
  if (recs.length === 0) recs.push('Sacred text achieved — your ancient library holds the world\'s knowledge')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildAncientLibraryResult(files, contents, options) returns full result */
export function buildAncientLibraryResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): AncientLibraryResult {
  const pages: ManuscriptPage[] = files.map((file, i) =>
    analyzeManuscriptPage(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, ManuscriptPage[]>()
  for (const page of pages) {
    const dir = page.file.includes('/')
      ? page.file.substring(0, page.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(page)
    } else {
      dirMap.set(dir, [page])
    }
  }

  const wings: LibraryWing[] = Array.from(dirMap.entries()).map(([dir, dirPages]) =>
    analyzeLibraryWing(dirPages, dir),
  )

  const avgScroll = pages.length > 0
    ? Math.round(pages.reduce((s, p) => s + p.scrollQuality, 0) / pages.length)
    : 0
  const avgScholarly = pages.length > 0
    ? Math.round(pages.reduce((s, p) => s + p.scholarlyDepth, 0) / pages.length)
    : 0
  const avgWisdom = pages.length > 0
    ? Math.round(pages.reduce((s, p) => s + p.wisdomLevel, 0) / pages.length)
    : 0
  const overallWisdom = pages.length > 0
    ? Math.round(pages.reduce((s, p) => s + p.qualityScore, 0) / pages.length)
    : 0
  const isWise = overallWisdom >= 65

  const institution: AncientLibraryResult['institution'] = {
    avgScroll, avgScholarly, avgWisdom, isWise, overallWisdom,
  }

  const avgScrollQuality = avgScroll
  const avgScholarlyDepth = avgScholarly
  const avgCatalogOrganization = pages.length > 0
    ? Math.round(pages.reduce((s, p) => s + p.catalogOrganization, 0) / pages.length)
    : 0
  const avgPreservationQuality = pages.length > 0
    ? Math.round(pages.reduce((s, p) => s + p.preservationQuality, 0) / pages.length)
    : 0
  const avgIlluminationBeauty = pages.length > 0
    ? Math.round(pages.reduce((s, p) => s + p.illuminationBeauty, 0) / pages.length)
    : 0
  const avgWisdomLevel = avgWisdom

  const conditionCounts = {
    sacredText: 0, valuedManuscript: 0, referenceWork: 0,
    pamphlet: 0, fragment: 0, dust: 0,
  }
  for (const p of pages) {
    switch (p.condition) {
      case 'sacred-text': conditionCounts.sacredText++; break
      case 'valued-manuscript': conditionCounts.valuedManuscript++; break
      case 'reference-work': conditionCounts.referenceWork++; break
      case 'pamphlet': conditionCounts.pamphlet++; break
      case 'fragment': conditionCounts.fragment++; break
      case 'dust': conditionCounts.dust++; break
    }
  }

  const hasHighDocCount = pages.filter((p) => p.scroll.hasHighQuality).length
  const hasHighDepthCount = pages.filter((p) => p.scholarly.hasHighDepth).length
  const hasHighOrgCount = pages.filter((p) => p.catalog.hasHighOrganization).length
  const hasHighPreservationCount = pages.filter((p) => p.preservation.hasHighQuality).length
  const hasHighBeautyCount = pages.filter((p) => p.illumination.hasHighBeauty).length
  const hasHighWisdomCount = pages.filter((p) => p.wisdom.hasHighWisdom).length

  const bestPage = pages.length > 0
    ? pages.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file
    : ''
  const bestDocumented = pages.length > 0
    ? pages.reduce((best, p) => p.scrollQuality > best.scrollQuality ? p : best).file
    : ''
  const deepest = pages.length > 0
    ? pages.reduce((best, p) => p.scholarlyDepth > best.scholarlyDepth ? p : best).file
    : ''
  const mostOrganized = pages.length > 0
    ? pages.reduce((best, p) => p.catalogOrganization > best.catalogOrganization ? p : best).file
    : ''
  const bestPreserved = pages.length > 0
    ? pages.reduce((best, p) => p.preservationQuality > best.preservationQuality ? p : best).file
    : ''
  const mostBeautiful = pages.length > 0
    ? pages.reduce((best, p) => p.illuminationBeauty > best.illuminationBeauty ? p : best).file
    : ''

  const librarianGrade = classifyLibrarianGrade(overallWisdom)

  const stats: AncientLibraryResult['stats'] = {
    totalFiles: files.length, totalWings: wings.length,
    avgScrollQuality, avgScholarlyDepth, avgCatalogOrganization,
    avgPreservationQuality, avgIlluminationBeauty, avgWisdomLevel,
    sacredTextCount: conditionCounts.sacredText,
    valuedManuscriptCount: conditionCounts.valuedManuscript,
    referenceWorkCount: conditionCounts.referenceWork,
    pamphletCount: conditionCounts.pamphlet,
    fragmentCount: conditionCounts.fragment,
    dustCount: conditionCounts.dust,
    hasHighDocCount, hasHighDepthCount, hasHighOrgCount,
    hasHighPreservationCount, hasHighBeautyCount, hasHighWisdomCount,
    overallWisdom, librarianGrade,
    bestPage, bestDocumented, deepest, mostOrganized, bestPreserved, mostBeautiful,
  }

  const recommendations = generateRecommendations(pages, wings, institution, stats)

  return { pages, wings, institution, stats, recommendations }
}
