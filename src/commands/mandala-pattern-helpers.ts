// ─── Type Definitions ────────────────────────────────────

export type SymmetryType = 'radial' | 'bilateral' | 'rotational' | 'spiral' | 'asymmetric' | 'chaotic'
export type MandalaCondition = 'divine-mandala' | 'temple-art' | 'beautiful-pattern' | 'decorative-art' | 'rough-sketch' | 'scribble'
export type GardenType = 'temple-garden' | 'zen-garden' | 'flower-garden' | 'wildflower' | 'overgrown' | 'wasteland'
export type GardenCondition = 'masterpiece' | 'beautiful' | 'pleasant' | 'mediocre' | 'messy' | 'chaotic'
export type ArtistGrade = 'master-artist' | 'temple-artist' | 'artisan' | 'craftsman' | 'student' | 'child'

export interface RingMeasure {
  layer: number
  radius: number
  hasCenter: boolean
  hasInnerRing: boolean
  hasOuterRing: boolean
  hasDecorativeRing: boolean
  isComplete: boolean
  missingRings: string[]
}

export interface SymmetryMeasure {
  score: number
  hasBilateralSymmetry: boolean
  hasRadialSymmetry: boolean
  hasTranslationalSymmetry: boolean
  hasAsymmetry: boolean
  hasBrokenSymmetry: boolean
  axisCount: number
  symmetryType: SymmetryType
}

export interface PatternMeasure {
  hasRepetition: boolean
  hasRhythm: boolean
  hasFocalPoint: boolean
  hasFlowLines: boolean
  hasDotPatterns: boolean
  hasGeometricShapes: boolean
  repetitionQuality: number
  rhythmScore: number
}

export interface ColorMeasure {
  palette: string[]
  harmony: number
  isComplementary: boolean
  isMonochromatic: boolean
  isPolychromatic: boolean
  hasClashing: boolean
  hasWarm: boolean
  hasCool: boolean
  warmCoolBalance: number
}

export interface GeometryMeasure {
  hasCircles: boolean
  hasSquares: boolean
  hasTriangles: boolean
  hasSpirals: boolean
  hasLines: boolean
  hasFractals: boolean
  elegance: number
  complexity: number
}

export interface CompletenessMeasure {
  score: number
  hasAllSections: boolean
  hasBorder: boolean
  hasFilling: boolean
  hasDetails: boolean
  hasCenterpiece: boolean
  missingSections: string[]
}

export interface MeditationMeasure {
  quality: number
  isCalm: boolean
  isNoisy: boolean
  hasFlowState: boolean
  hasInterruptions: boolean
  hasChaos: boolean
  calmnessScore: number
  interruptionCount: number
}

export interface MandalaRing {
  file: string
  radialSymmetry: number
  concentricBalance: number
  colorHarmony: number
  sacredGeometry: number
  completeness: number
  meditativeQuality: number
  ring: RingMeasure
  symmetry: SymmetryMeasure
  pattern: PatternMeasure
  colors: ColorMeasure
  geometry: GeometryMeasure
  completenessMeasure: CompletenessMeasure
  meditation: MeditationMeasure
  condition: MandalaCondition
  qualityScore: number
}

export interface MandalaGarden {
  directory: string
  rings: MandalaRing[]
  avgSymmetry: number
  avgHarmony: number
  avgCompleteness: number
  avgMeditative: number
  divineCount: number
  scribbleCount: number
  gardenType: GardenType
  condition: GardenCondition
}

export interface MonasteryMeasure {
  avgSymmetry: number
  avgHarmony: number
  avgCompleteness: number
  avgMeditative: number
  isBeautiful: boolean
  overallBeauty: number
}

