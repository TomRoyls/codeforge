// ─── Type Definitions ────────────────────────────────────

export type PaintingStyle = 'realism' | 'impressionism' | 'abstract' | 'minimalism' | 'baroque' | 'dada'
export type BrushworkTechnique = 'sfumato' | 'chiaroscuro' | 'impasto' | 'glazing' | 'scumbling' | 'finger-paint'
export type GalleryCondition = 'mint' | 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
export type StrokeCondition = 'masterpiece' | 'gallery-quality' | 'studio-quality' | 'student-work' | 'amateur' | 'kindergarten'
export type WingType = 'renaissance-wing' | 'modern-wing' | 'contemporary-wing' | 'student-gallery' | 'flea-market' | 'dumpster'
export type WingCondition = 'world-class' | 'fine-gallery' | 'community-gallery' | 'craft-show' | 'refrigerator-door' | 'trash-can'
export type CuratorGrade = 'museum-curator' | 'gallery-director' | 'art-critic' | 'artist' | 'student' | 'toddler'

export interface PaintingMeasure {
  style: PaintingStyle
  composition: number
  hasFocalPoint: boolean
  hasBalance: boolean
  hasPerspective: boolean
  hasRuleOfThirds: boolean
  isCluttered: boolean
  hasNegativeSpace: boolean
  focalClarity: number
}

export interface PaletteMeasure {
  colors: string[]
  harmony: number
  isMonochrome: boolean
  isPolychrome: boolean
  isHarmonious: boolean
  hasComplementary: boolean
  hasClashing: boolean
  colorCount: number
}

export interface BrushworkMeasure {
  technique: BrushworkTechnique
  quality: number
  hasFineDetail: boolean
  hasBroadStrokes: boolean
  hasTexture: boolean
  isSmooth: boolean
  hasVisibleStrokes: boolean
  hasMud: boolean
}

export interface CanvasMeasure {
  coverage: number
  hasPrimer: boolean
  hasUnderpainting: boolean
  isFullyPainted: boolean
  hasBlankSpots: boolean
  hasPaintOver: boolean
  blankSpotCount: number
}

export interface FrameMeasure {
  quality: number
  isWellFramed: boolean
  isGilded: boolean
  hasOrnamentation: boolean
  isSimple: boolean
  isOverwrought: boolean
  hasDamage: boolean
}

export interface GalleryMeasure {
  readiness: number
  isSigned: boolean
  isVarnished: boolean
  hasCertificate: boolean
  isLit: boolean
  hasPlaque: boolean
  condition: GalleryCondition
}

export interface BrushStroke {
  file: string
  composition: number
  colorPalette: number
  brushwork: number
  canvasCoverage: number
  frameQuality: number
  galleryReadiness: number
  painting: PaintingMeasure
  palette: PaletteMeasure
  brushworkDetail: BrushworkMeasure
  canvas: CanvasMeasure
  frame: FrameMeasure
  gallery: GalleryMeasure
  condition: StrokeCondition
  qualityScore: number
}

export interface GalleryWing {
  directory: string
  strokes: BrushStroke[]
  avgComposition: number
  avgPalette: number
  avgBrushwork: number
  avgGalleryReadiness: number
  masterpieceCount: number
  kindergartenCount: number
  totalColors: number
  wingType: WingType
  condition: WingCondition
}

export interface MuseumMeasure {
  avgComposition: number
  avgPalette: number
  avgBrushwork: number
  avgGalleryReadiness: number
  isGalleryWorthy: boolean
  overallArtistry: number
}

export interface PaintingCanvasStats {
  totalFiles: number
  totalWings: number
  avgComposition: number
  avgColorPalette: number
  avgBrushwork: number
  avgCanvasCoverage: number
  avgFrameQuality: number
  avgGalleryReadiness: number
  masterpieceCount: number
  galleryQualityCount: number
  studioQualityCount: number
  studentWorkCount: number
  amateurCount: number
  kindergartenCount: number
  realismCount: number
  impressionismCount: number
  abstractCount: number
  minimalismCount: number
  baroqueCount: number
  dadaCount: number
  monochromeCount: number
  harmoniousCount: number
  hasFocalPointCount: number
  isFullyPaintedCount: number
  hasCertificateCount: number
  isLitCount: number
  isSignedCount: number
  overallArtistry: number
  curatorGrade: CuratorGrade
  bestComposition: string
  richestPalette: string
  finestTechnique: string
  mostReady: string
  bestFramed: string
}

