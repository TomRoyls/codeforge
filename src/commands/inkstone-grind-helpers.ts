// ─── Interfaces ──────────────────────────────────────────

export interface InkMeasure {
  density: number
  quality: 'imperial-ink' | 'premium-sumi' | 'good-ink' | 'dilute-ink' | 'watery' | 'dust'
  hasHighDensity: boolean
  hasRichPigment: boolean
  hasProperViscosity: boolean
  hasNoClumping: boolean
  hasEvenConsistency: boolean
  hasNoGrittiness: boolean
  hasDeep: boolean
  hasNoFading: boolean
  hasSaturated: boolean
  hasNoThinSpots: boolean
  clumpingCount: number
  fadingCount: number
}

export interface GrindingMeasure {
  discipline: number
  technique: 'master-grinding' | 'proper-circular' | 'steady-pressure' | 'uneven' | 'rushed' | 'haphazard'
  hasHighDiscipline: boolean
  hasEvenPressure: boolean
  hasProperRhythm: boolean
  hasNoSkipping: boolean
  hasConsistent: boolean
  hasNoHaste: boolean
  hasPatient: boolean
  hasNoSloppiness: boolean
  hasThorough: boolean
  hasNoNegligence: boolean
  skippingCount: number
  sloppinessCount: number
}

export interface StrokeMeasure {
  quality: number
  calligraphy: 'masterwork' | 'elegant-stroke' | 'skilled-hand' | 'amateur' | 'clumsy' | 'scribble'
  hasHighQuality: boolean
  hasProperForm: boolean
  hasFlowingStrokes: boolean
  hasNoJerkyMotion: boolean
  hasConfident: boolean
  hasNoHesitation: boolean
  hasProperWeight: boolean
  hasNoOverworking: boolean
  hasExpressive: boolean
  hasNoSmudging: boolean
  jerkyCount: number
  overworkingCount: number
}

export interface BrushMeasure {
  preparation: number
  condition: 'master-brush' | 'well-prepared' | 'properly-loaded' | 'underprepared' | 'worn' | 'damaged'
  hasHighPreparation: boolean
  hasProperLoading: boolean
  hasCleanTip: boolean
  hasNoSplaying: boolean
  hasResponsive: boolean
  hasNoStiffness: boolean
  hasProperSnap: boolean
  hasNoLimpness: boolean
  hasWellMaintained: boolean
  hasNoNeglect: boolean
  splayingCount: number
  stiffnessCount: number
}

export interface PaperMeasure {
  compatibility: number
  quality: 'xuan-paper' | 'quality-washi' | 'good-paper' | 'standard-paper' | 'rough-paper' | 'newsprint'
  hasHighCompatibility: boolean
  hasProperAbsorption: boolean
  hasNoBleeding: boolean
  hasGoodTexture: boolean
  hasNoTearing: boolean
  hasSmoothSurface: boolean
  hasNoWrinkling: boolean
  hasProperWeight: boolean
  hasArchival: boolean
  hasNoDegradation: boolean
  bleedingCount: number
  wrinklingCount: number
}

export interface MasteryMeasure {
  level: number
  rank: 'calligraphy-master' | 'skilled-artist' | 'practitioner' | 'student' | 'beginner' | 'untrained'
  hasHighLevel: boolean
  hasBalancedComposition: boolean
  hasProperSpacing: boolean
  hasNoCarelessness: boolean
  hasHarmonious: boolean
  hasNoChaos: boolean
  hasRefined: boolean
  hasNoRoughness: boolean
  hasIntentional: boolean
  hasNoAccidental: boolean
  carelessnessCount: number
  roughnessCount: number
}

export interface InkGrinding {
  file: string
  inkDensity: number
  grindingDiscipline: number
  strokeQuality: number
  brushPreparation: number
  paperCompatibility: number
  masteryLevel: number
  ink: InkMeasure
  grinding: GrindingMeasure
  stroke: StrokeMeasure
  brush: BrushMeasure
  paper: PaperMeasure
  mastery: MasteryMeasure
  condition: 'masterpiece-scroll' | 'gallery-piece' | 'practice-sheet' | 'rough-draft' | 'scratch-paper' | 'waste'
  qualityScore: number
}