export interface MandalaPatternStats {
  totalFiles: number
  totalGardens: number
  avgRadialSymmetry: number
  avgConcentricBalance: number
  avgColorHarmony: number
  avgSacredGeometry: number
  avgCompleteness: number
  avgMeditativeQuality: number
  divineMandalaCount: number
  templeArtCount: number
  beautifulPatternCount: number
  decorativeArtCount: number
  roughSketchCount: number
  scribbleCount: number
  radialSymmetryCount: number
  bilateralSymmetryCount: number
  spiralSymmetryCount: number
  chaoticSymmetryCount: number
  hasRepetitionCount: number
  hasRhythmCount: number
  hasFocalPointCount: number
  isComplementaryCount: number
  isMonochromaticCount: number
  hasClashingCount: number
  hasCirclesCount: number
  hasSpiralsCount: number
  hasFractalsCount: number
  isCalmCount: number
  hasFlowStateCount: number
  hasChaosCount: number
  overallBeauty: number
  artistGrade: ArtistGrade
  mostBeautiful: string
  mostSymmetrical: string
  mostHarmonious: string
  mostComplete: string
  mostCalm: string
}

export interface MandalaPatternResult {
  rings: MandalaRing[]
  gardens: MandalaGarden[]
  monastery: MonasteryMeasure
  stats: MandalaPatternStats
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

// ─── Ring Measurement ────────────────────────────────────

/**
 * Measure ring layer structure
 * @example
 * measureRing('export function f(x: number): number { return x }') // { layer, radius, hasCenter, ... }
 */
export function measureRing(content: string): RingMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)

  const layer = Math.min(10, Math.max(0, Math.floor(
    (exports > 0 ? 2 : 0) +
    (types > 0 ? 2 : 0) +
    (errors > 0 ? 2 : 0) +
    (countJSDoc(content) > 0 ? 1 : 0) +
    (countInterfaces(content) > 0 ? 1 : 0) +
    (countClasses(content) > 0 ? 1 : 0) +
    (countDescriptiveNames(content) > 0 ? 1 : 0),
  )))

  const radius = Math.min(100, loc)

  const hasCenter = functions > 0
  const hasInnerRing = errors > 0
  const hasOuterRing = exports > 0
  const hasDecorativeRing = countComments(content) > 0 || countJSDoc(content) > 0

  const missingRings: string[] = []
  if (!hasCenter) missingRings.push('center')
  if (!hasInnerRing) missingRings.push('inner-ring')
  if (!hasOuterRing) missingRings.push('outer-ring')
  if (!hasDecorativeRing) missingRings.push('decorative-ring')

  const isComplete = hasCenter && hasInnerRing && hasOuterRing

  return { layer, radius, hasCenter, hasInnerRing, hasOuterRing, hasDecorativeRing, isComplete, missingRings }
}

// ─── Symmetry Measurement ────────────────────────────────

/**
 * Measure code symmetry
 * @example
 * measureSymmetry('export function f(x: number): number { return x }') // { score, hasRadialSymmetry, ... }
 */
export function measureSymmetry(content: string): SymmetryMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const branches = countBranches(content)

  const score = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (errors > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (branches > 0 && branches <= 5 ? 15 : branches > 5 ? 5 : 0) +
    (maxNesting(content) <= 3 ? 15 : maxNesting(content) <= 5 ? 8 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0),
  )))

  const hasBilateralSymmetry = exports > 0 && types > 0
  const hasRadialSymmetry = score >= 60
  const hasTranslationalSymmetry = countFunctions(content) >= 2 && errors > 0
  const hasAsymmetry = score > 0 && score < 30
  const hasBrokenSymmetry = countConsole(content) > 0 || countTodos(content) > 0
  const axisCount = (exports > 0 ? 1 : 0) + (types > 0 ? 1 : 0) + (errors > 0 ? 1 : 0)

  let symmetryType: SymmetryType = 'chaotic'
  if (score >= 80 && hasBilateralSymmetry && hasRadialSymmetry) symmetryType = 'radial'
  else if (score >= 65 && hasBilateralSymmetry) symmetryType = 'bilateral'
  else if (score >= 50 && hasTranslationalSymmetry) symmetryType = 'rotational'
  else if (score >= 35 && countFunctions(content) > 1) symmetryType = 'spiral'
  else if (loc > 0) symmetryType = 'asymmetric'

  return { score, hasBilateralSymmetry, hasRadialSymmetry, hasTranslationalSymmetry, hasAsymmetry, hasBrokenSymmetry, axisCount, symmetryType }
}