export interface PaintingCanvasResult {
  strokes: BrushStroke[]
  wings: GalleryWing[]
  museum: MuseumMeasure
  stats: PaintingCanvasStats
  recommendations: string[]
}

// ─── Primitive Counters ──────────────────────────────────

export function countLoc(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter(l => l.trim().length > 0).length
}

export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

export function countInterfaces(content: string): number {
  const m = content.match(/\binterface\s+\w+/g)
  return m ? m.length : 0
}

export function countTypes(content: string): number {
  const m = content.match(/\btype\s+\w+/g)
  return m ? m.length : 0
}

export function countEnums(content: string): number {
  const m = content.match(/\benum\s+\w+/g)
  return m ? m.length : 0
}

export function countErrorHandling(content: string): number {
  let count = 0
  const t = content.match(/\btry\s*\{/g); if (t) count += t.length
  const c = content.match(/\bcatch\s/g); if (c) count += c.length
  const th = content.match(/\bthrow\s/g); if (th) count += th.length
  return count
}

export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:string|number|boolean|void|null|undefined|never|any|unknown|object|bigint|symbol)(?:\[\])?\b/g)
  return m ? m.length : 0
}

export function countBranches(content: string): number {
  let count = 0
  const i = content.match(/\bif\s*\(/g); if (i) count += i.length
  const e = content.match(/\belse\s/g); if (e) count += e.length
  const s = content.match(/\bswitch\s*\(/g); if (s) count += s.length
  return count
}

export function maxNesting(content: string): number {
  let max = 0, d = 0
  for (const ch of content) {
    if (ch === '{') { d++; if (d > max) max = d }
    if (ch === '}') d = Math.max(0, d - 1)
  }
  return max
}

export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

export function countComments(content: string): number {
  let count = 0
  const s = content.match(/\/\/.*$/gm); if (s) count += s.length
  const b = content.match(/\/\*[\s\S]*?\*\//g); if (b) count += b.length
  return count
}

export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b|\bFIXME\b|\bHACK\b/gi)
  return m ? m.length : 0
}

export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

export function countValidations(content: string): number {
  const m = content.match(/\b(typeof|instanceof|\.length\s*[><=!]|\bin\b|\!\s*\w|===|!==)/g)
  return m ? m.length : 0
}

export function countConstructTypes(content: string): string[] {
  const types: string[] = []
  if (countFunctions(content) > 0) types.push('function')
  if (countClasses(content) > 0) types.push('class')
  if (countInterfaces(content) > 0) types.push('interface')
  if (countTypes(content) > 0) types.push('type')
  if (countEnums(content) > 0) types.push('enum')
  if (/=\s*\[/.test(content) || /=\s*\{/.test(content)) types.push('literal')
  return Array.from(new Set(types))
}

// ─── Painting Measurement ────────────────────────────────

/**
 * Measure painting composition quality
 * @example
 * measurePainting('export function calc() { if (x) {} else {} }') // { style, composition, ... }
 */
export function measurePainting(content: string): PaintingMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const branches = countBranches(content)
  const nesting = maxNesting(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)

  const composition = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 20 : 0) +
    (functions > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (branches > 0 && branches <= 5 ? 15 : branches > 5 ? 5 : 0) +
    (nesting <= 3 ? 15 : nesting <= 5 ? 8 : 0) +
    (countComments(content) > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))

  const hasFocalPoint = exports > 0
  const hasBalance = functions > 0 && exports > 0
  const hasPerspective = types > 0 && nesting >= 1
  const hasRuleOfThirds = functions > 0 && types > 0 && countErrorHandling(content) > 0
  const isCluttered = nesting > 5 || branches > 10
  const hasNegativeSpace = countComments(content) > 0 || loc === 0
  const focalClarity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 40 : 0) +
    (countJSDoc(content) > 0 ? 30 : 0) +
    (types > 0 ? 30 : 0),
  )))

  let style: PaintingStyle = 'abstract'
  if (composition >= 80 && types > 0 && countErrorHandling(content) > 0) style = 'realism'
  else if (composition >= 60 && types > 0) style = 'impressionism'
  else if (loc > 0 && functions === 0 && exports === 0) style = 'dada'
  else if (loc > 0 && functions <= 2 && branches <= 1) style = 'minimalism'
  else if (nesting > 4 || branches > 8) style = 'baroque'

  return { style, composition, hasFocalPoint, hasBalance, hasPerspective, hasRuleOfThirds, isCluttered, hasNegativeSpace, focalClarity }
}

