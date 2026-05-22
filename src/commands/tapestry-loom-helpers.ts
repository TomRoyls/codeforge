// ─── Interfaces ────────────────────────────────────────────────────────────

export interface ThreadMeasure {
  quality: number
  material: 'silk' | 'wool' | 'cotton' | 'linen' | 'gold' | 'straw'
  isStrong: boolean
  isConsistent: boolean
  hasNoKnots: boolean
  hasNoFraying: boolean
  hasProperTwist: boolean
  hasSmoothTexture: boolean
  hasNoSnags: boolean
  hasProperTension: boolean
  hasEvenDye: boolean
  hasColorfast: boolean
  knotCount: number
  snagCount: number
}

export interface WeaveMeasure {
  density: number
  technique: 'plain' | 'twill' | 'satin' | 'jacquard' | 'tapestry' | 'rag'
  isTightWeave: boolean
  hasProperTension: boolean
  hasNoGaps: boolean
  hasNoLooseEnds: boolean
  hasEvenBeat: boolean
  hasSelvedge: boolean
  hasProperShed: boolean
  hasHeddleControl: boolean
  hasPickCount: boolean
  gapCount: number
  looseEndCount: number
}

export interface PatternMeasure {
  richness: number
  type: 'geometric' | 'floral' | 'figurative' | 'abstract' | 'narrative' | 'random'
  hasRepeatingMotifs: boolean
  hasComplexDesigns: boolean
  hasBorderPatterns: boolean
  hasCentralMedallion: boolean
  hasCornerDesigns: boolean
  hasFillPatterns: boolean
  hasConnectingThreads: boolean
  hasMirrorImage: boolean
  hasHierarchy: boolean
  hasGoldenRatio: boolean
  motifCount: number
  designCount: number
}

export interface ColorMeasure {
  palette: number
  richness: 'kaleidoscope' | 'rich' | 'varied' | 'limited' | 'monochrome' | 'bleached'
  hasVibrantColors: boolean
  hasSubtleShading: boolean
  hasContrast: boolean
  hasGradient: boolean
  hasPrimaryColors: boolean
  hasAccentColors: boolean
  hasWarmTones: boolean
  hasCoolTones: boolean
  hasMetallic: boolean
  hasNoColorBleeding: boolean
  colorBleedCount: number
}

export interface NarrativeMeasure {
  coherence: number
  structure: 'linear' | 'circular' | 'branching' | 'episodic' | 'stream-of-consciousness' | 'incoherent'
  hasClearBeginning: boolean
  hasMiddle: boolean
  hasSatisfyingEnd: boolean
  hasRisingAction: boolean
  hasClimax: boolean
  hasFallingAction: boolean
  hasForeshadowing: boolean
  hasFlashback: boolean
  hasNarrativeArc: boolean
  hasNoPlotHoles: boolean
  hasDeusExMachina: boolean
  plotHoleCount: number
}

export interface ArtistryMeasure {
  value: number
  style: 'renaissance' | 'medieval' | 'art-deco' | 'minimalist' | 'baroque' | 'naive'
  isMasterwork: boolean
  hasAestheticValue: boolean
  hasTechnicalPrecision: boolean
  hasCreativeExpression: boolean
  hasHistoricalSignificance: boolean
  hasCulturalContext: boolean
  hasProvenance: boolean
  hasSignature: boolean
  hasRestoration: boolean
  hasConservation: boolean
  restorationCount: number
}

export interface TapestryThread {
  file: string
  threadQuality: number
  weaveDensity: number
  patternRichness: number
  colorPalette: number
  narrativeCoherence: number
  artisticValue: number
  thread: ThreadMeasure
  weave: WeaveMeasure
  pattern: PatternMeasure
  color: ColorMeasure
  narrative: NarrativeMeasure
  artistry: ArtistryMeasure
  condition: 'gobelins-masterpiece' | 'fine-tapestry' | 'quality-weave' | 'standard-cloth' | 'rag-rug' | 'tangled-yarn'
  qualityScore: number
}

export interface TapestryPanel {
  directory: string
  threads: TapestryThread[]
  avgQuality: number
  avgDensity: number
  avgNarrative: number
  masterpieceCount: number
  tangledCount: number
  coherentCount: number
  tightWeaveCount: number
  panelType: 'historical-narrative' | 'portrait-panel' | 'decorative-hanging' | 'wall-covering' | 'table-runner' | 'floor-rag'
  condition: 'museum-exhibit' | 'gallery-piece' | 'home-decor' | 'craft-fair' | 'thrift-store' | 'rag-bag'
}

export interface TapestryGallery {
  avgQuality: number
  avgDensity: number
  avgNarrative: number
  isMasterwork: boolean
  overallCraftsmanship: number
}