// ─── Pattern Measurement ─────────────────────────────────

/**
 * Measure code pattern quality
 * @example
 * measurePattern('function validate(x: number): boolean { return x > 0 }') // { hasRepetition, rhythmScore, ... }
 */
export function measurePattern(content: string): PatternMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const exports = countExports(content)

  const hasRepetition = functions >= 2
  const hasRhythm = exports > 0 && countTypeAnnotations(content) > 0
  const hasFocalPoint = countDescriptiveNames(content) > 0
  const hasFlowLines = countErrorHandling(content) > 0
  const hasDotPatterns = countComments(content) > 0 || countJSDoc(content) > 0
  const hasGeometricShapes = countClasses(content) > 0 || countInterfaces(content) > 0

  const repetitionQuality = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (hasRepetition ? 25 : 0) +
    (countJSDoc(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (countExports(content) > 0 ? 10 : 0),
  )))

  const rhythmScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (hasRhythm ? 25 : 0) +
    (maxNesting(content) <= 3 ? 25 : maxNesting(content) <= 5 ? 12 : 0) +
    (countBranches(content) <= 5 ? 25 : countBranches(content) <= 10 ? 12 : 0) +
    (countConsole(content) === 0 ? 15 : 0) +
    (countTodos(content) === 0 ? 10 : 0),
  )))

  return { hasRepetition, hasRhythm, hasFocalPoint, hasFlowLines, hasDotPatterns, hasGeometricShapes, repetitionQuality, rhythmScore }
}

// ─── Color Measurement ───────────────────────────────────

/**
 * Measure construct type balance
 * @example
 * measureColors('export function f(x: number): number { return x }') // { palette, harmony, ... }
 */
export function measureColors(content: string): ColorMeasure {
  const palette: string[] = []
  if (countFunctions(content) > 0) palette.push('function')
  if (countClasses(content) > 0) palette.push('class')
  if (countInterfaces(content) > 0) palette.push('interface')
  if (countExports(content) > 0) palette.push('export')
  if (countImports(content) > 0) palette.push('import')
  if (countTypeAnnotations(content) > 0) palette.push('type')
  if (countErrorHandling(content) > 0) palette.push('error-handling')
  if (countJSDoc(content) > 0) palette.push('jsdoc')

  const harmony = palette.length === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (palette.length >= 3 && palette.length <= 5 ? 40 : palette.length >= 2 ? 25 : 10) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0) +
    (countConsole(content) === 0 ? 10 : 0),
  )))

  const isComplementary = palette.length >= 3 && palette.includes('export') && palette.includes('type')
  const isMonochromatic = palette.length <= 1
  const isPolychromatic = palette.length >= 5
  const hasClashing = countConsole(content) > 0 && countTodos(content) > 0
  const hasWarm = countFunctions(content) > 0 || countErrorHandling(content) > 0
  const hasCool = countInterfaces(content) > 0 || countTypeAnnotations(content) > 0

  const warmCount = (countFunctions(content) > 0 ? 1 : 0) + (countErrorHandling(content) > 0 ? 1 : 0) + (countBranches(content) > 0 ? 1 : 0)
  const coolCount = (countInterfaces(content) > 0 ? 1 : 0) + (countTypeAnnotations(content) > 0 ? 1 : 0) + (countJSDoc(content) > 0 ? 1 : 0)
  const total = warmCount + coolCount
  const warmCoolBalance = total === 0 ? 50 : Math.round(Math.min(100, (Math.min(warmCount, coolCount) / total) * 200))

  return { palette, harmony, isComplementary, isMonochromatic, isPolychromatic, hasClashing, hasWarm, hasCool, warmCoolBalance }
}

