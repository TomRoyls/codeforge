// ─── Types ──────────────────────────────────────────────────────────────────

export type ClayType = 'porcelain' | 'stoneware' | 'earthenware' | 'terra-cotta' | 'raku' | 'mud'
export type ShapingTechnique = 'throwing' | 'hand-building' | 'slip-casting' | 'coil' | 'slab' | 'pinch'
export type GlazeType = 'celadon' | 'raku' | 'shino' | 'tenmoku' | 'crystalline' | 'matte' | 'unglazed'
export type KilnTemperature = 'bisque' | 'low-fire' | 'mid-range' | 'high-fire' | 'over-fired' | 'raw'
export type ArtisticStyle = 'minimalist' | 'organic' | 'geometric' | 'baroque' | 'rustic' | 'industrial'
export type PieceCondition = 'museum-piece' | 'gallery-quality' | 'studio-pottery' | 'production-ware' | 'student-work' | 'cracked-pot'
export type StudioType = 'master-studio' | 'production-pottery' | 'teaching-studio' | 'community-center' | 'hobby-shed' | 'mud-pie'
export type StudioCondition = 'premier-gallery' | 'fine-craft' | 'artisan-workshop' | 'craft-fair' | 'beginner-class' | 'mud-hole'
export type PotterGrade = 'master-potter' | 'artisan' | 'journeyman' | 'apprentice' | 'student' | 'toddler'

export interface ClayMeasure {
  quality: number
  type: ClayType
  isWellPrepared: boolean
  hasProperConsistency: boolean
  hasNoAirBubbles: boolean
  hasProperMoisture: boolean
  hasImpurities: boolean
  hasProperWedging: boolean
  isWorkable: boolean
  hasCorrectPlasticity: boolean
  impurityCount: number
}

export interface WheelMeasure {
  speed: number
  isCentered: boolean
  hasSteadyRotation: boolean
  hasProperSpeed: boolean
  isBalanced: boolean
  hasWobble: boolean
  hasVibration: boolean
  hasGoodControl: boolean
  hasCentering: boolean
  wobbleCount: number
}

export interface ShapingMeasure {
  skill: number
  technique: ShapingTechnique
  isWellShaped: boolean
  hasSymmetry: boolean
  hasEvenWalls: boolean
  hasProperProportions: boolean
  hasSmoothSurface: boolean
  hasTrimMarks: boolean
  hasCracking: boolean
  hasWarping: boolean
  hasCollapsing: boolean
  crackingCount: number
  trimMarkCount: number
}

export interface GlazeMeasure {
  finish: number
  type: GlazeType
  isWellApplied: boolean
  hasEvenCoating: boolean
  hasNoRuns: boolean
  hasNoCrawling: boolean
  hasNoPinholing: boolean
  hasProperFiring: boolean
  hasFoodSafe: boolean
  hasDecorativeFinish: boolean
  hasSignature: boolean
  flawCount: number
}

export interface KilnMeasure {
  strength: number
  temperature: KilnTemperature
  isVitrified: boolean
  hasProperFiring: boolean
  hasNoThermalShock: boolean
  hasNoDunting: boolean
  hasNoBloating: boolean
  hasNoShivering: boolean
  hasKilnWash: boolean
  hasWitnessCone: boolean
  hasPyrometric: boolean
  flawCount: number
}

export interface ArtistryMeasure {
  merit: number
  style: ArtisticStyle
  hasAestheticValue: boolean
  hasFunctionalBeauty: boolean
  hasArtisticExpression: boolean
  hasCulturalSignificance: boolean
  hasProvenance: boolean
  hasUniqueCharacter: boolean
  hasHarmoniousForm: boolean
  isMuseumQuality: boolean
  expressionCount: number
}

export interface PotteryPiece {
  file: string
  clayQuality: number
  wheelSpeed: number
  shapingSkill: number
  glazeFinish: number
  kilnStrength: number
  artisticMerit: number
  clay: ClayMeasure
  wheel: WheelMeasure
  shaping: ShapingMeasure
  glaze: GlazeMeasure
  kiln: KilnMeasure
  artistry: ArtistryMeasure
  condition: PieceCondition
  qualityScore: number
}