export interface TapestryStats {
  totalFiles: number
  totalPanels: number
  avgThreadQuality: number
  avgWeaveDensity: number
  avgPatternRichness: number
  avgColorPalette: number
  avgNarrativeCoherence: number
  avgArtisticValue: number
  gobelinsMasterpieceCount: number
  fineTapestryCount: number
  qualityWeaveCount: number
  standardClothCount: number
  ragRugCount: number
  tangledYarnCount: number
  isStrongCount: number
  hasNoKnotsCount: number
  isTightWeaveCount: number
  hasNoGapsCount: number
  hasRepeatingMotifsCount: number
  hasVibrantColorsCount: number
  hasNoColorBleedingCount: number
  hasNarrativeArcCount: number
  hasNoPlotHolesCount: number
  isMasterworkCount: number
  overallCraftsmanship: number
  weaverGrade: 'master-weaver' | 'journeyman-weaver' | 'apprentice' | 'novice' | 'hobbyist' | 'cat'
  bestThread: string
  finestWeave: string
  richestPattern: string
  bestNarrative: string
  mostArtistic: string
}

export interface TapestryLoomResult {
  threads: TapestryThread[]
  panels: TapestryPanel[]
  gallery: TapestryGallery
  stats: TapestryStats
  recommendations: string[]
}

// ─── Regex Constants ───────────────────────────────────────────────────────