export interface StudioShelf {
  directory: string
  grindings: InkGrinding[]
  avgInk: number
  avgDiscipline: number
  avgMastery: number
  masterpieceCount: number
  wasteCount: number
  disciplinedCount: number
  skilledCount: number
  shelfType: 'master-studio' | 'artist-desk' | 'student-bench' | 'practice-room' | 'storage' | 'empty'
  condition: 'calligraphy-hall' | 'artist-studio' | 'practice-room' | 'drafting-table' | 'supply-closet' | 'empty'
}

export interface InkstoneGrindResult {
  grindings: InkGrinding[]
  shelves: StudioShelf[]
  studio: {
    avgInk: number
    avgDiscipline: number
    avgMastery: number
    isRefined: boolean
    overallRefinement: number
  }
  stats: {
    totalFiles: number
    totalShelves: number
    avgInkDensity: number
    avgGrindingDiscipline: number
    avgStrokeQuality: number
    avgBrushPreparation: number
    avgPaperCompatibility: number
    avgMasteryLevel: number
    masterpieceScrollCount: number
    galleryPieceCount: number
    practiceSheetCount: number
    roughDraftCount: number
    scratchPaperCount: number
    wasteCount: number
    hasHighDensityCount: number
    hasHighDisciplineCount: number
    hasHighQualityCount: number
    hasHighPreparationCount: number
    hasHighCompatibilityCount: number
    hasHighLevelCount: number
    overallRefinement: number
    artistGrade: 'calligraphy-sage' | 'master-calligrapher' | 'skilled-artist' | 'student' | 'novice' | 'child'
    bestGrinding: string
    densest: string
    mostDisciplined: string
    bestStrokes: string
    bestPrepared: string
    bestIntegrated: string
  }
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────

const INTERFACE_RE = /\binterface\b/
const CLASS_RE = /\bclass\b/
const TYPE_RE = /\btype\b/
const EXPORT_RE = /\bexport\b/
const IMPORT_RE = /\bimport\b/
const FUNCTION_RE = /\bfunction\b/
const ARROW_RE = /=>/
const ASYNC_RE = /\basync\b/
const AWAIT_RE = /\bawait\b/
const TRY_RE = /\btry\b/
const CATCH_RE = /\bcatch\b/
const RETURN_RE = /\breturn\b/
const THROW_RE = /\bthrow\b/
const GENERIC_RE = /<[A-Z]\w*[,>]/
const OPTIONAL_RE = /\?\s*:/
const NESTED_TERNARY_RE = /\?.*:.*\?.*:/
const CONSOLE_RE = /\bconsole\.\w+/g
const ANY_RE = /:\s*any\b/g
const EVAL_RE = /\beval\s*\(/g
const TODO_RE = /\bTODO\b/gi
const HACK_RE = /\bHACK\b/gi
const FIXME_RE = /\bFIXME\b/gi
const DEPRECATED_RE = /@deprecated/g
const DOC_COMMENT_RE = /\/\*\*[\s\S]*?\*\//g
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g

// ─── measureInk ──────────────────────────────────────────

/** @example measureInk(content) returns InkMeasure */
export function measureInk(content: string): InkMeasure {
  let score = 0

  const hasRichPigment = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasProperViscosity = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const clumpingCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoClumping = clumpingCount === 0
  const hasEvenConsistency = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const hasNoGrittiness = !NESTED_TERNARY_RE.test(content)
  const hasDeep = (content.match(DOC_COMMENT_RE) || []).length > 0
  const fadingCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoFading = fadingCount === 0
  const hasSaturated = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoThinSpots = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasRichPigment) score += 12
  if (hasProperViscosity) score += 10
  if (hasNoClumping) score += 12
  if (hasEvenConsistency) score += 10
  if (hasNoGrittiness) score += 10
  if (hasDeep) score += 10
  if (hasNoFading) score += 11
  if (hasSaturated) score += 10
  if (hasNoThinSpots) score += 10

  const density = Math.min(100, Math.max(0, score))
  const hasHighDensity = density >= 70

  let quality: InkMeasure['quality'] = 'dust'
  if (hasHighDensity && hasNoClumping && hasRichPigment && hasDeep) quality = 'imperial-ink'
  else if (hasHighDensity && hasNoClumping) quality = 'premium-sumi'
  else if (hasHighDensity) quality = 'good-ink'
  else if (hasRichPigment && hasProperViscosity) quality = 'dilute-ink'
  else if (density > 30) quality = 'watery'

  return {
    density, quality, hasHighDensity, hasRichPigment, hasProperViscosity,
    hasNoClumping, hasEvenConsistency, hasNoGrittiness, hasDeep,
    hasNoFading, hasSaturated, hasNoThinSpots, clumpingCount, fadingCount,
  }
}

// ─── measureGrinding ─────────────────────────────────────

/** @example measureGrinding(content) returns GrindingMeasure */
export function measureGrinding(content: string): GrindingMeasure {
  let score = 0

  const hasEvenPressure = INTERFACE_RE.test(content) && TYPE_RE.test(content) && CLASS_RE.test(content)
  const hasProperRhythm = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const skippingCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoSkipping = skippingCount === 0
  const hasConsistent = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoHaste = !NESTED_TERNARY_RE.test(content)
  const hasPatient = TRY_RE.test(content) && CATCH_RE.test(content)
  const sloppinessCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoSloppiness = sloppinessCount === 0
  const hasThorough = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoNegligence = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasEvenPressure) score += 12
  if (hasProperRhythm) score += 10
  if (hasNoSkipping) score += 12
  if (hasConsistent) score += 10
  if (hasNoHaste) score += 10
  if (hasPatient) score += 11
  if (hasNoSloppiness) score += 10
  if (hasThorough) score += 10
  if (hasNoNegligence) score += 10

