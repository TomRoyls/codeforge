// ─── Interfaces ────────────────────────────────────────────────────────────

export interface StoneMeasure {
  purity: number
  type: 'carrara' | 'calacatta' | 'statuario' | 'thassos' | 'travertine' | 'concrete'
  isPure: boolean
  hasNoInclusions: boolean
  hasNoFractures: boolean
  hasNoStains: boolean
  hasProperCrystallization: boolean
  hasUniformColor: boolean
  hasTranslucency: boolean
  hasDensity: boolean
  hasPorosity: boolean
  hasWeathering: boolean
  inclusionCount: number
  fractureCount: number
}

export interface GrainMeasure {
  consistency: number
  pattern: 'fine' | 'medium' | 'coarse' | 'mixed' | 'brecciated' | 'chaotic'
  isConsistent: boolean
  hasEvenGrain: boolean
  hasProperBedding: boolean
  hasDirectionalGrain: boolean
  hasCrossBedding: boolean
  hasRippleMarks: boolean
  hasNoFissures: boolean
  hasNoCleavage: boolean
  hasInterlockingGrain: boolean
  hasGrainBoundary: boolean
  fissureCount: number
  cleavageCount: number
}

export interface VeinMeasure {
  quality: number
  pattern: 'linear' | 'branching' | 'network' | 'chaotic' | 'absent' | 'fractured'
  hasStrongVeining: boolean
  hasBeautifulPattern: boolean
  hasConsistentDirection: boolean
  hasProperBranching: boolean
  hasNoDeadEnds: boolean
  hasNoCrossVeins: boolean
  hasGoldenVein: boolean
  hasCentralVein: boolean
  hasSecondaryVeins: boolean
  deadEndCount: number
  crossVeinCount: number
}

export interface DepthMeasure {
  level: number
  strata: 'surface' | 'shallow' | 'medium' | 'deep' | 'bedrock' | 'mantle'
  isProperlySeated: boolean
  hasSolidFoundation: boolean
  hasProperExcavation: boolean
  hasGeologicalLayers: boolean
  hasFaultLine: boolean
  hasStratification: boolean
  hasSeam: boolean
  hasOverburden: boolean
  hasUndercutting: boolean
  layerCount: number
  faultCount: number
}

export interface ExtractionMeasure {
  quality: number
  method: 'block-cutting' | 'diamond-wire' | 'chain-saw' | 'blasting' | 'pickaxe' | 'bare-hands'
  isCleanlyExtracted: boolean
  hasProperShape: boolean
  hasConsistentSize: boolean
  hasCleanEdges: boolean
  hasNoDamage: boolean
  hasQuarryMarks: boolean
  hasWasteMaterial: boolean
  hasSalvageable: boolean
  hasFinishedFaces: boolean
  hasRoughFaces: boolean
  wastePercent: number
  salvageableCount: number
}

export interface SculptingMeasure {
  potential: number
  malleability: 'soft' | 'medium' | 'hard' | 'very-hard' | 'brittle' | 'shattered'
  isWorkable: boolean
  hasGoodProportions: boolean
  hasMichelangeloPotential: boolean
  hasProperBlocking: boolean
  hasRefinementPotential: boolean
  hasPolishingPotential: boolean
  hasStructuralIntegrity: boolean
  hasNoHiddenFlaws: boolean
  hasChiselMarks: boolean
  hasDust: boolean
  flawCount: number
  chiselMarkCount: number
}

export interface QuarryBlock {
  file: string
  stonePurity: number
  grainConsistency: number
  veinQuality: number
  quarryDepth: number
  extractionQuality: number
  sculptingPotential: number
  stone: StoneMeasure
  grain: GrainMeasure
  vein: VeinMeasure
  depth: DepthMeasure
  extraction: ExtractionMeasure
  sculpting: SculptingMeasure
  condition: 'carrara-masterpiece' | 'premium-block' | 'quality-stone' | 'building-marble' | 'rough-block' | 'rubble'
  qualityScore: number
}

export interface QuarryGallery {
  directory: string
  blocks: QuarryBlock[]
  avgPurity: number
  avgConsistency: number
  avgSculptingPotential: number
  carraraCount: number
  rubbleCount: number
  workableCount: number
  reusableCount: number
  galleryType: 'master-gallery' | 'premium-quarry' | 'standard-quarry' | 'gravel-pit' | 'salvage-yard' | 'mine-tailings'
  condition: 'sculptors-paradise' | 'quality-quarry' | 'working-quarry' | 'stripped-mine' | 'salvage' | 'rubble-heap'
}