// ─── Geometry Measurement ────────────────────────────────

/**
 * Measure geometric patterns
 * @example
 * measureGeometry('export function f(x: number): number { return x }') // { hasCircles, elegance, ... }
 */
export function measureGeometry(content: string): GeometryMeasure {
  const hasCircles = /\bwhile\b|\bfor\s*\(/g.test(content)
  const hasSquares = countClasses(content) > 0
  const hasTriangles = countBranches(content) > 0
  const hasSpirals = /\brecursive\b|\brecurse\b/gi.test(content) || (countFunctions(content) > 0 && countBranches(content) > 2)
  const hasLines = countFunctions(content) > 0
  const hasFractals = countFunctions(content) >= 2 && countExports(content) >= 2

  const loc = countLoc(content)
  const elegance = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countExports(content) > 0 ? 15 : 0) +
    (countErrorHandling(content) > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0) +
    (maxNesting(content) <= 3 ? 20 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0),
  )))

  const complexity = Math.min(100, Math.max(0, Math.round(
    (countFunctions(content) * 10) +
    (countBranches(content) * 5) +
    (maxNesting(content) * 8) +
    (countClasses(content) * 10),
  )))

  return { hasCircles, hasSquares, hasTriangles, hasSpirals, hasLines, hasFractals, elegance, complexity }
}

// ─── Completeness Measurement ────────────────────────────

/**
 * Measure feature completeness
 * @example
 * measureCompleteness('export function f(x: number): number { try { return x } catch (e) { return 0 } }') // { score, hasAllSections, ... }
 */
export function measureCompleteness(content: string): CompletenessMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const functions = countFunctions(content)

  const hasBorder = exports > 0
  const hasFilling = functions > 0
  const hasDetails = errors > 0
  const hasCenterpiece = countDescriptiveNames(content) > 0
  const hasAllSections = hasBorder && hasFilling && hasDetails

  const missingSections: string[] = []
  if (!hasBorder) missingSections.push('border')
  if (!hasFilling) missingSections.push('filling')
  if (!hasDetails) missingSections.push('details')
  if (!hasCenterpiece) missingSections.push('centerpiece')

  const score = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (hasBorder ? 25 : 0) +
    (hasFilling ? 20 : 0) +
    (hasDetails ? 20 : 0) +
    (hasCenterpiece ? 15 : 0) +
    (types > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0),
  )))

  return { score, hasAllSections, hasBorder, hasFilling, hasDetails, hasCenterpiece, missingSections }
}

// ─── Meditation Measurement ──────────────────────────────

/**
 * Measure code calmness and readability
 * @example
 * measureMeditation('export function validate(x: number): boolean { return x > 0 }') // { quality, isCalm, ... }
 */
export function measureMeditation(content: string): MeditationMeasure {
  const loc = countLoc(content)
  const nesting = maxNesting(content)
  const branches = countBranches(content)
  const consoleCount = countConsole(content)
  const todos = countTodos(content)

  const calmnessScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (nesting <= 3 ? 25 : nesting <= 5 ? 12 : 0) +
    (branches <= 5 ? 25 : branches <= 10 ? 12 : 0) +
    (consoleCount === 0 ? 20 : 0) +
    (todos === 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 5 : 0),
  )))

  const isCalm = calmnessScore >= 60
  const isNoisy = calmnessScore < 30 && loc > 0
  const hasFlowState = calmnessScore >= 70 && countErrorHandling(content) > 0
  const hasInterruptions = consoleCount > 0 || todos > 0
  const hasChaos = calmnessScore < 20 && loc > 5
  const interruptionCount = consoleCount + todos

  const quality = calmnessScore

  return { quality, isCalm, isNoisy, hasFlowState, hasInterruptions, hasChaos, calmnessScore, interruptionCount }
}

// ─── Classification ──────────────────────────────────────