  const discipline = Math.min(100, Math.max(0, score))
  const hasHighDiscipline = discipline >= 70

  let technique: GrindingMeasure['technique'] = 'haphazard'
  if (hasHighDiscipline && hasNoSkipping && hasEvenPressure && hasConsistent) technique = 'master-grinding'
  else if (hasHighDiscipline && hasNoSkipping) technique = 'proper-circular'
  else if (hasHighDiscipline) technique = 'steady-pressure'
  else if (hasEvenPressure && hasProperRhythm) technique = 'uneven'
  else if (discipline > 30) technique = 'rushed'

  return {
    discipline, technique, hasHighDiscipline, hasEvenPressure, hasProperRhythm,
    hasNoSkipping, hasConsistent, hasNoHaste, hasPatient, hasNoSloppiness,
    hasThorough, hasNoNegligence, skippingCount, sloppinessCount,
  }
}

// ─── measureStroke ───────────────────────────────────────

/** @example measureStroke(content) returns StrokeMeasure */
export function measureStroke(content: string): StrokeMeasure {
  let score = 0

  const hasProperForm = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const hasFlowingStrokes = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const jerkyCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoJerkyMotion = jerkyCount === 0
  const hasConfident = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoHesitation = !NESTED_TERNARY_RE.test(content)
  const hasProperWeight = (content.match(DOC_COMMENT_RE) || []).length > 0
  const overworkingCount = (content.match(CONSOLE_RE) || []).length
  const hasNoOverworking = overworkingCount === 0
  const hasExpressive = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoSmudging = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperForm) score += 12
  if (hasFlowingStrokes) score += 10
  if (hasNoJerkyMotion) score += 12
  if (hasConfident) score += 10
  if (hasNoHesitation) score += 10
  if (hasProperWeight) score += 10
  if (hasNoOverworking) score += 10
  if (hasExpressive) score += 11
  if (hasNoSmudging) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let calligraphy: StrokeMeasure['calligraphy'] = 'scribble'
  if (hasHighQuality && hasNoJerkyMotion && hasProperForm && hasProperWeight) calligraphy = 'masterwork'
  else if (hasHighQuality && hasNoJerkyMotion) calligraphy = 'elegant-stroke'
  else if (hasHighQuality) calligraphy = 'skilled-hand'
  else if (hasProperForm && hasFlowingStrokes) calligraphy = 'amateur'
  else if (quality > 30) calligraphy = 'clumsy'

  return {
    quality, calligraphy, hasHighQuality, hasProperForm, hasFlowingStrokes,
    hasNoJerkyMotion, hasConfident, hasNoHesitation, hasProperWeight,
    hasNoOverworking, hasExpressive, hasNoSmudging, jerkyCount, overworkingCount,
  }
}

// ─── measureBrush ────────────────────────────────────────