// ─── Palette Measurement ─────────────────────────────────

/**
 * Measure color palette variety and harmony
 * @example
 * measurePalette('function f() {} class A {} interface I {}') // { colors, harmony, ... }
 */
export function measurePalette(content: string): PaletteMeasure {
  const loc = countLoc(content)
  const colors = countConstructTypes(content)
  const colorCount = colors.length

  const harmony = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (colorCount >= 2 ? 25 : 0) +
    (colorCount >= 4 ? 25 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0),
  )))

  const isMonochrome = colorCount <= 1 && loc > 0
  const isPolychrome = colorCount >= 4
  const isHarmonious = harmony >= 60
  const hasComplementary = colorCount >= 2 && countTypeAnnotations(content) > 0
  const hasClashing = countConsole(content) > 0 && countTodos(content) > 0

  return { colors, harmony, isMonochrome, isPolychrome, isHarmonious, hasComplementary, hasClashing, colorCount }
}

// ─── Brushwork Measurement ───────────────────────────────

/**
 * Measure code technique quality
 * @example
 * measureBrushwork('export function validate(x: string): boolean { return x.length > 0 }') // { technique, ... }
 */
export function measureBrushworkMeasure(content: string): BrushworkMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const validations = countValidations(content)
  const descriptive = countDescriptiveNames(content)
  const functions = countFunctions(content)
  const jsdoc = countJSDoc(content)

  const quality = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 20 : 0) +
    (validations > 0 ? 15 : 0) +
    (descriptive > 0 ? 15 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (countComments(content) > 0 ? 15 : 0),
  )))

  const hasFineDetail = validations > 0 && types > 0
  const hasBroadStrokes = functions > 0 && types === 0
  const hasTexture = errors > 0 && types > 0
  const isSmooth = quality >= 50 && countConsole(content) === 0
  const hasVisibleStrokes = descriptive > 3
  const hasMud = countConsole(content) > 0 && countTodos(content) > 0

  let technique: BrushworkTechnique = 'finger-paint'
  if (quality >= 80 && hasTexture) technique = 'sfumato'
  else if (quality >= 65 && errors > 0) technique = 'chiaroscuro'
  else if (quality >= 50 && types > 0) technique = 'impasto'
  else if (quality >= 35 && validations > 0) technique = 'glazing'
  else if (loc > 0 && descriptive > 0) technique = 'scumbling'

  return { technique, quality, hasFineDetail, hasBroadStrokes, hasTexture, isSmooth, hasVisibleStrokes, hasMud }
}

// ─── Canvas Measurement ──────────────────────────────────

/**
 * Measure code completeness
 * @example
 * measureCanvas('export function f() { return 1 }') // { coverage, hasBlankSpots, ... }
 */
export function measureCanvas(content: string): CanvasMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const todos = countTodos(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)

  const coverage = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 20 : 0) +
    (functions > 0 ? 20 : 0) +
    (types > 0 ? 15 : 0) +
    (errors > 0 ? 15 : 0) +
    (todos === 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0),
  )))

  const hasPrimer = countImports(content) > 0 || loc > 0
  const hasUnderpainting = countClasses(content) > 0 || countInterfaces(content) > 0
  const isFullyPainted = exports > 0 && functions > 0 && todos === 0
  const hasBlankSpots = todos > 0 || (loc > 0 && exports === 0)
  const hasPaintOver = /\/\/.*TODO|\/\/.*FIXME/i.test(content)
  const blankSpotCount = todos + (exports === 0 && loc > 0 ? 1 : 0)

  return { coverage, hasPrimer, hasUnderpainting, isFullyPainted, hasBlankSpots, hasPaintOver, blankSpotCount }
}

// ─── Frame Measurement ───────────────────────────────────

/**
 * Measure interface/API quality
 * @example
 * measureFrame('export function calc(x: number): number { return x }') // { quality, isWellFramed, ... }
 */