const IMPORT_REGEX = /import\s/g
const EXPORT_REGEX = /export\s/g
const FROM_REGEX = /from\s+['"]/g
const REQUIRE_REGEX = /require\s*\(/g
const CLASS_REGEX = /\bclass\s+\w+/g
const INTERFACE_REGEX = /\binterface\s+\w+/g
const TYPE_REGEX = /\btype\s+\w+/g
const FUNCTION_REGEX = /\b(function|const\s+\w+\s*=\s*(\(|[^=]=>))\b/g
const ASYNC_REGEX = /\basync\b/g
const AWAIT_REGEX = /\bawait\b/g
const RETURN_REGEX = /\breturn\b/g
const THROW_REGEX = /\bthrow\b/g
const TRY_CATCH_REGEX = /\btry\s*\{/g
const IF_REGEX = /\bif\s*\(/g
const FOR_REGEX = /\bfor\s*\(/g
const WHILE_REGEX = /\bwhile\s*\(/g
const NEW_REGEX = /\bnew\s+\w+/g
const EXTENDS_REGEX = /\bextends\s+/g
const IMPLEMENTS_REGEX = /\bimplements\s+/g
const CONSOLE_REGEX = /\bconsole\./g
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi
const DEPRECATED_REGEX = /@deprecated/g
const ANY_REGEX = /:\s*any\b/g
const TS_IGNORE_REGEX = /@ts-ignore/g
const TYPE_ANNOTATION_REGEX = /:\s*(string|number|boolean|void|never|unknown|any|null|undefined|object)/g
const GENERIC_REGEX = /<\w+/g
const ARROW_REGEX = /=>/g
const SPREAD_REGEX = /\.\.\./g
const OPTIONAL_CHAIN_REGEX = /\?\.\w/g
const NULLISH_REGEX = /\?\?/g
const PRIVATE_REGEX = /\bprivate\s/g
const PROTECTED_REGEX = /\bprotected\s/g
const STATIC_REGEX = /\bstatic\s/g
const READONLY_REGEX = /\breadonly\s/g
const ABSTRACT_REGEX = /\babstract\s/g
const EMIT_REGEX = /\.emit\s*\(/g
const DEFAULT_EXPORT_REGEX = /export\s+default/g
const RE_EXPORT_REGEX = /export\s+\*\s+from/g
const DYNAMIC_IMPORT_REGEX = /import\s*\(/g

// ─── Helper Counting Functions ─────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function countNonEmptyLines(content: string): number {
  let count = 0
  for (const line of content.split('\n')) {
    if (line.trim().length > 0) count++
  }
  return count
}

function countImports(content: string): number {
  return countMatches(content, IMPORT_REGEX) + countMatches(content, REQUIRE_REGEX)
}

function countExports(content: string): number {
  return countMatches(content, EXPORT_REGEX)
}

function countFunctions(content: string): number {
  return countMatches(content, FUNCTION_REGEX) + countMatches(content, ARROW_REGEX)
}

function countClasses(content: string): number {
  return countMatches(content, CLASS_REGEX)
}

function countInterfaces(content: string): number {
  return countMatches(content, INTERFACE_REGEX)
}

function countTypeAnnotations(content: string): number {
  return countMatches(content, TYPE_ANNOTATION_REGEX)
}

function countConditionals(content: string): number {
  return countMatches(content, IF_REGEX)
}

function countLoops(content: string): number {
  return countMatches(content, FOR_REGEX) + countMatches(content, WHILE_REGEX)
}

function countErrorHandling(content: string): number {
  return countMatches(content, TRY_CATCH_REGEX)
}

function countSmells(content: string): number {
  return countMatches(content, CONSOLE_REGEX) + countMatches(content, TODO_REGEX) + countMatches(content, DEPRECATED_REGEX) + countMatches(content, ANY_REGEX) + countMatches(content, TS_IGNORE_REGEX)
}

function countTodos(content: string): number {
  return countMatches(content, TODO_REGEX)
}

// ─── measureThread ─────────────────────────────────────────────────────────

/** @example measureThread('export function add(a: number, b: number): number { return a + b; }') returns ThreadMeasure */
export function measureThread(content: string): ThreadMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAnnotations = countTypeAnnotations(content)
  const errorHandling = countErrorHandling(content)
  const returns = countMatches(content, RETURN_REGEX)
  const conditionals = countConditionals(content)
  const smells = countSmells(content)
  const imports = countImports(content)
  const exports = countExports(content)

  const hasCode = lines > 0
  const baseQuality = lines === 0 ? 5 : Math.min(40, typeAnnotations * 3 + errorHandling * 6 + classes * 3)
  const structureBonus = Math.min(25, funcs * 3 + interfaces * 5)
  const flowBonus = Math.min(20, returns * 2 + conditionals * 2)
  const smellPenalty = Math.min(30, smells * 5)
  const quality = Math.max(0, Math.min(100, baseQuality + structureBonus + flowBonus - smellPenalty))

  const isStrong = quality >= 60
  const isConsistent = hasCode && (funcs > 0 || classes > 0) && exports > 0
  const hasNoKnots = smells === 0
  const hasNoFraying = hasCode && imports <= 10
  const hasProperTwist = hasCode && conditionals > 0 && errorHandling > 0
  const hasSmoothTexture = hasCode && returns > 0 && (funcs > 0 || classes > 0)
  const hasNoSnags = imports < 5
  const hasProperTension = hasCode && quality >= 30 && quality <= 80
  const hasEvenDye = hasCode && (typeAnnotations > 0 || interfaces > 0)
  const hasColorfast = hasCode && smells === 0 && errorHandling > 0

  const knotCount = smells
  const snagCount = Math.max(0, imports - 5)

  let material: ThreadMeasure['material']
  if (quality >= 90) material = 'gold'
  else if (quality >= 70) material = 'silk'
  else if (quality >= 50) material = 'wool'
  else if (quality >= 30) material = 'cotton'
  else if (quality >= 15) material = 'linen'
  else material = 'straw'

  return {
    quality,
    material,
    isStrong,
    isConsistent,
    hasNoKnots,
    hasNoFraying,
    hasProperTwist,
    hasSmoothTexture,
    hasNoSnags,
    hasProperTension,
    hasEvenDye,
    hasColorfast,
    knotCount,
    snagCount,
  }
}

// ─── measureWeave ──────────────────────────────────────────────────────────

/** @example measureWeave('export class Foo { method() { return this.bar(); } }') returns WeaveMeasure */
export function measureWeave(content: string): WeaveMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const returns = countMatches(content, RETURN_REGEX)
  const errorHandling = countErrorHandling(content)
  const typeAnnotations = countTypeAnnotations(content)

  const hasCode = lines > 0
  const baseDensity = lines === 0 ? 5 : Math.min(35, lines)
  const structureBonus = Math.min(25, funcs * 3 + classes * 5)
  const connectionBonus = Math.min(20, imports * 2 + exports * 3)
  const flowBonus = Math.min(15, conditionals * 2 + loops * 3)
  const typingBonus = Math.min(10, typeAnnotations * 2)
  const density = Math.min(100, baseDensity + structureBonus + connectionBonus + flowBonus + typingBonus)

  const isTightWeave = density >= 60
  const hasProperTension = hasCode && density >= 30 && density <= 80
  const hasNoGaps = hasCode && (funcs > 0 || classes > 0) && returns > 0
  const hasNoLooseEnds = hasCode && exports > 0
  const hasEvenBeat = hasCode && funcs > 0 && conditionals > 0
  const hasSelvedge = imports > 0 && exports > 0
  const hasProperShed = hasCode && (classes > 0 || funcs > 1)
  const hasHeddleControl = hasCode && errorHandling > 0
  const hasPickCount = hasCode && (conditionals > 0 || loops > 0)

  const gapCount = hasNoGaps ? 0 : 1
  const looseEndCount = hasNoLooseEnds ? 0 : 1

  let technique: WeaveMeasure['technique']
  if (density >= 80) technique = 'jacquard'
  else if (density >= 60) technique = 'tapestry'
  else if (density >= 40) technique = 'satin'
  else if (density >= 25) technique = 'twill'
  else if (density >= 10) technique = 'plain'
  else technique = 'rag'

  return {
    density,
    technique,
    isTightWeave,
    hasProperTension,
    hasNoGaps,
    hasNoLooseEnds,
    hasEvenBeat,
    hasSelvedge,
    hasProperShed,
    hasHeddleControl,
    hasPickCount,
    gapCount,
    looseEndCount,
  }
}

// ─── measurePattern ────────────────────────────────────────────────────────

/** @example measurePattern('interface A {}; interface B {}; class C implements A, B {}') returns PatternMeasure */
export function measurePattern(content: string): PatternMeasure {
  const lines = countNonEmptyLines(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countMatches(content, TYPE_REGEX)
  const funcs = countFunctions(content)
  const exports = countExports(content)
  const extends_ = countMatches(content, EXTENDS_REGEX)
  const implements_ = countMatches(content, IMPLEMENTS_REGEX)
  const abstracts = countMatches(content, ABSTRACT_REGEX)
  const generics = countMatches(content, GENERIC_REGEX)
  const statics = countMatches(content, STATIC_REGEX)

  const hasCode = lines > 0
  const designSignals = classes + interfaces + types + extends_ + implements_ + abstracts
  const baseRichness = lines === 0 ? 5 : Math.min(30, designSignals * 5)
  const patternBonus = Math.min(25, (extends_ + implements_) * 8 + abstracts * 10)
  const featureBonus = Math.min(20, generics * 4 + statics * 3)
  const exportBonus = Math.min(15, exports * 2)
  const functionBonus = Math.min(15, funcs * 2)
  const richness = Math.min(100, baseRichness + patternBonus + featureBonus + exportBonus + functionBonus)

  const hasRepeatingMotifs = funcs > 2 || classes > 1
  const hasComplexDesigns = (extends_ + implements_) > 0 && generics > 0
  const hasBorderPatterns = interfaces > 0
  const hasCentralMedallion = classes > 0 && extends_ > 0
  const hasCornerDesigns = funcs > 0 && types > 0
  const hasFillPatterns = funcs > 3
  const hasConnectingThreads = imports_count(content) > 0 && exports > 0
  const hasMirrorImage = implements_ > 0 && interfaces > 0
  const hasHierarchy = classes > 0 && extends_ > 0 && interfaces > 0
  const hasGoldenRatio = richness >= 60 && (extends_ + implements_) > 0

  const motifCount = funcs + classes
  const designCount = classes + interfaces + types

  let type: PatternMeasure['type']
  if (richness >= 80) type = 'narrative'
  else if (richness >= 60) type = 'figurative'
  else if (richness >= 40) type = 'floral'
  else if (richness >= 25) type = 'geometric'
  else if (richness >= 10) type = 'abstract'
  else type = 'random'

  return {
    richness,
    type,
    hasRepeatingMotifs,
    hasComplexDesigns,
    hasBorderPatterns,
    hasCentralMedallion,
    hasCornerDesigns,
    hasFillPatterns,
    hasConnectingThreads,
    hasMirrorImage,
    hasHierarchy,
    hasGoldenRatio,
    motifCount,
    designCount,
  }
}

function imports_count(content: string): number {
  return countImports(content)
}

// ─── measureColor ──────────────────────────────────────────────────────────

/** @example measureColor('export function foo(): string { return "bar"; }') returns ColorMeasure */
export function measureColor(content: string): ColorMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countMatches(content, TYPE_REGEX)
  const asyncs = countMatches(content, ASYNC_REGEX)
  const errorHandling = countErrorHandling(content)
  const exports = countExports(content)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const spreads = countMatches(content, SPREAD_REGEX)
  const optionalChains = countMatches(content, OPTIONAL_CHAIN_REGEX)
  const privateMembers = countMatches(content, PRIVATE_REGEX) + countMatches(content, PROTECTED_REGEX)
  const emits = countMatches(content, EMIT_REGEX)
  const generics = countMatches(content, GENERIC_REGEX)
  const smells = countSmells(content)

  const hasCode = lines > 0
  const featureSignals = funcs + classes + interfaces + types + asyncs + errorHandling
  const basePalette = lines === 0 ? 5 : Math.min(30, featureSignals * 3)
  const varietyBonus = Math.min(20, (asyncs + errorHandling + emits) * 4)
  const controlBonus = Math.min(15, conditionals * 2 + loops * 3)
  const eleganceBonus = Math.min(15, optionalChains * 3 + generics * 3 + spreads * 2)
  const smellPenalty = Math.min(15, smells * 3)
  const palette = Math.max(0, Math.min(100, basePalette + varietyBonus + controlBonus + eleganceBonus - smellPenalty))

  const hasVibrantColors = featureSignals >= 5
  const hasSubtleShading = optionalChains > 0 || generics > 0
  const hasContrast = errorHandling > 0
  const hasGradient = asyncs > 0 && errorHandling > 0
  const hasPrimaryColors = exports > 0
  const hasAccentColors = privateMembers > 0
  const hasWarmTones = asyncs > 0 || emits > 0
  const hasCoolTones = interfaces > 0 || types > 0
  const hasMetallic = generics > 0 && classes > 0
  const hasNoColorBleeding = smells === 0

  let richness: ColorMeasure['richness']
  if (palette >= 80) richness = 'kaleidoscope'
  else if (palette >= 65) richness = 'rich'
  else if (palette >= 45) richness = 'varied'
  else if (palette >= 25) richness = 'limited'
  else if (palette >= 10) richness = 'monochrome'
  else richness = 'bleached'

  const colorBleedCount = smells

  return {
    palette,
    richness,
    hasVibrantColors,
    hasSubtleShading,
    hasContrast,
    hasGradient,
    hasPrimaryColors,
    hasAccentColors,
    hasWarmTones,
    hasCoolTones,
    hasMetallic,
    hasNoColorBleeding,
    colorBleedCount,
  }
}

// ─── measureNarrative ──────────────────────────────────────────────────────

/** @example measureNarrative('export function run(): void { if (true) { return; } }') returns NarrativeMeasure */
export function measureNarrative(content: string): NarrativeMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const errorHandling = countErrorHandling(content)
  const returns = countMatches(content, RETURN_REGEX)
  const throws = countMatches(content, THROW_REGEX)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const asyncs = countMatches(content, ASYNC_REGEX)
  const imports = countImports(content)
  const exports = countExports(content)
  const typeAnnotations = countTypeAnnotations(content)
  const smells = countSmells(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)

  const hasCode = lines > 0
  const baseCoherence = lines === 0 ? 5 : Math.min(30, funcs * 3 + errorHandling * 5 + returns * 2)
  const flowBonus = Math.min(20, conditionals * 2 + loops * 3)
  const asyncBonus = Math.min(15, (asyncs + countMatches(content, AWAIT_REGEX)) * 4)
  const structureBonus = Math.min(15, classes * 3 + interfaces * 4 + typeAnnotations * 2)
  const exportBonus = Math.min(10, exports * 2)
  const smellPenalty = Math.min(20, smells * 4)
  const coherence = Math.max(0, Math.min(100, baseCoherence + flowBonus + asyncBonus + structureBonus + exportBonus - smellPenalty))

  const hasClearBeginning = hasCode && (imports > 0 || classes > 0 || funcs > 0)
  const hasMiddle = hasCode && conditionals > 0
  const hasSatisfyingEnd = hasCode && (returns > 0 || throws > 0)
  const hasRisingAction = hasCode && conditionals > 1
  const hasClimax = hasCode && (loops > 0 || asyncs > 0)
  const hasFallingAction = hasCode && errorHandling > 0
  const hasForeshadowing = hasCode && (interfaces > 0 || typeAnnotations > 0)
  const hasFlashback = hasCode && imports > 3
  const hasNarrativeArc = hasClearBeginning && hasMiddle && hasSatisfyingEnd
  const hasNoPlotHoles = hasCode && funcs > 0 && returns > 0
  const hasDeusExMachina = countMatches(content, ANY_REGEX) > 0 || countMatches(content, TS_IGNORE_REGEX) > 0

  const plotHoleCount = hasNoPlotHoles ? 0 : (hasCode ? 1 : 0)

  let structure: NarrativeMeasure['structure']
  if (coherence >= 80) structure = 'linear'
  else if (coherence >= 65) structure = 'branching'
  else if (coherence >= 50) structure = 'circular'
  else if (coherence >= 35) structure = 'episodic'
  else if (coherence >= 20) structure = 'stream-of-consciousness'
  else structure = 'incoherent'

  return {
    coherence,
    structure,
    hasClearBeginning,
    hasMiddle,
    hasSatisfyingEnd,
    hasRisingAction,
    hasClimax,
    hasFallingAction,
    hasForeshadowing,
    hasFlashback,
    hasNarrativeArc,
    hasNoPlotHoles,
    hasDeusExMachina,
    plotHoleCount,
  }
}

// ─── measureArtistry ───────────────────────────────────────────────────────

/** @example measureArtistry('// @deprecated\nconsole.log("debug")') returns ArtistryMeasure */
export function measureArtistry(content: string): ArtistryMeasure {
  const lines = countNonEmptyLines(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countMatches(content, TYPE_REGEX)
  const funcs = countFunctions(content)
  const asyncs = countMatches(content, ASYNC_REGEX)
  const errorHandling = countErrorHandling(content)
  const typeAnnotations = countTypeAnnotations(content)
  const generics = countMatches(content, GENERIC_REGEX)
  const optionalChains = countMatches(content, OPTIONAL_CHAIN_REGEX)
  const nullish = countMatches(content, NULLISH_REGEX)
  const readonlys = countMatches(content, READONLY_REGEX)
  const abstracts = countMatches(content, ABSTRACT_REGEX)
  const smells = countSmells(content)
  const todos = countTodos(content)
  const deprecated = countMatches(content, DEPRECATED_REGEX)
  const reExports = countMatches(content, RE_EXPORT_REGEX)
  const defaultExports = countMatches(content, DEFAULT_EXPORT_REGEX)

  const hasCode = lines > 0
  const elegance = optionalChains + nullish + generics + readonlys + abstracts
  const baseValue = lines === 0 ? 5 : Math.min(30, errorHandling * 4 + typeAnnotations * 2 + classes * 3)
  const modernBonus = Math.min(20, (optionalChains + nullish + asyncs) * 3)
  const patternBonus = Math.min(15, (abstracts + readonlys + generics) * 3)
  const structureBonus = Math.min(15, interfaces * 4 + types * 2)
  const smellPenalty = Math.min(25, smells * 5)
  const value = Math.max(0, Math.min(100, baseValue + modernBonus + patternBonus + structureBonus - smellPenalty))

  const isMasterwork = value >= 80
  const hasAestheticValue = hasCode && elegance > 0
  const hasTechnicalPrecision = hasCode && typeAnnotations > 0 && errorHandling > 0
  const hasCreativeExpression = hasCode && (generics > 0 || abstracts > 0)
  const hasHistoricalSignificance = hasCode && (classes > 0 && errorHandling > 0)
  const hasCulturalContext = hasCode && (interfaces > 0 || types > 0)
  const hasProvenance = defaultExports > 0 || reExports > 0
  const exportCount = countExports(content)
  const hasSignature = hasCode && exportCount > 0
  const hasRestoration = deprecated > 0
  const hasConservation = hasCode && smells === 0

  let style: ArtistryMeasure['style']
  if (value >= 80) style = 'renaissance'
  else if (value >= 65) style = 'art-deco'
  else if (value >= 50) style = 'medieval'
  else if (value >= 35) style = 'minimalist'
  else if (value >= 20) style = 'baroque'
  else style = 'naive'

  const restorationCount = deprecated + todos

  return {
    value,
    style,
    isMasterwork,
    hasAestheticValue,
    hasTechnicalPrecision,
    hasCreativeExpression,
    hasHistoricalSignificance,
    hasCulturalContext,
    hasProvenance,
    hasSignature,
    hasRestoration,
    hasConservation,
    restorationCount,
  }
}

// ─── classifyCondition ─────────────────────────────────────────────────────

/** @example classifyCondition(90) returns 'gobelins-masterpiece' */
export function classifyCondition(score: number): TapestryThread['condition'] {
  if (score >= 80) return 'gobelins-masterpiece'
  if (score >= 65) return 'fine-tapestry'
  if (score >= 50) return 'quality-weave'
  if (score >= 35) return 'standard-cloth'
  if (score >= 20) return 'rag-rug'
  return 'tangled-yarn'
}

// ─── classifyPanelType ─────────────────────────────────────────────────────

/** @example classifyPanelType([thread1, thread2]) returns 'portrait-panel' */
export function classifyPanelType(threads: TapestryThread[]): TapestryPanel['panelType'] {
  if (threads.length === 0) return 'floor-rag'
  const avgQuality = Math.round(threads.reduce((s, t) => s + t.qualityScore, 0) / threads.length)
  if (avgQuality >= 70) return 'historical-narrative'
  if (avgQuality >= 50) return 'portrait-panel'
  if (threads.length >= 3) return 'decorative-hanging'
  if (threads.length === 2) return 'wall-covering'
  if (threads.length === 1 && avgQuality >= 20) return 'table-runner'
  return 'floor-rag'
}

// ─── classifyPanelCondition ────────────────────────────────────────────────

/** @example classifyPanelCondition(70) returns 'gallery-piece' */
export function classifyPanelCondition(avgQuality: number): TapestryPanel['condition'] {
  if (avgQuality >= 80) return 'museum-exhibit'
  if (avgQuality >= 65) return 'gallery-piece'
  if (avgQuality >= 50) return 'home-decor'
  if (avgQuality >= 35) return 'craft-fair'
  if (avgQuality >= 20) return 'thrift-store'
  return 'rag-bag'
}

// ─── classifyWeaverGrade ───────────────────────────────────────────────────

/** @example classifyWeaverGrade(85) returns 'master-weaver' */
export function classifyWeaverGrade(avgCraft: number): TapestryStats['weaverGrade'] {
  if (avgCraft >= 80) return 'master-weaver'
  if (avgCraft >= 65) return 'journeyman-weaver'
  if (avgCraft >= 50) return 'apprentice'
  if (avgCraft >= 35) return 'novice'
  if (avgCraft >= 20) return 'hobbyist'
  return 'cat'
}

// ─── analyzeTapestryThread ─────────────────────────────────────────────────

/** @example analyzeTapestryThread('export function foo(): void {}', 'test.ts') returns TapestryThread */
export function analyzeTapestryThread(content: string, filePath: string): TapestryThread {
  const thread = measureThread(content)
  const weave = measureWeave(content)
  const pattern = measurePattern(content)
  const color = measureColor(content)
  const narrative = measureNarrative(content)
  const artistry = measureArtistry(content)

  const threadQuality = thread.quality
  const weaveDensity = weave.density
  const patternRichness = pattern.richness
  const colorPalette = color.palette
  const narrativeCoherence = narrative.coherence
  const artisticValue = artistry.value

  const qualityScore = Math.round((threadQuality + weaveDensity + patternRichness + colorPalette + narrativeCoherence + artisticValue) / 6)
  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    threadQuality,
    weaveDensity,
    patternRichness,
    colorPalette,
    narrativeCoherence,
    artisticValue,
    thread,
    weave,
    pattern,
    color,
    narrative,
    artistry,
    condition,
    qualityScore,
  }
}

// ─── analyzeTapestryPanel ──────────────────────────────────────────────────

/** @example analyzeTapestryPanel([thread1], 'src') returns TapestryPanel */
export function analyzeTapestryPanel(threads: TapestryThread[], dirPath: string): TapestryPanel {
  const count = threads.length
  const avgQuality = count > 0 ? Math.round(threads.reduce((s, t) => s + t.threadQuality, 0) / count) : 0
  const avgDensity = count > 0 ? Math.round(threads.reduce((s, t) => s + t.weaveDensity, 0) / count) : 0
  const avgNarrative = count > 0 ? Math.round(threads.reduce((s, t) => s + t.narrativeCoherence, 0) / count) : 0

  const masterpieceCount = threads.filter((t) => t.condition === 'gobelins-masterpiece').length
  const tangledCount = threads.filter((t) => t.condition === 'tangled-yarn').length
  const coherentCount = threads.filter((t) => t.narrative.hasNarrativeArc).length
  const tightWeaveCount = threads.filter((t) => t.weave.isTightWeave).length

  const panelType = classifyPanelType(threads)
  const avgScore = count > 0 ? Math.round(threads.reduce((s, t) => s + t.qualityScore, 0) / count) : 0
  const condition = classifyPanelCondition(avgScore)

  return {
    directory: dirPath,
    threads,
    avgQuality,
    avgDensity,
    avgNarrative,
    masterpieceCount,
    tangledCount,
    coherentCount,
    tightWeaveCount,
    panelType,
    condition,
  }
}

// ─── generateRecommendations ───────────────────────────────────────────────

/** @example generateRecommendations(threads, panels, gallery, stats) returns string[] */
export function generateRecommendations(
  threads: TapestryThread[],
  _panels: TapestryPanel[],
  _gallery: TapestryGallery,
  _stats: TapestryStats,
): string[] {
  const recommendations: string[] = []

  const hasTangledYarn = threads.some((t) => t.condition === 'tangled-yarn')
  if (hasTangledYarn) {
    recommendations.push('Untangle the yarn — add structure, exports, and type annotations to empty files')
  }

  const hasKnots = threads.some((t) => t.thread.knotCount > 0)
  if (hasKnots) {
    recommendations.push('Remove knots — clean up console calls, TODOs, and deprecated markers')
  }

  const hasGaps = threads.some((t) => t.weave.gapCount > 0)
  if (hasGaps) {
    recommendations.push('Fill gaps — add return statements and proper function completion')
  }

  const hasLooseEnds = threads.some((t) => t.weave.looseEndCount > 0)
  if (hasLooseEnds) {
    recommendations.push('Tie off loose ends — add exports to connect your code')
  }

  const hasPlotHoles = threads.some((t) => !t.narrative.hasNoPlotHoles)
  if (hasPlotHoles) {
    recommendations.push('Fix plot holes — ensure functions have proper return paths')
  }

  const hasColorBleeding = threads.some((t) => !t.color.hasNoColorBleeding)
  if (hasColorBleeding) {
    recommendations.push('Stop color bleeding — separate concerns and remove code smells')
  }

  const hasDeusExMachina = threads.some((t) => t.narrative.hasDeusExMachina)
  if (hasDeusExMachina) {
    recommendations.push('Remove deus ex machina — replace any types and ts-ignore with proper types')
  }

  const hasRagRug = threads.some((t) => t.condition === 'rag-rug')
  if (hasRagRug) {
    recommendations.push('Upgrade from rag rug — add error handling, types, and classes')
  }

  if (recommendations.length === 0) {
    recommendations.push('The tapestry is a Gobelins masterpiece — exquisite craftsmanship achieved')
  }

  return recommendations
}

// ─── Build Result ──────────────────────────────────────────────────────────

/** @example buildTapestryLoomResult(['a.ts'], ['export function foo(): void {}']) returns TapestryLoomResult */
export function buildTapestryLoomResult(
  files: string[],
  contents: string[],
  options?: { ignore?: string[]; ext?: string[] },
): TapestryLoomResult {
  const _opts = options ?? {}

  const threads: TapestryThread[] = files.map((file, i) =>
    analyzeTapestryThread(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, TapestryThread[]>()
  for (const thread of threads) {
    const dir = thread.file.includes('/') ? thread.file.substring(0, thread.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(thread)
    } else {
      dirMap.set(dir, [thread])
    }
  }

  const panels: TapestryPanel[] = Array.from(dirMap.entries()).map(
    ([dir, dirThreads]) => analyzeTapestryPanel(dirThreads, dir),
  )

  const count = threads.length
  const avgThreadQuality = count > 0 ? Math.round(threads.reduce((s, t) => s + t.threadQuality, 0) / count) : 0
  const avgWeaveDensity = count > 0 ? Math.round(threads.reduce((s, t) => s + t.weaveDensity, 0) / count) : 0
  const avgPatternRichness = count > 0 ? Math.round(threads.reduce((s, t) => s + t.patternRichness, 0) / count) : 0
  const avgColorPalette = count > 0 ? Math.round(threads.reduce((s, t) => s + t.colorPalette, 0) / count) : 0
  const avgNarrativeCoherence = count > 0 ? Math.round(threads.reduce((s, t) => s + t.narrativeCoherence, 0) / count) : 0
  const avgArtisticValue = count > 0 ? Math.round(threads.reduce((s, t) => s + t.artisticValue, 0) / count) : 0
  const overallCraftsmanship = count > 0 ? Math.round(threads.reduce((s, t) => s + t.qualityScore, 0) / count) : 0

  const gallery: TapestryGallery = {
    avgQuality: avgThreadQuality,
    avgDensity: avgWeaveDensity,
    avgNarrative: avgNarrativeCoherence,
    isMasterwork: overallCraftsmanship >= 80,
    overallCraftsmanship,
  }

  const bestBy = <T>(arr: T[], fn: (item: T) => number): T => arr.reduce((a, b) => (fn(a) >= fn(b) ? a : b))

  const stats: TapestryStats = {
    totalFiles: count,
    totalPanels: panels.length,
    avgThreadQuality,
    avgWeaveDensity,
    avgPatternRichness,
    avgColorPalette,
    avgNarrativeCoherence,
    avgArtisticValue,
    gobelinsMasterpieceCount: threads.filter((t) => t.condition === 'gobelins-masterpiece').length,
    fineTapestryCount: threads.filter((t) => t.condition === 'fine-tapestry').length,
    qualityWeaveCount: threads.filter((t) => t.condition === 'quality-weave').length,
    standardClothCount: threads.filter((t) => t.condition === 'standard-cloth').length,
    ragRugCount: threads.filter((t) => t.condition === 'rag-rug').length,
    tangledYarnCount: threads.filter((t) => t.condition === 'tangled-yarn').length,
    isStrongCount: threads.filter((t) => t.thread.isStrong).length,
    hasNoKnotsCount: threads.filter((t) => t.thread.hasNoKnots).length,
    isTightWeaveCount: threads.filter((t) => t.weave.isTightWeave).length,
    hasNoGapsCount: threads.filter((t) => t.weave.hasNoGaps).length,
    hasRepeatingMotifsCount: threads.filter((t) => t.pattern.hasRepeatingMotifs).length,
    hasVibrantColorsCount: threads.filter((t) => t.color.hasVibrantColors).length,
    hasNoColorBleedingCount: threads.filter((t) => t.color.hasNoColorBleeding).length,
    hasNarrativeArcCount: threads.filter((t) => t.narrative.hasNarrativeArc).length,
    hasNoPlotHolesCount: threads.filter((t) => t.narrative.hasNoPlotHoles).length,
    isMasterworkCount: threads.filter((t) => t.artistry.isMasterwork).length,
    overallCraftsmanship,
    weaverGrade: classifyWeaverGrade(overallCraftsmanship),
    bestThread: count > 0 ? bestBy(threads, (t) => t.threadQuality).file : '',
    finestWeave: count > 0 ? bestBy(threads, (t) => t.weaveDensity).file : '',
    richestPattern: count > 0 ? bestBy(threads, (t) => t.patternRichness).file : '',
    bestNarrative: count > 0 ? bestBy(threads, (t) => t.narrativeCoherence).file : '',
    mostArtistic: count > 0 ? bestBy(threads, (t) => t.artisticValue).file : '',
  }

  const recommendations = generateRecommendations(threads, panels, gallery, stats)

  return { threads, panels, gallery, stats, recommendations }
}