/** @example measureBrush(content) returns BrushMeasure */
export function measureBrush(content: string): BrushMeasure {
  let score = 0

  const hasProperLoading = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasCleanTip = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const splayingCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoSplaying = splayingCount === 0
  const hasResponsive = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const stiffnessCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoStiffness = stiffnessCount === 0
  const hasProperSnap = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoLimpness = !NESTED_TERNARY_RE.test(content)
  const hasWellMaintained = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoNeglect = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperLoading) score += 12
  if (hasCleanTip) score += 10
  if (hasNoSplaying) score += 12
  if (hasResponsive) score += 10
  if (hasNoStiffness) score += 10
  if (hasProperSnap) score += 11
  if (hasNoLimpness) score += 10
  if (hasWellMaintained) score += 10
  if (hasNoNeglect) score += 10

  const preparation = Math.min(100, Math.max(0, score))
  const hasHighPreparation = preparation >= 70

  let condition: BrushMeasure['condition'] = 'damaged'
  if (hasHighPreparation && hasNoSplaying && hasProperLoading && hasWellMaintained) condition = 'master-brush'
  else if (hasHighPreparation && hasNoSplaying) condition = 'well-prepared'
  else if (hasHighPreparation) condition = 'properly-loaded'
  else if (hasProperLoading && hasCleanTip) condition = 'underprepared'
  else if (preparation > 30) condition = 'worn'

  return {
    preparation, condition, hasHighPreparation, hasProperLoading, hasCleanTip,
    hasNoSplaying, hasResponsive, hasNoStiffness, hasProperSnap, hasNoLimpness,
    hasWellMaintained, hasNoNeglect, splayingCount, stiffnessCount,
  }
}

// ─── measurePaper ────────────────────────────────────────