export function measureFrame(content: string): FrameMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)

  const quality = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 25 : 0) +
    (types > 0 ? 25 : 0) +
    (jsdoc > 0 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 15 : 0) +
    (countConsole(content) === 0 ? 15 : 0),
  )))

  const isWellFramed = exports > 0 && types > 0
  const isGilded = types > 0
  const hasOrnamentation = jsdoc > 0
  const isSimple = exports > 0 && exports <= 2
  const isOverwrought = exports > 6
  const hasDamage = countTodos(content) > 0

  return { quality, isWellFramed, isGilded, hasOrnamentation, isSimple, isOverwrought, hasDamage }
}

// ─── Gallery Measurement ─────────────────────────────────

/**
 * Measure production readiness
 * @example
 * measureGallery('export function f(x: number): number { return x }') // { readiness, ... }
 */
export function measureGallery(content: string): GalleryMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const jsdoc = countJSDoc(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)

  const readiness = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 20 : 0) +
    (jsdoc > 0 ? 20 : 0) +
    (todos === 0 ? 15 : 0) +
    (consoleCount === 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))

  const isSigned = jsdoc > 0
  const isVarnished = errors > 0 && todos === 0
  const hasCertificate = errors > 0 && countValidations(content) > 0
  const isLit = jsdoc > 0 || countComments(content) > 0
  const hasPlaque = jsdoc > 0

  let condition: GalleryCondition = 'damaged'
  if (readiness >= 85) condition = 'mint'
  else if (readiness >= 68) condition = 'excellent'
  else if (readiness >= 50) condition = 'good'
  else if (readiness >= 32) condition = 'fair'
  else if (readiness >= 15) condition = 'poor'

  return { readiness, isSigned, isVarnished, hasCertificate, isLit, hasPlaque, condition }
}

// ─── Classification ──────────────────────────────────────

export function classifyStrokeCondition(qualityScore: number): StrokeCondition {
  if (qualityScore >= 85) return 'masterpiece'
  if (qualityScore >= 68) return 'gallery-quality'
  if (qualityScore >= 50) return 'studio-quality'
  if (qualityScore >= 32) return 'student-work'
  if (qualityScore >= 15) return 'amateur'
  return 'kindergarten'
}

export function classifyWingType(strokes: BrushStroke[]): WingType {
  if (strokes.length === 0) return 'dumpster'
  const avg = strokes.reduce((s, st) => s + st.qualityScore, 0) / strokes.length
  if (avg >= 80) return 'renaissance-wing'
  if (avg >= 62) return 'modern-wing'
  if (avg >= 45) return 'contemporary-wing'
  if (avg >= 28) return 'student-gallery'
  if (avg >= 12) return 'flea-market'
  return 'dumpster'
}

export function classifyWingCondition(strokes: BrushStroke[]): WingCondition {
  if (strokes.length === 0) return 'trash-can'
  const avg = strokes.reduce((s, st) => s + st.qualityScore, 0) / strokes.length
  if (avg >= 80) return 'world-class'
  if (avg >= 62) return 'fine-gallery'
  if (avg >= 45) return 'community-gallery'
  if (avg >= 28) return 'craft-show'
  if (avg >= 12) return 'refrigerator-door'
  return 'trash-can'
}

export function classifyCuratorGrade(avgArtistry: number): CuratorGrade {
  if (avgArtistry >= 80) return 'museum-curator'
  if (avgArtistry >= 65) return 'gallery-director'
  if (avgArtistry >= 48) return 'art-critic'
  if (avgArtistry >= 32) return 'artist'
  if (avgArtistry >= 16) return 'student'
  return 'toddler'
}

// ─── Core Analysis ───────────────────────────────────────

/**
 * Analyze a single file as a brush stroke
 * @example
 * analyzeBrushStroke('export function f() {}', 'f.ts') // BrushStroke
 */
export function analyzeBrushStroke(content: string, filePath: string): BrushStroke {
  const painting = measurePainting(content)
  const palette = measurePalette(content)
  const brushworkDetail = measureBrushworkMeasure(content)
  const canvas = measureCanvas(content)
  const frame = measureFrame(content)
  const gallery = measureGallery(content)

  const composition = painting.composition
  const colorPalette = palette.harmony
  const brushworkScore = brushworkDetail.quality
  const canvasCoverage = canvas.coverage
  const frameQuality = frame.quality
  const galleryReadiness = gallery.readiness

  const loc = countLoc(content)
  const qualityScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (composition * 0.20) +
    (colorPalette * 0.15) +
    (brushworkScore * 0.15) +
    (canvasCoverage * 0.15) +
    (frameQuality * 0.15) +
    (galleryReadiness * 0.20),
  )))

  const condition = classifyStrokeCondition(qualityScore)

  return {
    file: filePath,
    composition, colorPalette, brushwork: brushworkScore, canvasCoverage, frameQuality, galleryReadiness,
    painting, palette, brushworkDetail, canvas, frame, gallery,
    condition, qualityScore,
  }
}

