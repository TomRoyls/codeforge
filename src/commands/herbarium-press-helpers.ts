// ─── Interfaces ──────────────────────────────────────────

export interface SpecimenMeasure {
  kingdom: 'animalia' | 'plantae' | 'fungi' | 'protista' | 'monera' | 'incertae-sedis'
  family: string
  genus: string
  species: string
  quality: number
  isTypeSpecimen: boolean
  isHolotype: boolean
  isWellPreserved: boolean
  isDegraded: boolean
  hasCharacteristics: string[]
}

export interface PreservationMeasure {
  state: number
  method: 'pressed' | 'liquid-preserved' | 'freeze-dried' | 'fossil' | 'live-collection' | 'decaying'
  isProperlyMounted: boolean
  hasArchivalQuality: boolean
  hasAcidFreeMount: boolean
  hasPestDamage: boolean
  hasFading: boolean
  hasDiscoloration: boolean
  pestDamageCount: number
}

export interface TaxonomyMeasure {
  clarity: number
  hasBinomialName: boolean
  hasCommonName: boolean
  hasScientificName: boolean
  isProperlyClassified: boolean
  hasMisidentification: boolean
  hasSynonyms: boolean
  hasObsoleteName: boolean
  synonymCount: number
  misidentificationCount: number
}

export interface CollectionMeasure {
  completeness: number
  hasAllParts: boolean
  hasRootSystem: boolean
  hasStem: boolean
  hasLeaves: boolean
  hasFlowers: boolean
  hasFruit: boolean
  hasSeeds: boolean
  missingParts: string[]
}

export interface LabelMeasure {
  accuracy: number
  hasCollectorName: boolean
  hasCollectionDate: boolean
  hasLocation: boolean
  hasHabitat: boolean
  hasDescription: boolean
  hasDetermination: boolean
  hasFieldNotes: boolean
  fieldNoteCount: number
  isProperlyLabelled: boolean
}

export interface CataloguingMeasure {
  quality: number
  hasAccessionNumber: boolean
  hasBarcode: boolean
  isProperlyFiled: boolean
  hasCrossReferences: boolean
  hasIndexEntry: boolean
  hasDigitalRecord: boolean
  crossReferenceCount: number
}

export interface HerbariumSheet {
  file: string
  specimenQuality: number
  preservationState: number
  taxonomicClarity: number
  collectionCompleteness: number
  labelAccuracy: number
  cataloguingQuality: number
  specimen: SpecimenMeasure
  preservation: PreservationMeasure
  taxonomy: TaxonomyMeasure
  collection: CollectionMeasure
  label: LabelMeasure
  cataloguing: CataloguingMeasure
  condition: 'type-specimen' | 'pristine-sheet' | 'well-curated' | 'adequately-stored' | 'degrading-specimen' | 'uncatalogued-scrap'
  qualityScore: number
}

export interface CabinetDrawer {
  directory: string
  sheets: HerbariumSheet[]
  avgSpecimenQuality: number
  avgPreservation: number
  avgTaxonomicClarity: number
  typeSpecimenCount: number
  degradingCount: number
  properlyLabelledCount: number
  completeSpecimenCount: number
  drawerType: 'climate-vault' | 'specimen-cabinet' | 'storage-drawer' | 'shoebox' | 'envelope' | 'compost-pile'
  condition: 'world-class-collection' | 'research-collection' | 'teaching-collection' | 'hobby-collection' | 'salvage-pile' | 'compost'
}

export interface HerbariumMuseum {
  avgSpecimenQuality: number
  avgPreservation: number
  avgTaxonomicClarity: number
  isWellCurated: boolean
  overallCuration: number
}