/** @example measurePaper(content) returns PaperMeasure */
export function measurePaper(content: string): PaperMeasure {
  let score = 0

  const hasProperAbsorption = INTERFACE_RE.test(content) && EXPORT_RE.test(content)
  const bleedingCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoBleeding = bleedingCount === 0
  const hasGoodTexture = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoTearing = !NESTED_TERNARY_RE.test(content)
  const hasSmoothSurface = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const wrinklingCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoWrinkling = wrinklingCount === 0
  const hasProperWeight = TYPE_RE.test(content) && CLASS_RE.test(content)
  const hasArchival = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoDegradation = (content.match(HACK_RE) || []).length === 0 && (content.match(DEPRECATED_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperAbsorption) score += 12
  if (hasNoBleeding) score += 12
  if (hasGoodTexture) score += 10
  if (hasNoTearing) score += 10
  if (hasSmoothSurface) score += 10
  if (hasNoWrinkling) score += 11
  if (hasProperWeight) score += 10
  if (hasArchival) score += 10
  if (hasNoDegradation) score += 10

  const compatibility = Math.min(100, Math.max(0, score))
  const hasHighCompatibility = compatibility >= 70

  let quality: PaperMeasure['quality'] = 'newsprint'
  if (hasHighCompatibility && hasNoBleeding && hasGoodTexture && hasNoWrinkling) quality = 'xuan-paper'
  else if (hasHighCompatibility && hasNoBleeding) quality = 'quality-washi'
  else if (hasHighCompatibility) quality = 'good-paper'
  else if (hasProperAbsorption && hasSmoothSurface) quality = 'standard-paper'
  else if (compatibility > 30) quality = 'rough-paper'

  return {
    compatibility, quality, hasHighCompatibility, hasProperAbsorption,
    hasNoBleeding, hasGoodTexture, hasNoTearing, hasSmoothSurface,
    hasNoWrinkling, hasProperWeight, hasArchival, hasNoDegradation,
    bleedingCount, wrinklingCount,
  }
}

// ─── measureMastery ──────────────────────────────────────

/** @example measureMastery(content) returns MasteryMeasure */
export function measureMastery(content: string): MasteryMeasure {
  let score = 0

  const hasBalancedComposition = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const hasProperSpacing = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const carelessnessCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoCarelessness = carelessnessCount === 0
  const hasHarmonious = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoChaos = !NESTED_TERNARY_RE.test(content)
  const hasRefined = (content.match(CONSOLE_RE) || []).length === 0
  const roughnessCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoRoughness = roughnessCount === 0
  const hasIntentional = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoAccidental = (content.match(TODO_RE) || []).length === 0 && (content.match(FIXME_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasBalancedComposition) score += 12
  if (hasProperSpacing) score += 10
  if (hasNoCarelessness) score += 12
  if (hasHarmonious) score += 10
  if (hasNoChaos) score += 10
  if (hasRefined) score += 10
  if (hasNoRoughness) score += 11
  if (hasIntentional) score += 10
  if (hasNoAccidental) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let rank: MasteryMeasure['rank'] = 'untrained'
  if (hasHighLevel && hasNoCarelessness && hasBalancedComposition && hasHarmonious) rank = 'calligraphy-master'
  else if (hasHighLevel && hasNoCarelessness) rank = 'skilled-artist'
  else if (hasHighLevel) rank = 'practitioner'
  else if (hasBalancedComposition && hasProperSpacing) rank = 'student'
  else if (level > 30) rank = 'beginner'

  return {
    level, rank, hasHighLevel, hasBalancedComposition, hasProperSpacing,
    hasNoCarelessness, hasHarmonious, hasNoChaos, hasRefined, hasNoRoughness,
    hasIntentional, hasNoAccidental, carelessnessCount, roughnessCount,
  }
}

// ─── classifyCondition ───────────────────────────────────

/** @example classifyCondition(grinding) returns condition string */
export function classifyCondition(grinding: InkGrinding): InkGrinding['condition'] {
  const { qualityScore } = grinding
  if (qualityScore >= 80) return 'masterpiece-scroll'
  if (qualityScore >= 65) return 'gallery-piece'
  if (qualityScore >= 50) return 'practice-sheet'
  if (qualityScore >= 35) return 'rough-draft'
  if (qualityScore >= 20) return 'scratch-paper'
  return 'waste'
}

// ─── analyzeInkGrinding ──────────────────────────────────

/** @example analyzeInkGrinding(content, filePath) returns InkGrinding */
export function analyzeInkGrinding(content: string, filePath: string): InkGrinding {
  const ink = measureInk(content)
  const grinding = measureGrinding(content)
  const stroke = measureStroke(content)
  const brush = measureBrush(content)
  const paper = measurePaper(content)
  const mastery = measureMastery(content)

  const inkDensity = ink.density
  const grindingDiscipline = grinding.discipline
  const strokeQuality = stroke.quality
  const brushPreparation = brush.preparation
  const paperCompatibility = paper.compatibility
  const masteryLevel = mastery.level

  const qualityScore = Math.round(
    inkDensity * 0.15 +
    grindingDiscipline * 0.15 +
    strokeQuality * 0.2 +
    brushPreparation * 0.15 +
    paperCompatibility * 0.15 +
    masteryLevel * 0.2,
  )

  const result: InkGrinding = {
    file: filePath,
    inkDensity, grindingDiscipline, strokeQuality,
    brushPreparation, paperCompatibility, masteryLevel,
    ink, grinding, stroke, brush, paper, mastery,
    qualityScore,
    condition: 'waste',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── classifyShelfType ───────────────────────────────────

/** @example classifyShelfType(grindings) returns shelf type */
export function classifyShelfType(grindings: InkGrinding[]): StudioShelf['shelfType'] {
  if (grindings.length === 0) return 'empty'
  const avgScore = grindings.reduce((s, g) => s + g.qualityScore, 0) / grindings.length
  const masterCnt = grindings.filter((g) => g.condition === 'masterpiece-scroll').length
  if (avgScore >= 75 && masterCnt >= Math.ceil(grindings.length * 0.3)) return 'master-studio'
  if (avgScore >= 60) return 'artist-desk'
  if (avgScore >= 45) return 'student-bench'
  if (avgScore >= 30) return 'practice-room'
  if (avgScore >= 15) return 'storage'
  return 'empty'
}

// ─── analyzeStudioShelf ──────────────────────────────────

/** @example analyzeStudioShelf(grindings, dirPath) returns StudioShelf */
export function analyzeStudioShelf(grindings: InkGrinding[], dirPath: string): StudioShelf {
  if (grindings.length === 0) {
    return {
      directory: dirPath, grindings: [], avgInk: 0, avgDiscipline: 0,
      avgMastery: 0, masterpieceCount: 0, wasteCount: 0, disciplinedCount: 0,
      skilledCount: 0, shelfType: 'empty', condition: 'empty',
    }
  }

  const avgInk = Math.round(grindings.reduce((s, g) => s + g.inkDensity, 0) / grindings.length)
  const avgDiscipline = Math.round(grindings.reduce((s, g) => s + g.grindingDiscipline, 0) / grindings.length)
  const avgMastery = Math.round(grindings.reduce((s, g) => s + g.masteryLevel, 0) / grindings.length)
  const masterpieceCount = grindings.filter((g) => g.condition === 'masterpiece-scroll').length
  const wasteCount = grindings.filter((g) => g.condition === 'waste').length
  const disciplinedCount = grindings.filter((g) => g.grinding.hasHighDiscipline).length
  const skilledCount = grindings.filter((g) => g.stroke.hasHighQuality).length

  const shelfType = classifyShelfType(grindings)
  const avgScore = grindings.reduce((s, g) => s + g.qualityScore, 0) / grindings.length
  let condition: StudioShelf['condition'] = 'empty'
  if (avgScore >= 75) condition = 'calligraphy-hall'
  else if (avgScore >= 60) condition = 'artist-studio'
  else if (avgScore >= 45) condition = 'practice-room'
  else if (avgScore >= 30) condition = 'drafting-table'
  else if (avgScore >= 15) condition = 'supply-closet'

  return {
    directory: dirPath, grindings, avgInk, avgDiscipline, avgMastery,
    masterpieceCount, wasteCount, disciplinedCount, skilledCount,
    shelfType, condition,
  }
}

// ─── classifyArtistGrade ─────────────────────────────────

/** @example classifyArtistGrade(avgRefinement) returns grade */
export function classifyArtistGrade(avgRefinement: number): InkstoneGrindResult['stats']['artistGrade'] {
  if (avgRefinement >= 80) return 'calligraphy-sage'
  if (avgRefinement >= 65) return 'master-calligrapher'
  if (avgRefinement >= 50) return 'skilled-artist'
  if (avgRefinement >= 35) return 'student'
  if (avgRefinement >= 20) return 'novice'
  return 'child'
}

// ─── generateRecommendations ─────────────────────────────

/** @example generateRecommendations(grindings, shelves, studio, stats) returns string[] */
export function generateRecommendations(
  grindings: InkGrinding[],
  shelves: StudioShelf[],
  studio: InkstoneGrindResult['studio'],
  stats: InkstoneGrindResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgInkDensity < 50) recs.push('Increase ink density — add interfaces and types for richer code substance')
  if (stats.avgGrindingDiscipline < 50) recs.push('Improve grinding discipline — organize imports/exports for consistent code')
  if (stats.avgStrokeQuality < 50) recs.push('Enhance stroke quality — reduce any/eval for cleaner code expression')
  if (stats.avgBrushPreparation < 50) recs.push('Improve brush preparation — add async/await and error handling for readiness')
  if (stats.avgPaperCompatibility < 50) recs.push('Boost paper compatibility — add documentation for better code integration')
  if (stats.avgMasteryLevel < 50) recs.push('Raise mastery level — reduce console usage and add proper error handling')
  if (stats.wasteCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of grindings are waste — consider major refactoring')
  if (stats.scratchPaperCount > 0) recs.push('Warning: scratch-paper grindings detected — these files need refinement')
  if (studio.overallRefinement < 40) recs.push('Overall refinement is critically low — establish an inkstone practice routine')
  if (shelves.length > 0 && shelves.every((s) => s.condition === 'empty')) recs.push('All shelves are empty — your codebase needs fundamental calligraphy training')

  if (grindings.length > 0) {
    const highClumping = grindings.filter((g) => g.ink.clumpingCount > 2)
    if (highClumping.length > grindings.length * 0.5) recs.push('Over 50% of grindings have high clumping — reduce any/eval usage')
  }

  return recs
}

// ─── buildInkstoneGrindResult ────────────────────────────

/** @example buildInkstoneGrindResult(files, contents, options) returns full result */
export function buildInkstoneGrindResult(files: string[], contents: string[], _options?: Record<string, unknown>): InkstoneGrindResult {
  const grindings = files.map((file, i) => analyzeInkGrinding(contents[i] ?? '', file))

  const shelfMap = new Map<string, InkGrinding[]>()
  grindings.forEach((grinding) => {
    const parts = grinding.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = shelfMap.get(dir)
    if (existing) existing.push(grinding)
    else shelfMap.set(dir, [grinding])
  })

  const shelves = Array.from(shelfMap.entries()).map(([dir, gs]) => analyzeStudioShelf(gs, dir))

  const avgInkDensity = grindings.length > 0 ? Math.round(grindings.reduce((s, g) => s + g.inkDensity, 0) / grindings.length) : 0
  const avgGrindingDiscipline = grindings.length > 0 ? Math.round(grindings.reduce((s, g) => s + g.grindingDiscipline, 0) / grindings.length) : 0
  const avgStrokeQuality = grindings.length > 0 ? Math.round(grindings.reduce((s, g) => s + g.strokeQuality, 0) / grindings.length) : 0
  const avgBrushPreparation = grindings.length > 0 ? Math.round(grindings.reduce((s, g) => s + g.brushPreparation, 0) / grindings.length) : 0
  const avgPaperCompatibility = grindings.length > 0 ? Math.round(grindings.reduce((s, g) => s + g.paperCompatibility, 0) / grindings.length) : 0
  const avgMasteryLevel = grindings.length > 0 ? Math.round(grindings.reduce((s, g) => s + g.masteryLevel, 0) / grindings.length) : 0

  const overallRefinement = Math.round(
    avgInkDensity * 0.15 +
    avgGrindingDiscipline * 0.15 +
    avgStrokeQuality * 0.2 +
    avgBrushPreparation * 0.15 +
    avgPaperCompatibility * 0.15 +
    avgMasteryLevel * 0.2,
  )

  const studio = {
    avgInk: avgInkDensity,
    avgDiscipline: avgGrindingDiscipline,
    avgMastery: avgMasteryLevel,
    isRefined: overallRefinement >= 60,
    overallRefinement,
  }

  const stats = {
    totalFiles: files.length,
    totalShelves: shelves.length,
    avgInkDensity,
    avgGrindingDiscipline,
    avgStrokeQuality,
    avgBrushPreparation,
    avgPaperCompatibility,
    avgMasteryLevel,
    masterpieceScrollCount: grindings.filter((g) => g.condition === 'masterpiece-scroll').length,
    galleryPieceCount: grindings.filter((g) => g.condition === 'gallery-piece').length,
    practiceSheetCount: grindings.filter((g) => g.condition === 'practice-sheet').length,
    roughDraftCount: grindings.filter((g) => g.condition === 'rough-draft').length,
    scratchPaperCount: grindings.filter((g) => g.condition === 'scratch-paper').length,
    wasteCount: grindings.filter((g) => g.condition === 'waste').length,
    hasHighDensityCount: grindings.filter((g) => g.ink.hasHighDensity).length,
    hasHighDisciplineCount: grindings.filter((g) => g.grinding.hasHighDiscipline).length,
    hasHighQualityCount: grindings.filter((g) => g.stroke.hasHighQuality).length,
    hasHighPreparationCount: grindings.filter((g) => g.brush.hasHighPreparation).length,
    hasHighCompatibilityCount: grindings.filter((g) => g.paper.hasHighCompatibility).length,
    hasHighLevelCount: grindings.filter((g) => g.mastery.hasHighLevel).length,
    overallRefinement,
    artistGrade: classifyArtistGrade(overallRefinement),
    bestGrinding: '',
    densest: '',
    mostDisciplined: '',
    bestStrokes: '',
    bestPrepared: '',
    bestIntegrated: '',
  }

  if (grindings.length > 0) {
    stats.bestGrinding = grindings.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.densest = grindings.reduce((a, b) => a.inkDensity >= b.inkDensity ? a : b).file
    stats.mostDisciplined = grindings.reduce((a, b) => a.grindingDiscipline >= b.grindingDiscipline ? a : b).file
    stats.bestStrokes = grindings.reduce((a, b) => a.strokeQuality >= b.strokeQuality ? a : b).file
    stats.bestPrepared = grindings.reduce((a, b) => a.brushPreparation >= b.brushPreparation ? a : b).file
    stats.bestIntegrated = grindings.reduce((a, b) => a.paperCompatibility >= b.paperCompatibility ? a : b).file
  }

  const recommendations = generateRecommendations(grindings, shelves, studio, stats)

  return { grindings, shelves, studio, stats, recommendations }
}