export function classifyMandalaCondition(qualityScore: number): MandalaCondition {
  if (qualityScore >= 85) return 'divine-mandala'
  if (qualityScore >= 68) return 'temple-art'
  if (qualityScore >= 50) return 'beautiful-pattern'
  if (qualityScore >= 32) return 'decorative-art'
  if (qualityScore >= 15) return 'rough-sketch'
  return 'scribble'
}

export function classifyGardenType(rings: MandalaRing[]): GardenType {
  if (rings.length === 0) return 'wasteland'
  const avg = rings.reduce((s, r) => s + r.qualityScore, 0) / rings.length
  if (avg >= 80) return 'temple-garden'
  if (avg >= 62) return 'zen-garden'
  if (avg >= 45) return 'flower-garden'
  if (avg >= 28) return 'wildflower'
  if (avg >= 12) return 'overgrown'
  return 'wasteland'
}

export function classifyGardenCondition(rings: MandalaRing[]): GardenCondition {
  if (rings.length === 0) return 'chaotic'
  const avg = rings.reduce((s, r) => s + r.qualityScore, 0) / rings.length
  if (avg >= 80) return 'masterpiece'
  if (avg >= 62) return 'beautiful'
  if (avg >= 45) return 'pleasant'
  if (avg >= 28) return 'mediocre'
  if (avg >= 12) return 'messy'
  return 'chaotic'
}

export function classifyArtistGrade(avgBeauty: number): ArtistGrade {
  if (avgBeauty >= 80) return 'master-artist'
  if (avgBeauty >= 65) return 'temple-artist'
  if (avgBeauty >= 48) return 'artisan'
  if (avgBeauty >= 32) return 'craftsman'
  if (avgBeauty >= 16) return 'student'
  return 'child'
}

// ─── Core Analysis ───────────────────────────────────────

/**
 * Analyze a single file as a mandala ring
 * @example
 * analyzeMandalaRing('export function f(x: number): number { return x }', 'f.ts') // MandalaRing
 */
export function analyzeMandalaRing(content: string, filePath: string): MandalaRing {
  const ring = measureRing(content)
  const symmetry = measureSymmetry(content)
  const pattern = measurePattern(content)
  const colors = measureColors(content)
  const geometry = measureGeometry(content)
  const completenessMeasure = measureCompleteness(content)
  const meditation = measureMeditation(content)

  const loc = countLoc(content)
  const radialSymmetry = symmetry.score
  const concentricBalance = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (ring.isComplete ? 30 : 0) +
    (ring.layer >= 5 ? 25 : ring.layer >= 3 ? 15 : 5) +
    (ring.hasDecorativeRing ? 15 : 0) +
    (countTypeAnnotations(content) > 0 ? 15 : 0) +
    (countExports(content) > 0 ? 15 : 0),
  )))
  const colorHarmony = colors.harmony
  const sacredGeometry = geometry.elegance
  const completeness = completenessMeasure.score
  const meditativeQuality = meditation.calmnessScore

  const qualityScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (radialSymmetry * 0.18) +
    (concentricBalance * 0.17) +
    (colorHarmony * 0.15) +
    (sacredGeometry * 0.15) +
    (completeness * 0.18) +
    (meditativeQuality * 0.17),
  )))

  const condition = classifyMandalaCondition(qualityScore)

  return {
    file: filePath,
    radialSymmetry, concentricBalance, colorHarmony, sacredGeometry, completeness, meditativeQuality,
    ring, symmetry, pattern, colors, geometry, completenessMeasure, meditation,
    condition, qualityScore,
  }
}

// ─── Mandala Garden ──────────────────────────────────────

/**
 * Analyze a directory as a mandala garden
 * @example
 * analyzeMandalaGarden(rings, 'src') // MandalaGarden
 */