export interface MarbleQuarryStats {
  totalFiles: number
  totalGalleries: number
  avgStonePurity: number
  avgGrainConsistency: number
  avgVeinQuality: number
  avgQuarryDepth: number
  avgExtractionQuality: number
  avgSculptingPotential: number
  carraraMasterpieceCount: number
  premiumBlockCount: number
  qualityStoneCount: number
  buildingMarbleCount: number
  roughBlockCount: number
  rubbleCount: number
  isPureCount: number
  hasNoInclusionsCount: number
  hasNoFracturesCount: number
  isConsistentCount: number
  hasEvenGrainCount: number
  hasStrongVeiningCount: number
  hasNoDeadEndsCount: number
  hasSolidFoundationCount: number
  isCleanlyExtractedCount: number
  hasFinishedFacesCount: number
  isWorkableCount: number
  hasMichelangeloPotentialCount: number
  overallGrade: number
  sculptorGrade: 'master-sculptor' | 'sculptor' | 'stone-mason' | 'quarryman' | 'apprentice' | 'tourist-with-hammer'
  bestBlock: string
  purestStone: string
  mostConsistent: string
  bestVeins: string
  deepestFoundation: string
}

export interface MarbleQuarryResult {
  blocks: QuarryBlock[]
  galleries: QuarryGallery[]
  quarry: {
    avgPurity: number
    avgConsistency: number
    avgSculptingPotential: number
    isHighGrade: boolean
    overallGrade: number
  }
  stats: MarbleQuarryStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────────────

const TODO_REGEX = /TODO/gi
const FIXME_REGEX = /FIXME/gi
const HACK_REGEX = /HACK/gi
const DEPRECATED_REGEX = /@deprecated/g
const CONSOLE_REGEX = /console\.\w+/g
const ANY_REGEX = /:\s*any\b/g
const TS_IGNORE_REGEX = /\/\/\s*@ts-ignore/g
const TS_EXPECT_ERROR_REGEX = /\/\/\s*@ts-expect-error/g
const FUNCTION_REGEX = /\bfunction\b/g
const ARROW_REGEX = /=>\s*{/g
const CLASS_REGEX = /\bclass\b/g
const INTERFACE_REGEX = /\binterface\b/g
const TYPE_REGEX = /\btype\s+\w+\s*=/g
const EXPORT_REGEX = /\bexport\b/g
const IMPORT_REGEX = /\bimport\b/g
const ASYNC_REGEX = /\basync\b/g
const TRY_REGEX = /\btry\s*{/g
const CATCH_REGEX = /\bcatch\s*\(/g
const FINALLY_REGEX = /\bfinally\s*{/g
const IF_REGEX = /\bif\s*\(/g
const FOR_REGEX = /\bfor\s*\(/g
const WHILE_REGEX = /\bwhile\s*\(/g
const SWITCH_REGEX = /\bswitch\s*\(/g
const RETURN_REGEX = /\breturn\b/g
const THROW_REGEX = /\bthrow\b/g
const TYPE_ANNOTATION_REGEX = /:\s*(?:string|number|boolean|void|never|unknown|any|null|undefined|object)/g
const JSDOC_REGEX = /\/\*\*[\s\S]*?\*\//g
const LINE_COMMENT_REGEX = /\/\/.*$/gm

// ─── Counting Helpers ──────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function countNonEmptyLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter((l) => l.trim().length > 0).length
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

function countTypeAliases(content: string): number {
  return countMatches(content, TYPE_REGEX)
}

function countExports(content: string): number {
  return countMatches(content, EXPORT_REGEX)
}

function countImports(content: string): number {
  return countMatches(content, IMPORT_REGEX)
}

function countConditionals(content: string): number {
  return countMatches(content, IF_REGEX) + countMatches(content, SWITCH_REGEX)
}

function countLoops(content: string): number {
  return countMatches(content, FOR_REGEX) + countMatches(content, WHILE_REGEX)
}

function countErrorHandling(content: string): number {
  return countMatches(content, TRY_REGEX) + countMatches(content, CATCH_REGEX) + countMatches(content, FINALLY_REGEX)
}

function countTypeAnnotations(content: string): number {
  return countMatches(content, TYPE_ANNOTATION_REGEX)
}

function countComments(content: string): number {
  const jsdoc = countMatches(content, JSDOC_REGEX)
  const line = countMatches(content, LINE_COMMENT_REGEX)
  return jsdoc + line
}

function countTodos(content: string): number {
  return countMatches(content, TODO_REGEX) + countMatches(content, FIXME_REGEX) + countMatches(content, HACK_REGEX)
}

function countSmells(content: string): number {
  return countMatches(content, CONSOLE_REGEX) + countMatches(content, ANY_REGEX) + countMatches(content, TS_IGNORE_REGEX) + countMatches(content, TS_EXPECT_ERROR_REGEX)
}

function countDeprecated(content: string): number {
  return countMatches(content, DEPRECATED_REGEX)
}

// ─── Measure Stone ─────────────────────────────────────────────────────────

/** @example measureStone('export function foo(): void {}') returns StoneMeasure */
export function measureStone(content: string): StoneMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAliases = countTypeAliases(content)
  const todos = countTodos(content)
  const smells = countSmells(content)
  const deprecated = countDeprecated(content)
  const typeAnnotations = countTypeAnnotations(content)
  const exports = countExports(content)
  const comments = countComments(content)

  const totalDeclarations = funcs + classes + interfaces + typeAliases

  // Purity: high when few smells, todos, deprecated markers
  const basePurity = lines === 0 ? 10 : Math.min(100, lines * 2)
  const smellDeduction = Math.min(40, smells * 10)
  const todoDeduction = Math.min(20, todos * 5)
  const deprecatedDeduction = Math.min(15, deprecated * 5)
  const purity = Math.max(0, basePurity - smellDeduction - todoDeduction - deprecatedDeduction)

  const hasDeclarations = totalDeclarations > 0
  const hasTypedContent = typeAnnotations > 0
  const hasExports = exports > 0
  const hasComments = comments > 0

  const isPure = purity >= 70
  const hasNoInclusions = todos === 0 && deprecated === 0
  const hasNoFractures = smells === 0
  const hasNoStains = todos === 0 && smells === 0 && deprecated === 0
  const hasProperCrystallization = hasTypedContent && hasDeclarations
  const hasUniformColor = hasDeclarations && (funcs > 0 ? classes > 0 || interfaces > 0 : true)
  const hasTranslucency = hasExports && hasComments
  const hasDensity = lines >= 5
  const hasPorosity = lines < 3
  const hasWeathering = deprecated > 0 || todos > 3
  const inclusionCount = todos + deprecated
  const fractureCount = smells

  let type: StoneMeasure['type']
  if (purity >= 85 && hasTypedContent && hasExports) {
    type = 'carrara'
  } else if (purity >= 75 && hasTypedContent) {
    type = 'calacatta'
  } else if (purity >= 65 && hasDeclarations) {
    type = 'statuario'
  } else if (purity >= 50) {
    type = 'thassos'
  } else if (purity >= 30) {
    type = 'travertine'
  } else {
    type = 'concrete'
  }

  return {
    purity,
    type,
    isPure,
    hasNoInclusions,
    hasNoFractures,
    hasNoStains,
    hasProperCrystallization,
    hasUniformColor,
    hasTranslucency,
    hasDensity,
    hasPorosity,
    hasWeathering,
    inclusionCount,
    fractureCount,
  }
}

// ─── Measure Grain ─────────────────────────────────────────────────────────

/** @example measureGrain('export function add(a: number, b: number): number { return a + b; }') returns GrainMeasure */
export function measureGrain(content: string): GrainMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAliases = countTypeAliases(content)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const typeAnnotations = countTypeAnnotations(content)

  const totalDeclarations = funcs + classes + interfaces + typeAliases
  const complexity = conditionals + loops

  // Consistency: high when declarations are well-balanced and typed
  const baseConsistency = lines === 0 ? 10 : Math.min(80, totalDeclarations * 10 + lines)
  const complexityDeduction = Math.min(30, complexity * 5)
  const consistency = Math.max(0, Math.min(100, baseConsistency - complexityDeduction + (typeAnnotations > 0 ? 15 : 0)))

  const isConsistent = consistency >= 65
  const hasEvenGrain = totalDeclarations > 0 && complexity <= totalDeclarations * 2
  const hasProperBedding = funcs > 0 || classes > 0
  const hasDirectionalGrain = conditionals > 0
  const hasCrossBedding = classes > 0 && interfaces > 0
  const hasRippleMarks = loops > 0
  const hasNoFissures = complexity <= 10
  const hasNoCleavage = totalDeclarations === 0 || (funcs > 0 && (classes > 0 || interfaces > 0))
  const hasInterlockingGrain = totalDeclarations >= 3
  const hasGrainBoundary = countImports(content) > 0 && countExports(content) > 0
  const fissureCount = Math.max(0, complexity - 5)
  const cleavageCount = totalDeclarations > 5 ? totalDeclarations - 5 : 0

  let pattern: GrainMeasure['pattern']
  if (complexity === 0) {
    pattern = 'fine'
  } else if (complexity <= 3) {
    pattern = 'medium'
  } else if (complexity <= 6) {
    pattern = 'coarse'
  } else if (complexity <= 10) {
    pattern = 'mixed'
  } else if (complexity <= 15) {
    pattern = 'brecciated'
  } else {
    pattern = 'chaotic'
  }

  return {
    consistency,
    pattern,
    isConsistent,
    hasEvenGrain,
    hasProperBedding,
    hasDirectionalGrain,
    hasCrossBedding,
    hasRippleMarks,
    hasNoFissures,
    hasNoCleavage,
    hasInterlockingGrain,
    hasGrainBoundary,
    fissureCount,
    cleavageCount,
  }
}

// ─── Measure Vein ──────────────────────────────────────────────────────────

/** @example measureVein('export function add(a: number, b: number): number { return a + b; }') returns VeinMeasure */
export function measureVein(content: string): VeinMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const returns = countMatches(content, RETURN_REGEX)
  const throws = countMatches(content, THROW_REGEX)
  const asyncs = countMatches(content, ASYNC_REGEX)
  const exports = countExports(content)
  const imports = countImports(content)

  const complexity = conditionals + loops
  const hasCode = funcs > 0 || lines > 0

  // Quality: strong logic flow, returns, error handling
  const baseQuality = lines === 0 ? 10 : Math.min(60, funcs * 10 + conditionals * 5 + lines)
  const flowBonus = returns > 0 ? 15 : 0
  const asyncBonus = asyncs > 0 ? 10 : 0
  const exportBonus = exports > 0 ? 10 : 0
  const quality = Math.max(0, Math.min(100, baseQuality + flowBonus + asyncBonus + exportBonus))

  const hasStrongVeining = quality >= 60
  const hasBeautifulPattern = quality >= 75 && conditionals > 0
  const hasConsistentDirection = returns > 0
  const hasProperBranching = conditionals > 0
  const hasNoDeadEnds = !hasCode || returns > 0 || conditionals > 0
  const hasNoCrossVeins = complexity <= conditionals * 2 + 2
  const hasGoldenVein = quality >= 80 && asyncs > 0 && throws > 0
  const hasCentralVein = exports > 0
  const hasSecondaryVeins = imports > 0
  const deadEndCount = hasCode && returns === 0 && conditionals === 0 ? 1 : 0
  const crossVeinCount = Math.max(0, complexity - conditionals - loops)

  let pattern: VeinMeasure['pattern']
  if (!hasCode || lines === 0) {
    pattern = 'absent'
  } else if (complexity === 0) {
    pattern = 'linear'
  } else if (complexity <= 4) {
    pattern = 'branching'
  } else if (complexity <= 8) {
    pattern = 'network'
  } else if (complexity <= 12) {
    pattern = 'chaotic'
  } else {
    pattern = 'fractured'
  }

  return {
    quality,
    pattern,
    hasStrongVeining,
    hasBeautifulPattern,
    hasConsistentDirection,
    hasProperBranching,
    hasNoDeadEnds,
    hasNoCrossVeins,
    hasGoldenVein,
    hasCentralVein,
    hasSecondaryVeins,
    deadEndCount,
    crossVeinCount,
  }
}

// ─── Measure Depth ─────────────────────────────────────────────────────────

/** @example measureDepth('export function add(a: number, b: number): number { return a + b; }') returns DepthMeasure */
export function measureDepth(content: string): DepthMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAliases = countTypeAliases(content)
  const errorHandling = countErrorHandling(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const nested = countMatches(content, /\{/g) - countMatches(content, /\}/g)

  const totalDeclarations = funcs + classes + interfaces + typeAliases

  // Level: implementation depth based on layers
  const baseLevel = lines === 0 ? 10 : Math.min(50, lines * 2)
  const layerBonus = Math.min(30, (classes > 0 ? 10 : 0) + (interfaces > 0 ? 10 : 0) + (typeAliases > 0 ? 10 : 0))
  const depthBonus = Math.min(20, errorHandling * 5)
  const level = Math.max(0, Math.min(100, baseLevel + layerBonus + depthBonus))

  const isProperlySeated = totalDeclarations > 0
  const hasSolidFoundation = errorHandling > 0 || classes > 0
  const hasProperExcavation = funcs > 0 && (classes > 0 || interfaces > 0)
  const hasGeologicalLayers = classes > 0 && interfaces > 0
  const hasFaultLine = nested !== 0 && Math.abs(nested) > 5
  const hasStratification = totalDeclarations >= 3
  const hasSeam = imports > 0 && exports > 0
  const hasOverburden = imports > 10
  const hasUndercutting = funcs > 0 && errorHandling === 0 && lines > 10
  const layerCount = totalDeclarations
  const faultCount = Math.abs(nested) > 3 ? Math.abs(nested) - 3 : 0

  let strata: DepthMeasure['strata']
  if (level >= 80) {
    strata = 'mantle'
  } else if (level >= 65) {
    strata = 'bedrock'
  } else if (level >= 50) {
    strata = 'deep'
  } else if (level >= 35) {
    strata = 'medium'
  } else if (level >= 20) {
    strata = 'shallow'
  } else {
    strata = 'surface'
  }

  return {
    level,
    strata,
    isProperlySeated,
    hasSolidFoundation,
    hasProperExcavation,
    hasGeologicalLayers,
    hasFaultLine,
    hasStratification,
    hasSeam,
    hasOverburden,
    hasUndercutting,
    layerCount,
    faultCount,
  }
}

// ─── Measure Extraction ────────────────────────────────────────────────────

/** @example measureExtraction('export function add(a: number, b: number): number { return a + b; }') returns ExtractionMeasure */
export function measureExtraction(content: string): ExtractionMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const comments = countComments(content)
  const todos = countTodos(content)

  const totalDeclarations = funcs + classes + interfaces

  // Quality: reusability based on exports, clean interfaces
  const baseQuality = lines === 0 ? 10 : Math.min(50, exports * 10 + lines)
  const interfaceBonus = Math.min(20, interfaces * 10)
  const funcBonus = Math.min(20, funcs * 5)
  const importPenalty = Math.min(20, Math.max(0, imports - exports) * 5)
  const quality = Math.max(0, Math.min(100, baseQuality + interfaceBonus + funcBonus - importPenalty))

  const isCleanlyExtracted = exports > 0 && todos === 0
  const hasProperShape = totalDeclarations > 0
  const hasConsistentSize = lines > 0 && lines <= 100
  const hasCleanEdges = exports > 0
  const hasNoDamage = todos === 0 && countSmells(content) === 0
  const hasQuarryMarks = comments > 0
  const hasWasteMaterial = todos > 0 || countMatches(content, DEPRECATED_REGEX) > 0
  const hasSalvageable = totalDeclarations > 0
  const hasFinishedFaces = exports > 0 && comments > 0
  const hasRoughFaces = imports > 0 && exports === 0
  const wastePercent = lines > 0 ? Math.min(100, Math.round((todos / lines) * 100)) : 0
  const salvageableCount = totalDeclarations

  let method: ExtractionMeasure['method']
  if (quality >= 80 && exports > 0 && interfaces > 0) {
    method = 'block-cutting'
  } else if (quality >= 65 && exports > 0) {
    method = 'diamond-wire'
  } else if (quality >= 50) {
    method = 'chain-saw'
  } else if (quality >= 35) {
    method = 'blasting'
  } else if (quality >= 20) {
    method = 'pickaxe'
  } else {
    method = 'bare-hands'
  }

  return {
    quality,
    method,
    isCleanlyExtracted,
    hasProperShape,
    hasConsistentSize,
    hasCleanEdges,
    hasNoDamage,
    hasQuarryMarks,
    hasWasteMaterial,
    hasSalvageable,
    hasFinishedFaces,
    hasRoughFaces,
    wastePercent,
    salvageableCount,
  }
}

// ─── Measure Sculpting ─────────────────────────────────────────────────────

/** @example measureSculpting('export function add(a: number, b: number): number { return a + b; }') returns SculptingMeasure */
export function measureSculpting(content: string): SculptingMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAliases = countTypeAliases(content)
  const typeAnnotations = countTypeAnnotations(content)
  const errorHandling = countErrorHandling(content)
  const todos = countTodos(content)
  const smells = countSmells(content)
  const comments = countComments(content)

  const totalDeclarations = funcs + classes + interfaces + typeAliases
  const hasStructure = totalDeclarations > 0

  // Potential: refactorability — typed, structured, not too complex
  const basePotential = lines === 0 ? 10 : Math.min(50, totalDeclarations * 10 + lines)
  const typeBonus = Math.min(20, typeAnnotations * 3)
  const structureBonus = Math.min(15, errorHandling * 5)
  const smellPenalty = Math.min(30, (smells + todos) * 5)
  const potential = Math.max(0, Math.min(100, basePotential + typeBonus + structureBonus - smellPenalty))

  const isWorkable = potential >= 40 && hasStructure
  const hasGoodProportions = funcs > 0 && lines <= funcs * 20 + 5
  const hasMichelangeloPotential = potential >= 75 && typeAnnotations > 0 && interfaces > 0
  const hasProperBlocking = hasStructure
  const hasRefinementPotential = potential >= 30
  const hasPolishingPotential = comments > 0 || typeAnnotations > 0
  const hasStructuralIntegrity = smells === 0
  const hasNoHiddenFlaws = todos === 0 && smells === 0
  const hasChiselMarks = comments > 0
  const hasDust = todos > 0
  const flawCount = smells + todos
  const chiselMarkCount = comments

  let malleability: SculptingMeasure['malleability']
  if (potential >= 75) {
    malleability = 'soft'
  } else if (potential >= 55) {
    malleability = 'medium'
  } else if (potential >= 40) {
    malleability = 'hard'
  } else if (potential >= 25) {
    malleability = 'very-hard'
  } else if (potential >= 10) {
    malleability = 'brittle'
  } else {
    malleability = 'shattered'
  }

  return {
    potential,
    malleability,
    isWorkable,
    hasGoodProportions,
    hasMichelangeloPotential,
    hasProperBlocking,
    hasRefinementPotential,
    hasPolishingPotential,
    hasStructuralIntegrity,
    hasNoHiddenFlaws,
    hasChiselMarks,
    hasDust,
    flawCount,
    chiselMarkCount,
  }
}

// ─── Classify Block Condition ──────────────────────────────────────────────

/** @example classifyBlockCondition(80) returns 'carrara-masterpiece' */
export function classifyBlockCondition(score: number): QuarryBlock['condition'] {
  if (score >= 80) return 'carrara-masterpiece'
  if (score >= 65) return 'premium-block'
  if (score >= 50) return 'quality-stone'
  if (score >= 35) return 'building-marble'
  if (score >= 20) return 'rough-block'
  return 'rubble'
}

// ─── Analyze Quarry Block ──────────────────────────────────────────────────

/** @example analyzeQuarryBlock('export function foo(): void {}', 'mod.ts') returns QuarryBlock */
export function analyzeQuarryBlock(content: string, filePath: string): QuarryBlock {
  const stone = measureStone(content)
  const grain = measureGrain(content)
  const vein = measureVein(content)
  const depth = measureDepth(content)
  const extraction = measureExtraction(content)
  const sculpting = measureSculpting(content)

  const stonePurity = stone.purity
  const grainConsistency = grain.consistency
  const veinQuality = vein.quality
  const quarryDepth = depth.level
  const extractionQuality = extraction.quality
  const sculptingPotential = sculpting.potential

  const qualityScore = Math.round(
    (stonePurity + grainConsistency + veinQuality + quarryDepth + extractionQuality + sculptingPotential) / 6,
  )

  const condition = classifyBlockCondition(qualityScore)

  return {
    file: filePath,
    stonePurity,
    grainConsistency,
    veinQuality,
    quarryDepth,
    extractionQuality,
    sculptingPotential,
    stone,
    grain,
    vein,
    depth,
    extraction,
    sculpting,
    condition,
    qualityScore,
  }
}

// ─── Classify Gallery Type ─────────────────────────────────────────────────

/** @example classifyGalleryType(blocks) returns 'standard-quarry' */
export function classifyGalleryType(blocks: QuarryBlock[]): QuarryGallery['galleryType'] {
  if (blocks.length === 0) return 'mine-tailings'
  const avgScore = Math.round(blocks.reduce((s, b) => s + b.qualityScore, 0) / blocks.length)
  const carraraCount = blocks.filter((b) => b.condition === 'carrara-masterpiece').length
  const ratio = carraraCount / blocks.length

  if (avgScore >= 75 && ratio >= 0.5) return 'master-gallery'
  if (avgScore >= 60) return 'premium-quarry'
  if (avgScore >= 45) return 'standard-quarry'
  if (avgScore >= 30) return 'gravel-pit'
  if (avgScore >= 15) return 'salvage-yard'
  return 'mine-tailings'
}

/** @example classifyGalleryCondition(70) returns 'quality-quarry' */
export function classifyGalleryCondition(avgScore: number): QuarryGallery['condition'] {
  if (avgScore >= 75) return 'sculptors-paradise'
  if (avgScore >= 60) return 'quality-quarry'
  if (avgScore >= 45) return 'working-quarry'
  if (avgScore >= 30) return 'stripped-mine'
  if (avgScore >= 15) return 'salvage'
  return 'rubble-heap'
}

// ─── Classify Sculptor Grade ───────────────────────────────────────────────

/** @example classifySculptorGrade(85) returns 'master-sculptor' */
export function classifySculptorGrade(avgGrade: number): MarbleQuarryStats['sculptorGrade'] {
  if (avgGrade >= 80) return 'master-sculptor'
  if (avgGrade >= 65) return 'sculptor'
  if (avgGrade >= 50) return 'stone-mason'
  if (avgGrade >= 35) return 'quarryman'
  if (avgGrade >= 20) return 'apprentice'
  return 'tourist-with-hammer'
}

// ─── Analyze Quarry Gallery ────────────────────────────────────────────────

/** @example analyzeQuarryGallery(blocks, 'src') returns QuarryGallery */
export function analyzeQuarryGallery(blocks: QuarryBlock[], dirPath: string): QuarryGallery {
  const count = blocks.length
  const avgPurity = count > 0 ? Math.round(blocks.reduce((s, b) => s + b.stonePurity, 0) / count) : 0
  const avgConsistency = count > 0 ? Math.round(blocks.reduce((s, b) => s + b.grainConsistency, 0) / count) : 0
  const avgSculptingPotential = count > 0 ? Math.round(blocks.reduce((s, b) => s + b.sculptingPotential, 0) / count) : 0

  const carraraCount = blocks.filter((b) => b.condition === 'carrara-masterpiece').length
  const rubbleCount = blocks.filter((b) => b.condition === 'rubble').length
  const workableCount = blocks.filter((b) => b.sculpting.isWorkable).length
  const reusableCount = blocks.filter((b) => b.extraction.hasSalvageable).length

  const galleryType = classifyGalleryType(blocks)
  const avgScore = count > 0 ? Math.round(blocks.reduce((s, b) => s + b.qualityScore, 0) / count) : 0
  const condition = classifyGalleryCondition(avgScore)

  return {
    directory: dirPath,
    blocks,
    avgPurity,
    avgConsistency,
    avgSculptingPotential,
    carraraCount,
    rubbleCount,
    workableCount,
    reusableCount,
    galleryType,
    condition,
  }
}

// ─── Generate Recommendations ──────────────────────────────────────────────

/** @example generateRecommendations(blocks, galleries, quarry, stats) returns string[] */
export function generateRecommendations(
  blocks: QuarryBlock[],
  _galleries: QuarryGallery[],
  _quarry: MarbleQuarryResult['quarry'],
  _stats: MarbleQuarryStats,
): string[] {
  const recommendations: string[] = []

  const highPollution = blocks.filter((b) => b.stone.inclusionCount > 3)
  if (highPollution.length > 0) {
    recommendations.push(`Remove inclusions (TODOs, FIXMEs) from ${highPollution.length} block(s) to improve stone purity`)
  }

  const hasFractures = blocks.some((b) => !b.stone.hasNoFractures)
  if (hasFractures) {
    recommendations.push('Fix code fractures (console calls, any types, ts-ignore) to prevent structural weakness')
  }

  const hasChaoticGrain = blocks.some((b) => b.grain.pattern === 'chaotic' || b.grain.pattern === 'brecciated')
  if (hasChaoticGrain) {
    recommendations.push('Reduce cyclomatic complexity to achieve fine-grain consistency')
  }

  const hasDeadEnds = blocks.some((b) => b.vein.deadEndCount > 0)
  if (hasDeadEnds) {
    recommendations.push('Add proper return paths to eliminate dead-end veins in logic')
  }

  const hasFaults = blocks.some((b) => b.depth.hasFaultLine)
  if (hasFaults) {
    recommendations.push('Address depth fault lines — unbalanced brace structure detected')
  }

  const hasRoughBlocks = blocks.some((b) => b.extraction.method === 'pickaxe' || b.extraction.method === 'bare-hands')
  if (hasRoughBlocks) {
    recommendations.push('Improve extraction quality by adding exports and proper interfaces')
  }

  const hasBrittle = blocks.some((b) => b.sculpting.malleability === 'brittle' || b.sculpting.malleability === 'shattered')
  if (hasBrittle) {
    recommendations.push('Add type annotations and error handling to improve sculpting potential')
  }

  const hasWeathering = blocks.some((b) => b.stone.hasWeathering)
  if (hasWeathering) {
    recommendations.push('Address weathering — deprecated markers and excessive TODOs degrade stone over time')
  }

  if (recommendations.length === 0) {
    recommendations.push('Marble quarry is in pristine condition — all blocks are Carrara-grade quality')
  }

  return recommendations
}

// ─── Build Result ──────────────────────────────────────────────────────────

/** @example buildMarbleQuarryResult(['a.ts'], ['export function foo(): void {}']) returns MarbleQuarryResult */
export function buildMarbleQuarryResult(
  files: string[],
  contents: string[],
  _options?: { ignore?: string[]; ext?: string[] },
): MarbleQuarryResult {

  const blocks: QuarryBlock[] = files.map((file, i) =>
    analyzeQuarryBlock(contents[i] ?? '', file),
  )

  // Group by directory
  const dirMap = new Map<string, QuarryBlock[]>()
  for (const block of blocks) {
    const dir = block.file.includes('/') ? block.file.substring(0, block.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(block)
    } else {
      dirMap.set(dir, [block])
    }
  }

  const galleries: QuarryGallery[] = Array.from(dirMap.entries()).map(
    ([dir, dirBlocks]) => analyzeQuarryGallery(dirBlocks, dir),
  )

  const count = blocks.length
  const avgPurity = count > 0 ? Math.round(blocks.reduce((s, b) => s + b.stonePurity, 0) / count) : 0
  const avgConsistency = count > 0 ? Math.round(blocks.reduce((s, b) => s + b.grainConsistency, 0) / count) : 0
  const avgSculptingPotential = count > 0 ? Math.round(blocks.reduce((s, b) => s + b.sculptingPotential, 0) / count) : 0
  const overallGrade = count > 0 ? Math.round(blocks.reduce((s, b) => s + b.qualityScore, 0) / count) : 0

  const quarry: MarbleQuarryResult['quarry'] = {
    avgPurity,
    avgConsistency,
    avgSculptingPotential,
    isHighGrade: overallGrade >= 60,
    overallGrade,
  }

  const avgStonePurity = avgPurity
  const avgGrainConsistency = avgConsistency
  const avgVeinQuality = count > 0 ? Math.round(blocks.reduce((s, b) => s + b.veinQuality, 0) / count) : 0
  const avgQuarryDepth = count > 0 ? Math.round(blocks.reduce((s, b) => s + b.quarryDepth, 0) / count) : 0
  const avgExtractionQuality = count > 0 ? Math.round(blocks.reduce((s, b) => s + b.extractionQuality, 0) / count) : 0
  const avgSculptingPotentialStat = avgSculptingPotential

  const carraraMasterpieceCount = blocks.filter((b) => b.condition === 'carrara-masterpiece').length
  const premiumBlockCount = blocks.filter((b) => b.condition === 'premium-block').length
  const qualityStoneCount = blocks.filter((b) => b.condition === 'quality-stone').length
  const buildingMarbleCount = blocks.filter((b) => b.condition === 'building-marble').length
  const roughBlockCount = blocks.filter((b) => b.condition === 'rough-block').length
  const rubbleCount = blocks.filter((b) => b.condition === 'rubble').length

  const isPureCount = blocks.filter((b) => b.stone.isPure).length
  const hasNoInclusionsCount = blocks.filter((b) => b.stone.hasNoInclusions).length
  const hasNoFracturesCount = blocks.filter((b) => b.stone.hasNoFractures).length
  const isConsistentCount = blocks.filter((b) => b.grain.isConsistent).length
  const hasEvenGrainCount = blocks.filter((b) => b.grain.hasEvenGrain).length
  const hasStrongVeiningCount = blocks.filter((b) => b.vein.hasStrongVeining).length
  const hasNoDeadEndsCount = blocks.filter((b) => b.vein.hasNoDeadEnds).length
  const hasSolidFoundationCount = blocks.filter((b) => b.depth.hasSolidFoundation).length
  const isCleanlyExtractedCount = blocks.filter((b) => b.extraction.isCleanlyExtracted).length
  const hasFinishedFacesCount = blocks.filter((b) => b.extraction.hasFinishedFaces).length
  const isWorkableCount = blocks.filter((b) => b.sculpting.isWorkable).length
  const hasMichelangeloPotentialCount = blocks.filter((b) => b.sculpting.hasMichelangeloPotential).length

  const sculptorGrade = classifySculptorGrade(overallGrade)

  const bestBlock = count > 0
    ? blocks.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file
    : ''
  const purestStone = count > 0
    ? blocks.reduce((best, b) => b.stonePurity > best.stonePurity ? b : best).file
    : ''
  const mostConsistent = count > 0
    ? blocks.reduce((best, b) => b.grainConsistency > best.grainConsistency ? b : best).file
    : ''
  const bestVeins = count > 0
    ? blocks.reduce((best, b) => b.veinQuality > best.veinQuality ? b : best).file
    : ''
  const deepestFoundation = count > 0
    ? blocks.reduce((best, b) => b.quarryDepth > best.quarryDepth ? b : best).file
    : ''

  const stats: MarbleQuarryStats = {
    totalFiles: count,
    totalGalleries: galleries.length,
    avgStonePurity,
    avgGrainConsistency,
    avgVeinQuality,
    avgQuarryDepth,
    avgExtractionQuality,
    avgSculptingPotential: avgSculptingPotentialStat,
    carraraMasterpieceCount,
    premiumBlockCount,
    qualityStoneCount,
    buildingMarbleCount,
    roughBlockCount,
    rubbleCount,
    isPureCount,
    hasNoInclusionsCount,
    hasNoFracturesCount,
    isConsistentCount,
    hasEvenGrainCount,
    hasStrongVeiningCount,
    hasNoDeadEndsCount,
    hasSolidFoundationCount,
    isCleanlyExtractedCount,
    hasFinishedFacesCount,
    isWorkableCount,
    hasMichelangeloPotentialCount,
    overallGrade,
    sculptorGrade,
    bestBlock,
    purestStone,
    mostConsistent,
    bestVeins,
    deepestFoundation,
  }

  const recommendations = generateRecommendations(blocks, galleries, quarry, stats)

  return { blocks, galleries, quarry, stats, recommendations }
}