export interface HerbariumPressStats {
  totalFiles: number
  totalDrawers: number
  avgSpecimenQuality: number
  avgPreservationState: number
  avgTaxonomicClarity: number
  avgCollectionCompleteness: number
  avgLabelAccuracy: number
  avgCataloguingQuality: number
  typeSpecimenCount: number
  pristineSheetCount: number
  wellCuratedCount: number
  adequatelyStoredCount: number
  degradingCount: number
  uncataloguedScrapCount: number
  pressedCount: number
  fossilCount: number
  decayingCount: number
  isProperlyMountedCount: number
  hasPestDamageCount: number
  hasBinomialNameCount: number
  hasMisidentificationCount: number
  hasAllPartsCount: number
  isProperlyLabelledCount: number
  hasFieldNotesCount: number
  hasAccessionNumberCount: number
  hasDigitalRecordCount: number
  overallCuration: number
  botanistGrade: 'chief-botanist' | 'taxonomist' | 'botanist' | 'horticulturist' | 'gardener' | 'weed-puller'
  bestSpecimen: string
  bestPreserved: string
  clearestTaxonomy: string
  mostComplete: string
  bestLabelled: string
}

export interface HerbariumPressResult {
  sheets: HerbariumSheet[]
  drawers: CabinetDrawer[]
  museum: HerbariumMuseum
  stats: HerbariumPressStats
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

function countAsyncAwait(content: string): number {
  return (content.match(/\basync\s/g) || []).length + (content.match(/\bawait\s/g) || []).length
}

function countTryCatch(content: string): number {
  return (content.match(/\btry\s*\{/g) || []).length
}

function countErrorHandling(content: string): number {
  return countTryCatch(content) + (content.match(/\bthrow\s/g) || []).length + (content.match(/\.catch\s*\(/g) || []).length
}

function countConditions(content: string): number {
  return (content.match(/\bif\s*\(/g) || []).length
}

function countLoops(content: string): number {
  return (content.match(/\b(for|while)\s*\(/g) || []).length
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

function countTODO(content: string): number {
  return (content.match(/\bTODO\b/g) || []).length + (content.match(/\bFIXME\b/g) || []).length + (content.match(/\bHACK\b/g) || []).length
}

function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)\b/g) || []).length
    + (content.match(/:\s*\w+\[/g) || []).length
}

function countJSDoc(content: string): number {
  return (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
}

function countTests(content: string): number {
  return (content.match(/\b(it|test|describe)\s*\(/g) || []).length
}

function countReturnStatements(content: string): number {
  return (content.match(/\breturn\b/g) || []).length
}

function countDeprecated(content: string): number {
  return (content.match(/@deprecated/g) || []).length
}

function countAliases(content: string): number {
  return (content.match(/\bas\s+\w+/g) || []).length
}

function countComments(content: string): number {
  return (content.match(/\/\//g) || []).length + (content.match(/\/\*/g) || []).length
}

// ─── Measure functions ────────────────────────────────────

/**
 * @example
 * const specimen = measureSpecimen('export class Processor {}')
 * // specimen.quality >= 0
 */
export function measureSpecimen(content: string): SpecimenMeasure {
  const loc = countLines(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const functions = countFunctions(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const types = countTypeAliases(content)

  const quality = loc === 0 ? 0 : clamp(Math.round(
    (exports > 0 ? 15 : 0) +
    (classes > 0 ? 15 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (functions > 0 ? 10 : 0) +
    (types > 0 ? 10 : 0) +
    (imports > 0 ? 10 : 0) +
    (countErrorHandling(content) > 0 ? 10 : 0) +
    (countTypeAnnotations(content) > 0 ? 15 : 0)
  ), 0, 100)

  const isTypeSpecimen = exports > 0 && classes > 0 && interfaces > 0
  const isHolotype = exports > 0 && (content.match(/\bAbstract\b/g) || []).length > 0 || (content.match(/\bBase[A-Z]/g) || []).length > 0
  const isWellPreserved = quality >= 50
  const isDegraded = quality < 25

  const characteristics: string[] = []
  if (classes > 0) characteristics.push('class-based')
  if (interfaces > 0) characteristics.push('typed')
  if (countAsyncAwait(content) > 0) characteristics.push('async')
  if (functions > 3) characteristics.push('multi-function')
  if (exports > 2) characteristics.push('high-export')
  if (countTests(content) > 0) characteristics.push('tested')

  let kingdom: SpecimenMeasure['kingdom']
  if (classes > 0 && interfaces > 0) kingdom = 'animalia'
  else if (functions > 0 && exports > 0) kingdom = 'plantae'
  else if (countAsyncAwait(content) > 0) kingdom = 'fungi'
  else if (interfaces > 0 || types > 0) kingdom = 'protista'
  else if (functions > 0) kingdom = 'monera'
  else kingdom = 'incertae-sedis'

  const family = classes > 0 ? 'class-module' : interfaces > 0 ? 'interface-module' : functions > 0 ? 'function-module' : 'script'
  const genus = exports > 0 ? 'exported' : imports > 0 ? 'imported' : 'internal'
  const species = countAsyncAwait(content) > 0 ? 'async-implementation' : countTests(content) > 0 ? 'test-suite' : 'standard'

  return {
    family,
    genus,
    hasCharacteristics: characteristics,
    isDegraded,
    isHolotype: isHolotype && exports > 0,
    isTypeSpecimen,
    isWellPreserved,
    kingdom,
    quality,
    species,
  }
}

/**
 * @example
 * const pres = measurePreservation('try { x() } catch(e) {}')
 * // pres.state >= 0
 */
export function measurePreservation(content: string): PreservationMeasure {
  const loc = countLines(content)
  const errorHandling = countErrorHandling(content)
  const todo = countTODO(content)
  const tests = countTests(content)
  const types = countTypeAnnotations(content)
  const deprecated = countDeprecated(content)

  const pestDamageCount = todo + deprecated
  const hasPestDamage = pestDamageCount > 0
  const hasFading = deprecated > 0
  const hasDiscoloration = todo > 2
  const isProperlyMounted = errorHandling > 0 && types > 0
  const hasArchivalQuality = tests > 0 && errorHandling > 0
  const hasAcidFreeMount = deprecated === 0

  const state = loc === 0 ? 0 : clamp(Math.round(
    (errorHandling > 0 ? 25 : 0) +
    (tests > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (pestDamageCount === 0 ? 15 : 0) +
    (hasAcidFreeMount ? 15 : 0)
  ), 0, 100)

  let method: PreservationMeasure['method']
  if (state >= 80) method = 'live-collection'
  else if (state >= 60) method = 'freeze-dried'
  else if (state >= 40) method = 'pressed'
  else if (state >= 25) method = 'liquid-preserved'
  else if (state >= 10) method = 'fossil'
  else method = 'decaying'

  return {
    hasAcidFreeMount,
    hasArchivalQuality,
    hasDiscoloration,
    hasFading,
    hasPestDamage,
    isProperlyMounted,
    method,
    pestDamageCount,
    state,
  }
}

/**
 * @example
 * const tax = measureTaxonomy('export function processData() {}')
 * // tax.clarity >= 0
 */
export function measureTaxonomy(content: string): TaxonomyMeasure {
  const loc = countLines(content)
  const exports = countExports(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const classes = countClasses(content)
  const aliases = countAliases(content)
  const deprecated = countDeprecated(content)
  const jsdoc = countJSDoc(content)

  const hasBinomialName = exports > 0 && (classes > 0 || interfaces > 0)
  const hasCommonName = (content.match(/\b(get|set|is|has|can|should|will)\w+/g) || []).length > 0
  const hasScientificName = types > 0 || interfaces > 0
  const hasSynonyms = aliases > 0
  const synonymCount = aliases
  const hasObsoleteName = deprecated > 0
  const misidentificationCount = (content.match(/\bany\b/g) || []).length
  const hasMisidentification = misidentificationCount > 2
  const isProperlyClassified = exports > 0 && jsdoc > 0

  const clarity = loc === 0 ? 0 : clamp(Math.round(
    (hasBinomialName ? 20 : 0) +
    (hasCommonName ? 15 : 0) +
    (hasScientificName ? 15 : 0) +
    (isProperlyClassified ? 20 : 0) +
    (hasSynonyms ? 5 : 0) +
    (misidentificationCount <= 2 ? 15 : 0) +
    (!hasObsoleteName ? 10 : 0)
  ), 0, 100)

  return {
    clarity,
    hasBinomialName,
    hasCommonName,
    hasMisidentification,
    hasObsoleteName,
    hasScientificName,
    hasSynonyms,
    isProperlyClassified,
    misidentificationCount,
    synonymCount,
  }
}

/**
 * @example
 * const coll = measureCollection('export function a() { return 1 }')
 * // coll.completeness >= 0
 */
export function measureCollection(content: string): CollectionMeasure {
  const loc = countLines(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const returns = countReturnStatements(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const conditions = countConditions(content)
  const loops = countLoops(content)

  const hasRootSystem = imports > 0
  const hasStem = functions > 0 || classes > 0
  const hasLeaves = conditions > 0 || loops > 0
  const hasFlowers = exports > 0
  const hasFruit = returns > 0
  const hasSeeds = interfaces > 0 || countTypeAliases(content) > 0

  const missingParts: string[] = []
  if (!hasRootSystem) missingParts.push('root-system')
  if (!hasStem) missingParts.push('stem')
  if (!hasLeaves) missingParts.push('leaves')
  if (!hasFlowers) missingParts.push('flowers')
  if (!hasFruit) missingParts.push('fruit')
  if (!hasSeeds) missingParts.push('seeds')

  const hasAllParts = missingParts.length === 0

  const completeness = loc === 0 ? 0 : clamp(Math.round(
    (hasRootSystem ? 17 : 0) +
    (hasStem ? 17 : 0) +
    (hasLeaves ? 16 : 0) +
    (hasFlowers ? 17 : 0) +
    (hasFruit ? 17 : 0) +
    (hasSeeds ? 16 : 0)
  ), 0, 100)

  return {
    completeness,
    hasAllParts,
    hasFlowers,
    hasFruit,
    hasLeaves,
    hasRootSystem,
    hasSeeds,
    hasStem,
    missingParts,
  }
}

/**
 * @example
 * const label = measureLabel('/** docs *&#47; function f() {}')
 * // label.accuracy >= 0
 */
export function measureLabel(content: string): LabelMeasure {
  const loc = countLines(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const hasVersion = (content.match(/\bversion\b/gi) || []).length > 0
  const hasAuthor = (content.match(/\b@author\b/g) || []).length > 0 || (content.match(/\bauthor\b/gi) || []).length > 0
  const hasSince = (content.match(/\@since\b/g) || []).length > 0 || (content.match(/\bdate\b/gi) || []).length > 0
  const hasDescription = jsdoc > 0 || comments > 3
  const hasDetermination = (content.match(/\@purpose\b/gi) || []).length > 0 || jsdoc > 0

  const hasCollectorName = hasAuthor
  const hasCollectionDate = hasVersion || hasSince
  const hasLocation = countImports(content) > 0
  const hasHabitat = (content.match(/\busage\b/gi) || []).length > 0 || jsdoc > 1
  const hasFieldNotes = comments > 5
  const fieldNoteCount = Math.max(0, comments - 1)
  const isProperlyLabelled = hasCollectorName || hasDescription || jsdoc > 0

  const accuracy = loc === 0 ? 0 : clamp(Math.round(
    (hasCollectorName ? 15 : 0) +
    (hasCollectionDate ? 10 : 0) +
    (hasLocation ? 10 : 0) +
    (hasHabitat ? 15 : 0) +
    (hasDescription ? 15 : 0) +
    (hasDetermination ? 15 : 0) +
    (hasFieldNotes ? 10 : 0) +
    (isProperlyLabelled ? 10 : 0)
  ), 0, 100)

  return {
    accuracy,
    hasCollectionDate,
    hasCollectorName,
    hasDescription,
    hasDetermination,
    hasFieldNotes,
    hasHabitat,
    hasLocation,
    isProperlyLabelled,
    fieldNoteCount,
  }
}

/**
 * @example
 * const cat = measureCataloguing('import { x } from "./a"\nexport { y }')
 * // cat.quality >= 0
 */
export function measureCataloguing(content: string): CataloguingMeasure {
  const loc = countLines(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const interfaces = countInterfaces(content)
  const classes = countClasses(content)

  const hasAccessionNumber = (content.match(/\bid\b/g) || []).length > 0 || (content.match(/\buuid\b/gi) || []).length > 0 || exports > 0
  const hasBarcode = types > 0 || interfaces > 0
  const isProperlyFiled = exports > 0 && (classes > 0 || interfaces > 0 || countFunctions(content) > 0)
  const hasCrossReferences = imports > 0
  const hasIndexEntry = exports > 1
  const hasDigitalRecord = jsdoc > 0
  const crossReferenceCount = imports

  const quality = loc === 0 ? 0 : clamp(Math.round(
    (hasAccessionNumber ? 20 : 0) +
    (hasBarcode ? 15 : 0) +
    (isProperlyFiled ? 20 : 0) +
    (hasCrossReferences ? 15 : 0) +
    (hasIndexEntry ? 15 : 0) +
    (hasDigitalRecord ? 15 : 0)
  ), 0, 100)

  return {
    crossReferenceCount,
    hasAccessionNumber,
    hasBarcode,
    hasCrossReferences,
    hasDigitalRecord,
    hasIndexEntry,
    isProperlyFiled,
    quality,
  }
}

// ─── Classification ───────────────────────────────────────

/**
 * @example
 * classifySheetCondition(85, 80, 75) // 'type-specimen'
 */
export function classifySheetCondition(
  specimenQuality: number,
  preservationState: number,
  taxonomicClarity: number,
): HerbariumSheet['condition'] {
  const score = (specimenQuality + preservationState + taxonomicClarity) / 3
  if (score >= 70 && specimenQuality >= 65) return 'type-specimen'
  if (score >= 55 && preservationState >= 50) return 'pristine-sheet'
  if (score >= 40) return 'well-curated'
  if (score >= 25) return 'adequately-stored'
  if (score >= 12) return 'degrading-specimen'
  return 'uncatalogued-scrap'
}

/**
 * @example
 * classifyDrawerType(sheets) // 'climate-vault'
 */
export function classifyDrawerType(sheets: HerbariumSheet[]): CabinetDrawer['drawerType'] {
  if (sheets.length === 0) return 'compost-pile'
  const avgQuality = sheets.reduce((s, sh) => s + sh.specimenQuality, 0) / sheets.length
  const typeRatio = sheets.filter((sh) => sh.condition === 'type-specimen').length / sheets.length
  const scrapRatio = sheets.filter((sh) => sh.condition === 'uncatalogued-scrap').length / sheets.length

  if (avgQuality >= 65 && typeRatio >= 0.3) return 'climate-vault'
  if (avgQuality >= 50) return 'specimen-cabinet'
  if (avgQuality >= 35) return 'storage-drawer'
  if (scrapRatio >= 0.4) return 'compost-pile'
  if (avgQuality >= 15) return 'shoebox'
  return 'envelope'
}

/**
 * @example
 * classifyDrawerCondition(avgQuality, avgPres) // 'world-class-collection'
 */
export function classifyDrawerCondition(
  avgQuality: number,
  avgPres: number,
): CabinetDrawer['condition'] {
  const score = (avgQuality + avgPres) / 2
  if (score >= 75) return 'world-class-collection'
  if (score >= 60) return 'research-collection'
  if (score >= 45) return 'teaching-collection'
  if (score >= 30) return 'hobby-collection'
  if (score >= 15) return 'salvage-pile'
  return 'compost'
}

/**
 * @example
 * classifyBotanistGrade(85) // 'chief-botanist'
 */
export function classifyBotanistGrade(avgCuration: number): HerbariumPressStats['botanistGrade'] {
  if (avgCuration >= 80) return 'chief-botanist'
  if (avgCuration >= 65) return 'taxonomist'
  if (avgCuration >= 50) return 'botanist'
  if (avgCuration >= 35) return 'horticulturist'
  if (avgCuration >= 20) return 'gardener'
  return 'weed-puller'
}

// ─── Analyze functions ────────────────────────────────────

/**
 * @example
 * const sheet = analyzeHerbariumSheet(content, 'src/core.ts')
 * // sheet.specimenQuality >= 0
 */
export function analyzeHerbariumSheet(content: string, filePath: string): HerbariumSheet {
  const specimen = measureSpecimen(content)
  const preservation = measurePreservation(content)
  const taxonomy = measureTaxonomy(content)
  const collection = measureCollection(content)
  const label = measureLabel(content)
  const cataloguing = measureCataloguing(content)

  const specimenQuality = specimen.quality
  const preservationState = preservation.state
  const taxonomicClarity = taxonomy.clarity
  const collectionCompleteness = collection.completeness
  const labelAccuracy = label.accuracy
  const cataloguingQuality = cataloguing.quality

  const condition = classifySheetCondition(specimenQuality, preservationState, taxonomicClarity)

  const qualityScore = clamp(Math.round(
    (specimenQuality * 0.2) +
    (preservationState * 0.2) +
    (taxonomicClarity * 0.15) +
    (collectionCompleteness * 0.15) +
    (labelAccuracy * 0.15) +
    (cataloguingQuality * 0.15)
  ), 0, 100)

  return {
    cataloguing,
    cataloguingQuality,
    collection,
    collectionCompleteness,
    condition,
    file: filePath,
    label,
    labelAccuracy,
    preservation,
    preservationState,
    qualityScore,
    specimen,
    specimenQuality,
    taxonomicClarity,
    taxonomy,
  }
}

/**
 * @example
 * const drawer = analyzeCabinetDrawer(sheets, 'src')
 * // drawer.drawerType is defined
 */
export function analyzeCabinetDrawer(sheets: HerbariumSheet[], dirPath: string): CabinetDrawer {
  if (sheets.length === 0) {
    return {
      avgPreservation: 0,
      avgSpecimenQuality: 0,
      avgTaxonomicClarity: 0,
      completeSpecimenCount: 0,
      condition: 'compost',
      degradingCount: 0,
      directory: dirPath,
      drawerType: 'compost-pile',
      properlyLabelledCount: 0,
      sheets: [],
      typeSpecimenCount: 0,
    }
  }

  const avgSpecimenQuality = Math.round(sheets.reduce((s, sh) => s + sh.specimenQuality, 0) / sheets.length)
  const avgPreservation = Math.round(sheets.reduce((s, sh) => s + sh.preservationState, 0) / sheets.length)
  const avgTaxonomicClarity = Math.round(sheets.reduce((s, sh) => s + sh.taxonomicClarity, 0) / sheets.length)
  const typeSpecimenCount = sheets.filter((sh) => sh.condition === 'type-specimen').length
  const degradingCount = sheets.filter((sh) => sh.condition === 'degrading-specimen' || sh.condition === 'uncatalogued-scrap').length
  const properlyLabelledCount = sheets.filter((sh) => sh.label.isProperlyLabelled).length
  const completeSpecimenCount = sheets.filter((sh) => sh.collection.hasAllParts).length

  const drawerType = classifyDrawerType(sheets)
  const condition = classifyDrawerCondition(avgSpecimenQuality, avgPreservation)

  return {
    avgPreservation,
    avgSpecimenQuality,
    avgTaxonomicClarity,
    completeSpecimenCount,
    condition,
    degradingCount,
    directory: dirPath,
    drawerType,
    properlyLabelledCount,
    sheets,
    typeSpecimenCount,
  }
}

// ─── Recommendation generation ────────────────────────────

/**
 * @example
 * const recs = generateRecommendations(sheets, drawers, museum, stats)
 * // recs.length > 0
 */
export function generateRecommendations(
  sheets: HerbariumSheet[],
  _drawers: CabinetDrawer[],
  museum: HerbariumMuseum,
  stats: HerbariumPressStats,
): string[] {
  const recs: string[] = []

  if (museum.overallCuration < 35) {
    recs.push('Overall curation is critically low - add types, documentation, and error handling')
  }

  if (stats.uncataloguedScrapCount > 0) {
    recs.push(`${stats.uncataloguedScrapCount} file(s) are uncatalogued scraps - add structure and exports`)
  }

  if (stats.hasPestDamageCount > 3) {
    recs.push('Many files have pest damage (TODO/FIXME/deprecated) - resolve before they spread')
  }

  if (stats.hasMisidentificationCount > 0) {
    recs.push(`${stats.hasMisidentificationCount} file(s) have misidentification risks - reduce use of 'any' type`)
  }

  if (stats.degradingCount > stats.totalFiles * 0.3) {
    recs.push('Many specimens are degrading - invest in tests, types, and documentation')
  }

  if (museum.avgTaxonomicClarity < 40) {
    recs.push('Taxonomic clarity is low - improve naming conventions and add JSDoc documentation')
  }

  if (stats.hasAllPartsCount < stats.totalFiles * 0.2) {
    recs.push('Few files have complete collections - ensure all have imports, exports, functions, and types')
  }

  if (stats.isProperlyLabelledCount < stats.totalFiles * 0.3) {
    recs.push('Most files are poorly labelled - add JSDoc blocks with descriptions and author info')
  }

  if (recs.length === 0) {
    recs.push('Your herbarium is beautifully curated - excellent code classification and preservation')
  }

  return recs
}

// ─── Orchestrator ─────────────────────────────────────────

/**
 * @example
 * const result = buildHerbariumPressResult(files, contents, {})
 * // result.stats.totalFiles > 0
 */
export function buildHerbariumPressResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): HerbariumPressResult {
  const sheets: HerbariumSheet[] = files.map((file, i) =>
    analyzeHerbariumSheet(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, HerbariumSheet[]>()
  for (const sheet of sheets) {
    const dir = sheet.file.includes('/') ? sheet.file.substring(0, sheet.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(sheet)
    } else {
      dirMap.set(dir, [sheet])
    }
  }

  const drawers: CabinetDrawer[] = Array.from(dirMap.entries()).map(([dir, shs]) =>
    analyzeCabinetDrawer(shs, dir),
  )

  const avgSpecimenQuality = sheets.length === 0 ? 0 : Math.round(sheets.reduce((s, sh) => s + sh.specimenQuality, 0) / sheets.length)
  const avgPreservation = sheets.length === 0 ? 0 : Math.round(sheets.reduce((s, sh) => s + sh.preservationState, 0) / sheets.length)
  const avgTaxonomicClarity = sheets.length === 0 ? 0 : Math.round(sheets.reduce((s, sh) => s + sh.taxonomicClarity, 0) / sheets.length)
  const overallCuration = clamp(Math.round(
    (avgSpecimenQuality * 0.3) +
    (avgPreservation * 0.25) +
    (avgTaxonomicClarity * 0.2) +
    (sheets.length === 0 ? 0 : Math.round(sheets.reduce((s, sh) => s + sh.collectionCompleteness, 0) / sheets.length) * 0.15) +
    (sheets.length === 0 ? 0 : Math.round(sheets.reduce((s, sh) => s + sh.labelAccuracy, 0) / sheets.length) * 0.1)
  ), 0, 100)

  const museum: HerbariumMuseum = {
    avgPreservation,
    avgSpecimenQuality,
    avgTaxonomicClarity,
    isWellCurated: overallCuration >= 55,
    overallCuration,
  }

  const stats: HerbariumPressStats = {
    adequatelyStoredCount: sheets.filter((sh) => sh.condition === 'adequately-stored').length,
    avgCataloguingQuality: sheets.length === 0 ? 0 : Math.round(sheets.reduce((s, sh) => s + sh.cataloguingQuality, 0) / sheets.length),
    avgCollectionCompleteness: sheets.length === 0 ? 0 : Math.round(sheets.reduce((s, sh) => s + sh.collectionCompleteness, 0) / sheets.length),
    avgLabelAccuracy: sheets.length === 0 ? 0 : Math.round(sheets.reduce((s, sh) => s + sh.labelAccuracy, 0) / sheets.length),
    avgPreservationState: avgPreservation,
    avgSpecimenQuality,
    avgTaxonomicClarity,
    bestLabelled: findMax(sheets, (sh) => sh.labelAccuracy),
    bestPreserved: findMax(sheets, (sh) => sh.preservationState),
    bestSpecimen: findMax(sheets, (sh) => sh.specimenQuality),
    clearestTaxonomy: findMax(sheets, (sh) => sh.taxonomicClarity),
    decayingCount: sheets.filter((sh) => sh.preservation.method === 'decaying').length,
    degradingCount: sheets.filter((sh) => sh.condition === 'degrading-specimen' || sh.condition === 'uncatalogued-scrap').length,
    fossilCount: sheets.filter((sh) => sh.preservation.method === 'fossil').length,
    hasAccessionNumberCount: sheets.filter((sh) => sh.cataloguing.hasAccessionNumber).length,
    hasAllPartsCount: sheets.filter((sh) => sh.collection.hasAllParts).length,
    hasBinomialNameCount: sheets.filter((sh) => sh.taxonomy.hasBinomialName).length,
    hasDigitalRecordCount: sheets.filter((sh) => sh.cataloguing.hasDigitalRecord).length,
    hasFieldNotesCount: sheets.filter((sh) => sh.label.hasFieldNotes).length,
    hasMisidentificationCount: sheets.filter((sh) => sh.taxonomy.hasMisidentification).length,
    hasPestDamageCount: sheets.filter((sh) => sh.preservation.hasPestDamage).length,
    isProperlyLabelledCount: sheets.filter((sh) => sh.label.isProperlyLabelled).length,
    isProperlyMountedCount: sheets.filter((sh) => sh.preservation.isProperlyMounted).length,
    mostComplete: findMax(sheets, (sh) => sh.collectionCompleteness),
    overallCuration,
    botanistGrade: classifyBotanistGrade(overallCuration),
    pressedCount: sheets.filter((sh) => sh.preservation.method === 'pressed').length,
    pristineSheetCount: sheets.filter((sh) => sh.condition === 'pristine-sheet').length,
    totalDrawers: drawers.length,
    totalFiles: files.length,
    typeSpecimenCount: sheets.filter((sh) => sh.condition === 'type-specimen').length,
    uncataloguedScrapCount: sheets.filter((sh) => sh.condition === 'uncatalogued-scrap').length,
    wellCuratedCount: sheets.filter((sh) => sh.condition === 'well-curated').length,
  }

  const recommendations = generateRecommendations(sheets, drawers, museum, stats)

  return {
    drawers,
    museum,
    recommendations,
    sheets,
    stats,
  }
}

function findMax(sheets: HerbariumSheet[], getter: (sh: HerbariumSheet) => number): string {
  if (sheets.length === 0) return 'none'
  let best = sheets[0]
  let bestVal = getter(sheets[0])
  for (let i = 1; i < sheets.length; i++) {
    const val = getter(sheets[i])
    if (val > bestVal) {
      best = sheets[i]
      bestVal = val
    }
  }
  return best.file
}