// ─── Gallery Wing ────────────────────────────────────────

/**
 * Analyze a directory as a gallery wing
 * @example
 * analyzeGalleryWing(strokes, 'src') // GalleryWing
 */
export function analyzeGalleryWing(strokes: BrushStroke[], dirPath: string): GalleryWing {
  const n = strokes.length
  const avgComposition = n === 0 ? 0 : Math.round(strokes.reduce((s, st) => s + st.composition, 0) / n)
  const avgPalette = n === 0 ? 0 : Math.round(strokes.reduce((s, st) => s + st.colorPalette, 0) / n)
  const avgBrushwork = n === 0 ? 0 : Math.round(strokes.reduce((s, st) => s + st.brushwork, 0) / n)
  const avgGalleryReadiness = n === 0 ? 0 : Math.round(strokes.reduce((s, st) => s + st.galleryReadiness, 0) / n)
  const masterpieceCount = strokes.filter(s => s.condition === 'masterpiece').length
  const kindergartenCount = strokes.filter(s => s.condition === 'kindergarten').length

  const allColors = strokes.flatMap(s => s.palette.colors)
  const totalColors = Array.from(new Set(allColors)).length

  return {
    directory: dirPath, strokes,
    avgComposition, avgPalette, avgBrushwork, avgGalleryReadiness,
    masterpieceCount, kindergartenCount, totalColors,
    wingType: classifyWingType(strokes),
    condition: classifyWingCondition(strokes),
  }
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate actionable recommendations
 * @example
 * generateRecommendations(strokes, wings, museum, stats) // string[]
 */
export function generateRecommendations(
  _strokes: BrushStroke[],
  wings: GalleryWing[],
  museum: MuseumMeasure,
  stats: PaintingCanvasStats,
): string[] {
  const recs: string[] = []

  if (stats.kindergartenCount + stats.amateurCount > 0) {
    recs.push(`Needs restoration: ${stats.kindergartenCount + stats.amateurCount} file(s) need structural improvement`)
  }
  if (stats.monochromeCount > stats.totalFiles * 0.5) {
    recs.push('Monochrome codebase - add variety with interfaces, types, and enums')
  }
  if (stats.isFullyPaintedCount === 0 && stats.totalFiles > 0) {
    recs.push('Incomplete canvas - resolve TODOs and add exports')
  }
  if (stats.hasFocalPointCount === 0 && stats.totalFiles > 0) {
    recs.push('No focal points - add clear exports to define purpose')
  }
  if (stats.isLitCount === 0 && stats.totalFiles > 0) {
    recs.push('Dark gallery - add JSDoc and comments to illuminate code')
  }
  if (museum.overallArtistry >= 70) {
    recs.push('Gallery worthy - excellent composition and technique throughout')
  }
  if (stats.harmoniousCount > stats.totalFiles * 0.5) {
    recs.push('Harmonious palette - good construct variety across codebase')
  }
  if (wings.length > 1) {
    const dumpWings = wings.filter(w => w.wingType === 'dumpster' || w.wingType === 'flea-market')
    if (dumpWings.length > 0) {
      recs.push(`Damaged wings: ${dumpWings.map(w => w.directory).join(', ')} need restoration`)
    }
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete painting-canvas result
 * @example
 * buildPaintingCanvasResult(['a.ts'], ['export function a() {}'], {}) // PaintingCanvasResult
 */
export function buildPaintingCanvasResult(files: string[], contents: string[], _options: Record<string, unknown>): PaintingCanvasResult {
  const strokes: BrushStroke[] = files.map((file, i) => {
    const content = i < contents.length ? contents[i] : ''
    return analyzeBrushStroke(content ?? '', file)
  })

  const dirMap = new Map<string, BrushStroke[]>()
  for (const stroke of strokes) {
    const parts = stroke.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(stroke) } else { dirMap.set(dir, [stroke]) }
  }

  const wings = Array.from(dirMap.entries()).map(([dir, ws]) =>
    analyzeGalleryWing(ws, dir),
  )

  const totalFiles = strokes.length
  const avg = (fn: (s: BrushStroke) => number) => totalFiles === 0 ? 0 : Math.round(strokes.reduce((s, st) => s + fn(st), 0) / totalFiles)

  const overallArtistry = avg(s => s.qualityScore)

  const museum: MuseumMeasure = {
    avgComposition: avg(s => s.composition),
    avgPalette: avg(s => s.colorPalette),
    avgBrushwork: avg(s => s.brushwork),
    avgGalleryReadiness: avg(s => s.galleryReadiness),
    isGalleryWorthy: overallArtistry >= 60,
    overallArtistry,
  }

  const condCounts = { masterpiece: 0, galleryQuality: 0, studioQuality: 0, studentWork: 0, amateur: 0, kindergarten: 0 }
  for (const s of strokes) {
    switch (s.condition) {
      case 'masterpiece': condCounts.masterpiece++; break
      case 'gallery-quality': condCounts.galleryQuality++; break
      case 'studio-quality': condCounts.studioQuality++; break
      case 'student-work': condCounts.studentWork++; break
      case 'amateur': condCounts.amateur++; break
      case 'kindergarten': condCounts.kindergarten++; break
    }
  }

  const bestComp = totalFiles === 0 ? 'none' : strokes.reduce((b, s) => s.composition > b.composition ? s : b).file
  const richestPal = totalFiles === 0 ? 'none' : strokes.reduce((b, s) => s.palette.colorCount > b.palette.colorCount ? s : b).file
  const finestTech = totalFiles === 0 ? 'none' : strokes.reduce((b, s) => s.brushworkDetail.quality > b.brushworkDetail.quality ? s : b).file
  const mostReadyFile = totalFiles === 0 ? 'none' : strokes.reduce((b, s) => s.galleryReadiness > b.galleryReadiness ? s : b).file
  const bestFramed = totalFiles === 0 ? 'none' : strokes.reduce((b, s) => s.frameQuality > b.frameQuality ? s : b).file

  const stats: PaintingCanvasStats = {
    totalFiles,
    totalWings: wings.length,
    avgComposition: avg(s => s.composition),
    avgColorPalette: avg(s => s.colorPalette),
    avgBrushwork: avg(s => s.brushwork),
    avgCanvasCoverage: avg(s => s.canvasCoverage),
    avgFrameQuality: avg(s => s.frameQuality),
    avgGalleryReadiness: avg(s => s.galleryReadiness),
    masterpieceCount: condCounts.masterpiece,
    galleryQualityCount: condCounts.galleryQuality,
    studioQualityCount: condCounts.studioQuality,
    studentWorkCount: condCounts.studentWork,
    amateurCount: condCounts.amateur,
    kindergartenCount: condCounts.kindergarten,
    realismCount: strokes.filter(s => s.painting.style === 'realism').length,
    impressionismCount: strokes.filter(s => s.painting.style === 'impressionism').length,
    abstractCount: strokes.filter(s => s.painting.style === 'abstract').length,
    minimalismCount: strokes.filter(s => s.painting.style === 'minimalism').length,
    baroqueCount: strokes.filter(s => s.painting.style === 'baroque').length,
    dadaCount: strokes.filter(s => s.painting.style === 'dada').length,
    monochromeCount: strokes.filter(s => s.palette.isMonochrome).length,
    harmoniousCount: strokes.filter(s => s.palette.isHarmonious).length,
    hasFocalPointCount: strokes.filter(s => s.painting.hasFocalPoint).length,
    isFullyPaintedCount: strokes.filter(s => s.canvas.isFullyPainted).length,
    hasCertificateCount: strokes.filter(s => s.gallery.hasCertificate).length,
    isLitCount: strokes.filter(s => s.gallery.isLit).length,
    isSignedCount: strokes.filter(s => s.gallery.isSigned).length,
    overallArtistry,
    curatorGrade: classifyCuratorGrade(overallArtistry),
    bestComposition: bestComp,
    richestPalette: richestPal,
    finestTechnique: finestTech,
    mostReady: mostReadyFile,
    bestFramed,
  }

  const recommendations = generateRecommendations(strokes, wings, museum, stats)

  return { strokes, wings, museum, stats, recommendations }
}