export interface PotteryStudio {
  directory: string
  pieces: PotteryPiece[]
  avgClayQuality: number
  avgShapingSkill: number
  avgKilnStrength: number
  museumPieceCount: number
  crackedPotCount: number
  wellShapedCount: number
  vitrifiedCount: number
  studioType: StudioType
  condition: StudioCondition
}

export interface PotteryWheelStats {
  totalFiles: number
  totalStudios: number
  avgClayQuality: number
  avgWheelSpeed: number
  avgShapingSkill: number
  avgGlazeFinish: number
  avgKilnStrength: number
  avgArtisticMerit: number
  museumPieceCount: number
  galleryQualityCount: number
  studioPotteryCount: number
  productionWareCount: number
  studentWorkCount: number
  crackedPotCount: number
  isWellPreparedCount: number
  hasImpuritiesCount: number
  isCenteredCount: number
  hasWobbleCount: number
  isWellShapedCount: number
  hasCrackingCount: number
  isWellAppliedCount: number
  isVitrifiedCount: number
  hasProperFiringCount: number
  hasAestheticValueCount: number
  isMuseumQualityCount: number
  overallCraftsmanship: number
  potterGrade: PotterGrade
  bestPiece: string
  bestClay: string
  bestShaped: string
  bestGlazed: string
  strongest: string
}

export interface PotteryWheelResult {
  pieces: PotteryPiece[]
  studios: PotteryStudio[]
  kiln: {
    avgClayQuality: number
    avgShapingSkill: number
    avgKilnStrength: number
    isWellFired: boolean
    overallCraftsmanship: number
  }
  stats: PotteryWheelStats
  recommendations: string[]
}

// ─── Regex Constants ────────────────────────────────────────────────────────