export function analyzeMandalaGarden(rings: MandalaRing[], dirPath: string): MandalaGarden {
  const n = rings.length
  const avgSymmetry = n === 0 ? 0 : Math.round(rings.reduce((s, r) => s + r.radialSymmetry, 0) / n)
  const avgHarmony = n === 0 ? 0 : Math.round(rings.reduce((s, r) => s + r.colorHarmony, 0) / n)
  const avgCompleteness = n === 0 ? 0 : Math.round(rings.reduce((s, r) => s + r.completeness, 0) / n)
  const avgMeditative = n === 0 ? 0 : Math.round(rings.reduce((s, r) => s + r.meditativeQuality, 0) / n)
  const divineCount = rings.filter(r => r.condition === 'divine-mandala').length
  const scribbleCount = rings.filter(r => r.condition === 'scribble').length

  return {
    directory: dirPath, rings,
    avgSymmetry, avgHarmony, avgCompleteness, avgMeditative,
    divineCount, scribbleCount,
    gardenType: classifyGardenType(rings),
    condition: classifyGardenCondition(rings),
  }
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate actionable recommendations
 * @example
 * generateRecommendations(rings, gardens, monastery, stats) // string[]
 */
export function generateRecommendations(
  rings: MandalaRing[],
  gardens: MandalaGarden[],
  monastery: MonasteryMeasure,
  stats: MandalaPatternStats,
): string[] {
  const recs: string[] = []

  if (stats.scribbleCount + stats.roughSketchCount > 0) {
    recs.push(`Restoration needed: ${stats.scribbleCount + stats.roughSketchCount} file(s) need artistic refinement`)
  }
  if (stats.hasChaosCount > stats.totalFiles * 0.3 && stats.totalFiles > 0) {
    recs.push('Chaotic patterns detected - reduce nesting and simplify control flow')
  }
  if (stats.isMonochromaticCount > stats.totalFiles * 0.5 && stats.totalFiles > 0) {
    recs.push('Monochromatic codebase - diversify with types, interfaces, and documentation')
  }
  if (stats.hasClashingCount > 0) {
    recs.push(`Color clashing: ${stats.hasClashingCount} file(s) mix console output with TODO debt`)
  }
  if (monastery.overallBeauty >= 70) {
    recs.push('Beautiful code garden - excellent symmetry and balance throughout')
  }
  if (stats.isCalmCount > stats.totalFiles * 0.5 && stats.totalFiles > 0) {
    recs.push('Meditative codebase - calm, readable patterns across the garden')
  }
  if (gardens.length > 1) {
    const chaoticGardens = gardens.filter(g => g.gardenType === 'wasteland' || g.gardenType === 'overgrown')
    if (chaoticGardens.length > 0) {
      recs.push(`Overgrown gardens: ${chaoticGardens.map(g => g.directory).join(', ')} need cultivation`)
    }
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete mandala-pattern result
 * @example
 * buildMandalaPatternResult(['a.ts'], ['export function a() {}'], {}) // MandalaPatternResult
 */
export function buildMandalaPatternResult(files: string[], contents: string[], _options: Record<string, unknown>): MandalaPatternResult {
  const rings: MandalaRing[] = files.map((file, i) => {
    const content = i < contents.length ? contents[i] : ''
    return analyzeMandalaRing(content, file)
  })

  const dirMap = new Map<string, MandalaRing[]>()
  for (const r of rings) {
    const parts = r.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(r) } else { dirMap.set(dir, [r]) }
  }

  const gardens = Array.from(dirMap.entries()).map(([dir, rs]) =>
    analyzeMandalaGarden(rs, dir),
  )

  const totalFiles = rings.length
  const avg = (fn: (r: MandalaRing) => number) => totalFiles === 0 ? 0 : Math.round(rings.reduce((s, r) => s + fn(r), 0) / totalFiles)
  const overallBeauty = avg(r => r.qualityScore)

  const monastery: MonasteryMeasure = {
    avgSymmetry: avg(r => r.radialSymmetry),
    avgHarmony: avg(r => r.colorHarmony),
    avgCompleteness: avg(r => r.completeness),
    avgMeditative: avg(r => r.meditativeQuality),
    isBeautiful: overallBeauty >= 60,
    overallBeauty,
  }

  const condCounts = { divine: 0, temple: 0, beautiful: 0, decorative: 0, rough: 0, scribble: 0 }
  for (const r of rings) {
    switch (r.condition) {
      case 'divine-mandala': condCounts.divine++; break
      case 'temple-art': condCounts.temple++; break
      case 'beautiful-pattern': condCounts.beautiful++; break
      case 'decorative-art': condCounts.decorative++; break
      case 'rough-sketch': condCounts.rough++; break
      case 'scribble': condCounts.scribble++; break
    }
  }

  const stats: MandalaPatternStats = {
    totalFiles,
    totalGardens: gardens.length,
    avgRadialSymmetry: avg(r => r.radialSymmetry),
    avgConcentricBalance: avg(r => r.concentricBalance),
    avgColorHarmony: avg(r => r.colorHarmony),
    avgSacredGeometry: avg(r => r.sacredGeometry),
    avgCompleteness: avg(r => r.completeness),
    avgMeditativeQuality: avg(r => r.meditativeQuality),
    divineMandalaCount: condCounts.divine,
    templeArtCount: condCounts.temple,
    beautifulPatternCount: condCounts.beautiful,
    decorativeArtCount: condCounts.decorative,
    roughSketchCount: condCounts.rough,
    scribbleCount: condCounts.scribble,
    radialSymmetryCount: rings.filter(r => r.symmetry.symmetryType === 'radial').length,
    bilateralSymmetryCount: rings.filter(r => r.symmetry.symmetryType === 'bilateral').length,
    spiralSymmetryCount: rings.filter(r => r.symmetry.symmetryType === 'spiral').length,
    chaoticSymmetryCount: rings.filter(r => r.symmetry.symmetryType === 'chaotic').length,
    hasRepetitionCount: rings.filter(r => r.pattern.hasRepetition).length,
    hasRhythmCount: rings.filter(r => r.pattern.hasRhythm).length,
    hasFocalPointCount: rings.filter(r => r.pattern.hasFocalPoint).length,
    isComplementaryCount: rings.filter(r => r.colors.isComplementary).length,
    isMonochromaticCount: rings.filter(r => r.colors.isMonochromatic).length,
    hasClashingCount: rings.filter(r => r.colors.hasClashing).length,
    hasCirclesCount: rings.filter(r => r.geometry.hasCircles).length,
    hasSpiralsCount: rings.filter(r => r.geometry.hasSpirals).length,
    hasFractalsCount: rings.filter(r => r.geometry.hasFractals).length,
    isCalmCount: rings.filter(r => r.meditation.isCalm).length,
    hasFlowStateCount: rings.filter(r => r.meditation.hasFlowState).length,
    hasChaosCount: rings.filter(r => r.meditation.hasChaos).length,
    overallBeauty,
    artistGrade: classifyArtistGrade(overallBeauty),
    mostBeautiful: totalFiles === 0 ? 'none' : rings.reduce((b, r) => r.qualityScore > b.qualityScore ? r : b).file,
    mostSymmetrical: totalFiles === 0 ? 'none' : rings.reduce((b, r) => r.radialSymmetry > b.radialSymmetry ? r : b).file,
    mostHarmonious: totalFiles === 0 ? 'none' : rings.reduce((b, r) => r.colorHarmony > b.colorHarmony ? r : b).file,
    mostComplete: totalFiles === 0 ? 'none' : rings.reduce((b, r) => r.completeness > b.completeness ? r : b).file,
    mostCalm: totalFiles === 0 ? 'none' : rings.reduce((b, r) => r.meditativeQuality > b.meditativeQuality ? r : b).file,
  }

  const recommendations = generateRecommendations(rings, gardens, monastery, stats)

  return { rings, gardens, monastery, stats, recommendations }
}