const FUNCTION_RE = /\bfunction\b/g
const ARROW_RE = /\=>\s*[{(]/g
const CLASS_RE = /\bclass\b/g
const INTERFACE_RE = /\binterface\b/g
const TYPE_RE = /\btype\s+\w+\s*=/g
const EXPORT_RE = /\bexport\b/g
const IMPORT_RE = /\bimport\b/g
const CONST_RE = /\bconst\b/g
const LET_RE = /\blet\b/g
const VAR_RE = /\bvar\b/g
const IF_RE = /\bif\s*\(/g
const ELSE_RE = /\belse\b/g
const SWITCH_RE = /\bswitch\s*\(/g
const TRY_RE = /\btry\s*\{/g
const CATCH_RE = /\bcatch\b/g
const FINALLY_RE = /\bfinally\b/g
const THROW_RE = /\bthrow\b/g
const ERROR_RE = /\bError\b/g
const ASYNC_RE = /\basync\b/g
const ANY_RE = /:\s*any\b/g
const CONSOLE_RE = /\bconsole\.\w+/g
const DEBUGGER_RE = /\bdebugger\b/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const COMMENT_RE = /\/\/.*$/gm
const MAP_RE = /\.map\s*\(/g
const FILTER_RE = /\.filter\s*\(/g
const REDUCE_RE = /\.reduce\s*\(/g
const GENERIC_RE = /<\w+>/g
const TODO_RE = /\bTODO\b|\bFIXME\b|\bHACK\b/g

// ─── measureClay ────────────────────────────────────────────────────────────

/**
 * Measure raw code quality
 * @example
 * measureClay(content) // ClayMeasure
 */
export function measureClay(content: string): ClayMeasure {
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length
  const lets = (content.match(LET_RE) ?? []).length
  const vars = (content.match(VAR_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const debuggers = (content.match(DEBUGGER_RE) ?? []).length
  const todos = (content.match(TODO_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const totalFunctions = functions + arrows

  const impurityCount = anys + debuggers + todos
  const hasImpurities = impurityCount > 0
  const hasProperConsistency = consts > 0 && lets === 0 && vars === 0
  const hasNoAirBubbles = anys === 0
  const hasProperMoisture = totalFunctions > 0 && totalFunctions <= 20
  const hasProperWedging = totalFunctions > 0 && (classes > 0 || interfaces > 0)
  const isWorkable = totalFunctions > 0
  const hasCorrectPlasticity = consts > lets && consts > vars

  let quality = 15
  if (totalFunctions > 0) quality += 10
  if (classes > 0) quality += 10
  if (interfaces > 0 || types > 0) quality += 10
  if (hasProperConsistency) quality += 10
  if (hasNoAirBubbles) quality += 10
  if (hasProperWedging) quality += 10
  if (jsdoc > 0) quality += 10
  if (hasCorrectPlasticity) quality += 5
  if (totalFunctions > 5) quality += 5
  if (hasImpurities) quality -= 5 * Math.min(impurityCount, 3)
  quality = Math.max(0, Math.min(100, quality))

  const isWellPrepared = quality >= 55

  let type: ClayType = 'mud'
  if (quality >= 85) type = 'porcelain'
  else if (quality >= 70) type = 'stoneware'
  else if (quality >= 50) type = 'earthenware'
  else if (quality >= 35) type = 'terra-cotta'
  else if (quality >= 20) type = 'raku'

  return {
    quality, type, isWellPrepared, hasProperConsistency, hasNoAirBubbles,
    hasProperMoisture, hasImpurities, hasProperWedging, isWorkable,
    hasCorrectPlasticity, impurityCount,
  }
}

// ─── measureWheel ───────────────────────────────────────────────────────────

/**
 * Measure development velocity
 * @example
 * measureWheel(content) // WheelMeasure
 */
export function measureWheel(content: string): WheelMeasure {
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const asyncs = (content.match(ASYNC_RE) ?? []).length
  const vars = (content.match(VAR_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const totalFunctions = functions + arrows

  const isCentered = exports > 0 && totalFunctions > 0
  const hasSteadyRotation = totalFunctions > 1
  const hasProperSpeed = totalFunctions > 0 && totalFunctions <= 15
  const isBalanced = exports > 0 && imports > 0
  const hasWobble = vars > 0
  const hasVibration = anys > 0
  const hasGoodControl = totalFunctions > 0 && vars === 0
  const hasCentering = exports > 0
  const wobbleCount = vars + anys

  let speed = 15
  if (totalFunctions > 0) speed += 10
  if (isCentered) speed += 10
  if (hasSteadyRotation) speed += 10
  if (hasProperSpeed) speed += 10
  if (isBalanced) speed += 10
  if (hasGoodControl) speed += 10
  if (asyncs > 0) speed += 10
  if (classes > 0) speed += 10
  if (hasWobble) speed -= 10
  if (hasVibration) speed -= 5
  speed = Math.max(0, Math.min(100, speed))

  return {
    speed, isCentered, hasSteadyRotation, hasProperSpeed, isBalanced,
    hasWobble, hasVibration, hasGoodControl, hasCentering, wobbleCount,
  }
}

// ─── measureShaping ─────────────────────────────────────────────────────────

/**
 * Measure refactoring quality
 * @example
 * measureShaping(content) // ShapingMeasure
 */
export function measureShaping(content: string): ShapingMeasure {
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const ifs = (content.match(IF_RE) ?? []).length
  const elses = (content.match(ELSE_RE) ?? []).length
  const switches = (content.match(SWITCH_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const console = (content.match(CONSOLE_RE) ?? []).length
  const debuggers = (content.match(DEBUGGER_RE) ?? []).length
  const totalFunctions = functions + arrows

  const hasSymmetry = elses > 0 || switches > 0
  const hasEvenWalls = totalFunctions > 0 && totalFunctions <= 10
  const hasProperProportions = totalFunctions > 0 && ifs <= totalFunctions * 2
  const hasSmoothSurface = anys === 0 && console === 0 && debuggers === 0
  const hasTrimMarks = elses > 0 || switches > 0
  const crackingCount = anys + debuggers
  const hasCracking = crackingCount > 0
  const hasWarping = console > 0
  const hasCollapsing = debuggers > 0
  const trimMarkCount = elses + switches
  const isWellShaped = hasSmoothSurface && hasProperProportions

  let technique: ShapingTechnique = 'pinch'
  if (classes > 0 && totalFunctions > 5) technique = 'throwing'
  else if (classes > 0) technique = 'hand-building'
  else if (totalFunctions > 8) technique = 'slip-casting'
  else if (totalFunctions > 3) technique = 'coil'
  else if (totalFunctions > 0) technique = 'slab'

  let skill = 15
  if (totalFunctions > 0) skill += 10
  if (hasSymmetry) skill += 10
  if (hasEvenWalls) skill += 10
  if (hasProperProportions) skill += 10
  if (hasSmoothSurface) skill += 15
  if (hasTrimMarks) skill += 5
  if (classes > 0) skill += 10
  if (hasCracking) skill -= 5 * Math.min(crackingCount, 3)
  if (hasCollapsing) skill -= 5
  skill = Math.max(0, Math.min(100, skill))

  return {
    skill, technique, isWellShaped, hasSymmetry, hasEvenWalls,
    hasProperProportions, hasSmoothSurface, hasTrimMarks, hasCracking,
    hasWarping, hasCollapsing, crackingCount, trimMarkCount,
  }
}

// ─── measureGlaze ───────────────────────────────────────────────────────────

/**
 * Measure polish/completeness
 * @example
 * measureGlaze(content) // GlazeMeasure
 */
export function measureGlaze(content: string): GlazeMeasure {
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const comments = (content.match(COMMENT_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const totalFunctions = functions + arrows

  const isWellApplied = jsdoc > 0 && exports > 0
  const hasEvenCoating = jsdoc > 0 && (types > 0 || interfaces > 0)
  const hasNoRuns = comments <= totalFunctions * 3 || totalFunctions === 0
  const hasNoCrawling = jsdoc > 0 || totalFunctions === 0
  const hasNoPinholing = exports > 0
  const hasProperFiring = jsdoc > 0 && exports > 0 && (types > 0 || interfaces > 0)
  const hasFoodSafe = anys === 0
  const hasDecorativeFinish = jsdoc > 0
  const hasSignature = comments > 0
  const flawCount = (anys > 0 ? 1 : 0) + (!hasNoCrawling ? 1 : 0)

  let finish = 10
  if (isWellApplied) finish += 15
  if (hasEvenCoating) finish += 10
  if (hasNoRuns) finish += 10
  if (hasNoCrawling) finish += 10
  if (hasNoPinholing) finish += 10
  if (hasFoodSafe) finish += 10
  if (hasDecorativeFinish) finish += 10
  if (hasProperFiring) finish += 10
  if (hasSignature) finish += 5
  if (anys > 0) finish -= 10
  finish = Math.max(0, Math.min(100, finish))

  let type: GlazeType = 'unglazed'
  if (finish >= 85) type = 'celadon'
  else if (finish >= 70) type = 'crystalline'
  else if (finish >= 55) type = 'tenmoku'
  else if (finish >= 40) type = 'shino'
  else if (finish >= 25) type = 'raku'
  else if (finish >= 15) type = 'matte'

  return {
    finish, type, isWellApplied, hasEvenCoating, hasNoRuns, hasNoCrawling,
    hasNoPinholing, hasProperFiring, hasFoodSafe, hasDecorativeFinish,
    hasSignature, flawCount,
  }
}

// ─── measureKiln ────────────────────────────────────────────────────────────

/**
 * Measure production readiness
 * @example
 * measureKiln(content) // KilnMeasure
 */
export function measureKiln(content: string): KilnMeasure {
  const tries = (content.match(TRY_RE) ?? []).length
  const catches = (content.match(CATCH_RE) ?? []).length
  const finallys = (content.match(FINALLY_RE) ?? []).length
  const throws = (content.match(THROW_RE) ?? []).length
  const errors = (content.match(ERROR_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const debuggers = (content.match(DEBUGGER_RE) ?? []).length

  const isVitrified = tries > 0 && catches > 0
  const hasProperFiring = tries > 0
  const hasNoThermalShock = tries > 0 && catches > 0
  const hasNoDunting = tries > 0 && finallys > 0
  const hasNoBloating = debuggers === 0
  const hasNoShivering = anys === 0
  const hasKilnWash = tries > 0 && catches > 0
  const hasWitnessCone = tries > 0 && throws > 0
  const hasPyrometric = errors > 0

  let flawCount = 0
  if (!hasNoBloating) flawCount++
  if (!hasNoShivering) flawCount++
  if (debuggers > 0) flawCount++
  if (anys > 0) flawCount++

  let strength = 10
  if (hasProperFiring) strength += 15
  if (isVitrified) strength += 15
  if (hasNoDunting) strength += 10
  if (hasNoBloating) strength += 10
  if (hasNoShivering) strength += 10
  if (hasKilnWash) strength += 10
  if (hasWitnessCone) strength += 10
  if (hasPyrometric) strength += 5
  if (types > 0 || interfaces > 0) strength += 5
  if (flawCount > 0) strength -= 5 * Math.min(flawCount, 3)
  strength = Math.max(0, Math.min(100, strength))

  let temperature: KilnTemperature = 'raw'
  if (strength >= 85) temperature = 'high-fire'
  else if (strength >= 65) temperature = 'mid-range'
  else if (strength >= 45) temperature = 'low-fire'
  else if (strength >= 25) temperature = 'bisque'
  else if (strength >= 10) temperature = 'over-fired'

  return {
    strength, temperature, isVitrified, hasProperFiring, hasNoThermalShock,
    hasNoDunting, hasNoBloating, hasNoShivering, hasKilnWash, hasWitnessCone,
    hasPyrometric, flawCount,
  }
}

// ─── measureArtistry ────────────────────────────────────────────────────────

/**
 * Measure code elegance
 * @example
 * measureArtistry(content) // ArtistryMeasure
 */
export function measureArtistry(content: string): ArtistryMeasure {
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const arrows = (content.match(ARROW_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length
  const maps = (content.match(MAP_RE) ?? []).length
  const filters = (content.match(FILTER_RE) ?? []).length
  const reduces = (content.match(REDUCE_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const asyncs = (content.match(ASYNC_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const totalFunctions = functions + arrows

  const hasAestheticValue = totalFunctions > 0 && anys === 0
  const hasFunctionalBeauty = exports > 0 && totalFunctions > 0
  const hasArtisticExpression = maps > 0 || filters > 0 || reduces > 0
  const hasCulturalSignificance = jsdoc > 0 && (types > 0 || interfaces > 0)
  const hasProvenance = jsdoc > 0
  const hasUniqueCharacter = generics > 0 || asyncs > 0
  const hasHarmoniousForm = exports > 0 && imports > 0
  const expressionCount = maps + filters + reduces
  const isMuseumQuality = hasAestheticValue && hasFunctionalBeauty && hasCulturalSignificance

  let merit = 10
  if (hasAestheticValue) merit += 15
  if (hasFunctionalBeauty) merit += 10
  if (hasArtisticExpression) merit += 10
  if (hasCulturalSignificance) merit += 10
  if (hasProvenance) merit += 10
  if (hasUniqueCharacter) merit += 10
  if (hasHarmoniousForm) merit += 10
  if (isMuseumQuality) merit += 10
  if (classes > 0) merit += 5
  if (anys > 0) merit -= 10
  merit = Math.max(0, Math.min(100, merit))

  let style: ArtisticStyle = 'industrial'
  if (merit >= 80 && totalFunctions <= 5) style = 'minimalist'
  else if (merit >= 70) style = 'organic'
  else if (merit >= 55 && classes > 0) style = 'geometric'
  else if (merit >= 40 && totalFunctions > 8) style = 'baroque'
  else if (merit >= 25) style = 'rustic'

  return {
    merit, style, hasAestheticValue, hasFunctionalBeauty, hasArtisticExpression,
    hasCulturalSignificance, hasProvenance, hasUniqueCharacter, hasHarmoniousForm,
    isMuseumQuality, expressionCount,
  }
}

// ─── analyzePotteryPiece ────────────────────────────────────────────────────

/**
 * Analyze a single file as a pottery piece
 * @example
 * analyzePotteryPiece(content, 'file.ts') // PotteryPiece
 */
export function analyzePotteryPiece(content: string, filePath: string): PotteryPiece {
  const clay = measureClay(content)
  const wheel = measureWheel(content)
  const shaping = measureShaping(content)
  const glaze = measureGlaze(content)
  const kiln = measureKiln(content)
  const artistry = measureArtistry(content)

  const clayQuality = clay.quality
  const wheelSpeed = wheel.speed
  const shapingSkill = shaping.skill
  const glazeFinish = glaze.finish
  const kilnStrength = kiln.strength
  const artisticMerit = artistry.merit

  const qualityScore = Math.round(
    (clayQuality + wheelSpeed + shapingSkill + glazeFinish + kilnStrength + artisticMerit) / 6,
  )

  let condition: PieceCondition = 'cracked-pot'
  if (qualityScore >= 80) condition = 'museum-piece'
  else if (qualityScore >= 65) condition = 'gallery-quality'
  else if (qualityScore >= 45) condition = 'studio-pottery'
  else if (qualityScore >= 30) condition = 'production-ware'
  else if (qualityScore >= 15) condition = 'student-work'

  return {
    file: filePath, clayQuality, wheelSpeed, shapingSkill, glazeFinish,
    kilnStrength, artisticMerit, clay, wheel, shaping, glaze, kiln, artistry,
    condition, qualityScore,
  }
}

// ─── classifyStudioType ─────────────────────────────────────────────────────

/**
 * Classify studio by piece quality
 * @example
 * classifyStudioType(pieces) // StudioType
 */
export function classifyStudioType(pieces: PotteryPiece[]): StudioType {
  if (pieces.length === 0) return 'mud-pie'
  const avg = pieces.reduce((s, p) => s + p.qualityScore, 0) / pieces.length
  if (avg >= 75) return 'master-studio'
  if (avg >= 55) return 'production-pottery'
  if (avg >= 35) return 'teaching-studio'
  if (avg >= 20) return 'community-center'
  if (avg >= 10) return 'hobby-shed'
  return 'mud-pie'
}

// ─── classifyPotterGrade ────────────────────────────────────────────────────

/**
 * Classify overall potter grade
 * @example
 * classifyPotterGrade(90) // 'master-potter'
 */
export function classifyPotterGrade(avgCraft: number): PotterGrade {
  if (avgCraft >= 85) return 'master-potter'
  if (avgCraft >= 70) return 'artisan'
  if (avgCraft >= 50) return 'journeyman'
  if (avgCraft >= 30) return 'apprentice'
  if (avgCraft >= 15) return 'student'
  return 'toddler'
}

// ─── analyzePotteryStudio ───────────────────────────────────────────────────

/**
 * Analyze a directory of pieces as a pottery studio
 * @example
 * analyzePotteryStudio(pieces, 'src/') // PotteryStudio
 */
export function analyzePotteryStudio(pieces: PotteryPiece[], dirPath: string): PotteryStudio {
  if (pieces.length === 0) {
    return {
      directory: dirPath, pieces: [], avgClayQuality: 0, avgShapingSkill: 0,
      avgKilnStrength: 0, museumPieceCount: 0, crackedPotCount: 0,
      wellShapedCount: 0, vitrifiedCount: 0,
      studioType: 'mud-pie', condition: 'mud-hole',
    }
  }

  const avgClayQuality = Math.round(pieces.reduce((s, p) => s + p.clayQuality, 0) / pieces.length)
  const avgShapingSkill = Math.round(pieces.reduce((s, p) => s + p.shapingSkill, 0) / pieces.length)
  const avgKilnStrength = Math.round(pieces.reduce((s, p) => s + p.kilnStrength, 0) / pieces.length)
  const museumPieceCount = pieces.filter(p => p.condition === 'museum-piece').length
  const crackedPotCount = pieces.filter(p => p.condition === 'cracked-pot').length
  const wellShapedCount = pieces.filter(p => p.shaping.isWellShaped).length
  const vitrifiedCount = pieces.filter(p => p.kiln.isVitrified).length

  const studioType = classifyStudioType(pieces)

  const avg = pieces.reduce((s, p) => s + p.qualityScore, 0) / pieces.length
  let condition: StudioCondition = 'mud-hole'
  if (avg >= 75) condition = 'premier-gallery'
  else if (avg >= 55) condition = 'fine-craft'
  else if (avg >= 35) condition = 'artisan-workshop'
  else if (avg >= 20) condition = 'craft-fair'
  else if (avg >= 10) condition = 'beginner-class'

  return {
    directory: dirPath, pieces, avgClayQuality, avgShapingSkill, avgKilnStrength,
    museumPieceCount, crackedPotCount, wellShapedCount, vitrifiedCount,
    studioType, condition,
  }
}

// ─── generateRecommendations ────────────────────────────────────────────────

/**
 * Generate recommendations for the pottery
 * @example
 * generateRecommendations(pieces, studios, kiln, stats) // string[]
 */
export function generateRecommendations(
  _pieces: PotteryPiece[],
  _studios: PotteryStudio[],
  kiln: PotteryWheelResult['kiln'],
  stats: PotteryWheelStats,
): string[] {
  const recs: string[] = []

  if (stats.crackedPotCount > 0) {
    recs.push(`${stats.crackedPotCount} piece(s) are cracked pots — major restructuring needed`)
  }
  if (stats.hasImpuritiesCount > 0) {
    recs.push(`${stats.hasImpuritiesCount} piece(s) have impurities — remove any/debugger/TODO`)
  }
  if (stats.hasCrackingCount > 0) {
    recs.push(`${stats.hasCrackingCount} piece(s) have cracking — fix type safety issues`)
  }
  if (stats.hasWobbleCount > 0) {
    recs.push(`${stats.hasWobbleCount} piece(s) wobble on the wheel — replace var with const/let`)
  }
  if (stats.avgKilnStrength < 30) {
    recs.push('Kiln temperature too low — add try/catch error handling')
  }
  if (stats.avgGlazeFinish < 30) {
    recs.push('Glaze not applied — add JSDoc documentation and type exports')
  }
  if (stats.avgClayQuality < 30) {
    recs.push('Clay quality poor — improve code structure with types and interfaces')
  }
  if (stats.avgShapingSkill < 30) {
    recs.push('Shaping needs work — balance branches and reduce complexity')
  }
  if (stats.avgArtisticMerit < 30) {
    recs.push('Artistic merit low — use functional patterns and add documentation')
  }
  if (!kiln.isWellFired) {
    recs.push('Kiln under-fired — comprehensive quality improvements recommended')
  }
  if (kiln.isWellFired && stats.overallCraftsmanship >= 70) {
    recs.push('Pottery well-crafted — maintain current quality standards')
  }
  if (stats.overallCraftsmanship >= 85) {
    recs.push('Masterful work — document patterns for team learning')
  }

  if (recs.length === 0) {
    recs.push('All pieces beautifully crafted')
  }

  return Array.from(new Set(recs))
}

// ─── buildPotteryWheelResult ────────────────────────────────────────────────

/**
 * Build the complete pottery wheel analysis result
 * @example
 * buildPotteryWheelResult(files, contents, {}) // PotteryWheelResult
 */
export function buildPotteryWheelResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): PotteryWheelResult {
  const pieces = files.map((file, i) => analyzePotteryPiece(contents[i] ?? '', file))

  const dirMap = new Map<string, PotteryPiece[]>()
  for (const piece of pieces) {
    const dir = piece.file.includes('/') ? piece.file.substring(0, piece.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(piece)
    } else {
      dirMap.set(dir, [piece])
    }
  }

  const studios = Array.from(dirMap.entries()).map(([dir, pcs]) =>
    analyzePotteryStudio(pcs, dir),
  )

  const avgClayQuality = pieces.length > 0
    ? Math.round(pieces.reduce((s, p) => s + p.clayQuality, 0) / pieces.length) : 0
  const avgWheelSpeed = pieces.length > 0
    ? Math.round(pieces.reduce((s, p) => s + p.wheelSpeed, 0) / pieces.length) : 0
  const avgShapingSkill = pieces.length > 0
    ? Math.round(pieces.reduce((s, p) => s + p.shapingSkill, 0) / pieces.length) : 0
  const avgGlazeFinish = pieces.length > 0
    ? Math.round(pieces.reduce((s, p) => s + p.glazeFinish, 0) / pieces.length) : 0
  const avgKilnStrength = pieces.length > 0
    ? Math.round(pieces.reduce((s, p) => s + p.kilnStrength, 0) / pieces.length) : 0
  const avgArtisticMerit = pieces.length > 0
    ? Math.round(pieces.reduce((s, p) => s + p.artisticMerit, 0) / pieces.length) : 0

  const overallCraftsmanship = Math.round(
    (avgClayQuality + avgWheelSpeed + avgShapingSkill + avgGlazeFinish + avgKilnStrength + avgArtisticMerit) / 6,
  )

  const kilnResult: PotteryWheelResult['kiln'] = {
    avgClayQuality, avgShapingSkill, avgKilnStrength,
    isWellFired: overallCraftsmanship >= 50,
    overallCraftsmanship,
  }

  const conditionCounts = {
    museumPiece: pieces.filter(p => p.condition === 'museum-piece').length,
    galleryQuality: pieces.filter(p => p.condition === 'gallery-quality').length,
    studioPottery: pieces.filter(p => p.condition === 'studio-pottery').length,
    productionWare: pieces.filter(p => p.condition === 'production-ware').length,
    studentWork: pieces.filter(p => p.condition === 'student-work').length,
    crackedPot: pieces.filter(p => p.condition === 'cracked-pot').length,
  }

  const bestPiece = pieces.length > 0
    ? pieces.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const bestClay = pieces.length > 0
    ? pieces.reduce((best, p) => p.clayQuality > best.clayQuality ? p : best).file : ''
  const bestShaped = pieces.length > 0
    ? pieces.reduce((best, p) => p.shapingSkill > best.shapingSkill ? p : best).file : ''
  const bestGlazed = pieces.length > 0
    ? pieces.reduce((best, p) => p.glazeFinish > best.glazeFinish ? p : best).file : ''
  const strongest = pieces.length > 0
    ? pieces.reduce((best, p) => p.kilnStrength > best.kilnStrength ? p : best).file : ''

  const stats: PotteryWheelStats = {
    totalFiles: files.length,
    totalStudios: studios.length,
    avgClayQuality, avgWheelSpeed, avgShapingSkill, avgGlazeFinish,
    avgKilnStrength, avgArtisticMerit,
    museumPieceCount: conditionCounts.museumPiece,
    galleryQualityCount: conditionCounts.galleryQuality,
    studioPotteryCount: conditionCounts.studioPottery,
    productionWareCount: conditionCounts.productionWare,
    studentWorkCount: conditionCounts.studentWork,
    crackedPotCount: conditionCounts.crackedPot,
    isWellPreparedCount: pieces.filter(p => p.clay.isWellPrepared).length,
    hasImpuritiesCount: pieces.filter(p => p.clay.hasImpurities).length,
    isCenteredCount: pieces.filter(p => p.wheel.isCentered).length,
    hasWobbleCount: pieces.filter(p => p.wheel.hasWobble).length,
    isWellShapedCount: pieces.filter(p => p.shaping.isWellShaped).length,
    hasCrackingCount: pieces.filter(p => p.shaping.hasCracking).length,
    isWellAppliedCount: pieces.filter(p => p.glaze.isWellApplied).length,
    isVitrifiedCount: pieces.filter(p => p.kiln.isVitrified).length,
    hasProperFiringCount: pieces.filter(p => p.kiln.hasProperFiring).length,
    hasAestheticValueCount: pieces.filter(p => p.artistry.hasAestheticValue).length,
    isMuseumQualityCount: pieces.filter(p => p.artistry.isMuseumQuality).length,
    overallCraftsmanship,
    potterGrade: classifyPotterGrade(overallCraftsmanship),
    bestPiece, bestClay, bestShaped, bestGlazed, strongest,
  }

  const recommendations = generateRecommendations(pieces, studios, kilnResult, stats)

  return { pieces, studios, kiln: kilnResult, stats, recommendations }
}
