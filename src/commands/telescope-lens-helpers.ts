// ─── Interfaces ──────────────────────────────────────────

export type LensType = 'achromatic' | 'apochromatic' | 'plan-achromatic' | 'simple' | 'compound' | 'defective'
export type ElementCondition = 'hubble-quality' | 'research-grade' | 'observatory' | 'backyard-scope' | 'toy-telescope' | 'broken-lens'
export type BayType = 'professional-dome' | 'campus-observatory' | 'backyard-observatory' | 'rooftop' | 'window' | 'dark-closet'
export type BayCondition = 'crystal-clear' | 'sharp' | 'adequate' | 'blurry' | 'distorted' | 'opaque'
export type AstronomerGrade = 'optical-engineer' | 'telescope-maker' | 'astronomer' | 'stargazer' | 'tourist' | 'blind'

export interface LensMeasure {
  type: LensType
  focalLength: number
  fNumber: number
  isFocused: boolean
  isBlurred: boolean
  isDistorted: boolean
  hasMultipleFoci: boolean
  focusScore: number
}

export interface ApertureMeasure {
  diameter: number
  isOpen: boolean
  isStopped: boolean
  isOptimal: boolean
  hasVignetting: boolean
  hasFalloff: boolean
  fStop: number
}

export interface MagnificationMeasure {
  level: number
  isMacro: boolean
  isNormal: boolean
  isWide: boolean
  hasEmptyMagnification: boolean
  hasUsefulDetail: boolean
  detailDensity: number
}

export interface ResolutionMeasure {
  sharpness: number
  hasDiffraction: boolean
  hasSphericalAberration: boolean
  hasComa: boolean
  hasAstigmatism: boolean
  resolvingPower: number
  contrast: number
}

export interface AberrationMeasure {
  chromatic: number
  isCorrected: boolean
  hasColorFringing: boolean
  hasBarrelDistortion: boolean
  hasPincushion: boolean
  fringeCount: number
  isMinimal: boolean
}

export interface GatheringMeasure {
  power: number
  hasFieldStop: boolean
  hasEyepiece: boolean
  hasFilter: boolean
  hasFinder: boolean
  hasCollimation: boolean
  lightTransmission: number
}

export interface MountMeasure {
  isStable: boolean
  isAligned: boolean
  hasTracking: boolean
  hasGoTo: boolean
  alignmentScore: number
}

export interface LensElement {
  file: string
  focalLength: number
  aperture: number
  magnification: number
  resolution: number
  aberration: number
  lightGathering: number
  lens: LensMeasure
  apertureDetail: ApertureMeasure
  magnificationDetail: MagnificationMeasure
  resolutionDetail: ResolutionMeasure
  aberrationDetail: AberrationMeasure
  gathering: GatheringMeasure
  mount: MountMeasure
  condition: ElementCondition
  qualityScore: number
}

export interface ObservatoryBay {
  directory: string
  elements: LensElement[]
  avgFocalLength: number
  avgResolution: number
  avgAberration: number
  hubbleCount: number
  brokenCount: number
  focusedCount: number
  distortedCount: number
  bayType: BayType
  condition: BayCondition
}

export interface Observatory {
  avgFocalLength: number
  avgResolution: number
  avgAberration: number
  avgLightGathering: number
  isFocused: boolean
  overallClarity: number
}

export interface TelescopeLensStats {
  totalFiles: number
  totalBays: number
  avgFocalLength: number
  avgAperture: number
  avgMagnification: number
  avgResolution: number
  avgAberration: number
  avgLightGathering: number
  hubbleQualityCount: number
  researchGradeCount: number
  observatoryCount: number
  backyardScopeCount: number
  toyTelescopeCount: number
  brokenLensCount: number
  achromaticCount: number
  apochromaticCount: number
  simpleCount: number
  defectiveCount: number
  focusedCount: number
  blurredCount: number
  distortedCount: number
  multipleFociCount: number
  correctedCount: number
  hasFilterCount: number
  hasCollimationCount: number
  isStableCount: number
  overallClarity: number
  astronomerGrade: AstronomerGrade
  clearest: string
  sharpest: string
  mostAberrated: string
  bestFocused: string
  mostPowerful: string
}

export interface TelescopeLensResult {
  elements: LensElement[]
  bays: ObservatoryBay[]
  observatory: Observatory
  stats: TelescopeLensStats
  recommendations: string[]
}

// ─── Primitive Counters ──────────────────────────────────

export function countLoc(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter(l => l.trim().length > 0).length
}

export function countImports(content: string): number {
  const matches = content.match(/^import\s/gm)
  return matches ? matches.length : 0
}

export function countExports(content: string): number {
  const matches = content.match(/^export\s/gm)
  return matches ? matches.length : 0
}

export function countFunctions(content: string): number {
  const matches = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return matches ? matches.length : 0
}

export function countClasses(content: string): number {
  const matches = content.match(/\bclass\s+\w+/g)
  return matches ? matches.length : 0
}

export function countErrorHandling(content: string): number {
  let count = 0
  const tryMatch = content.match(/\btry\s*\{/g)
  if (tryMatch) count += tryMatch.length
  const catchMatch = content.match(/\bcatch\s/g)
  if (catchMatch) count += catchMatch.length
  const throwMatch = content.match(/\bthrow\s/g)
  if (throwMatch) count += throwMatch.length
  return count
}

export function countTypeAnnotations(content: string): number {
  const matches = content.match(/:\s*(?:string|number|boolean|void|null|undefined|never|any|unknown|object|bigint|symbol)(?:\[\])?\b/g)
  return matches ? matches.length : 0
}

export function countBranches(content: string): number {
  let count = 0
  const ifMatch = content.match(/\bif\s*\(/g)
  if (ifMatch) count += ifMatch.length
  const elseMatch = content.match(/\belse\s/g)
  if (elseMatch) count += elseMatch.length
  const switchMatch = content.match(/\bswitch\s*\(/g)
  if (switchMatch) count += switchMatch.length
  return count
}

export function maxNesting(content: string): number {
  let maxDepth = 0
  let depth = 0
  for (const ch of content) {
    if (ch === '{') { depth++; if (depth > maxDepth) maxDepth = depth }
    if (ch === '}') { depth = Math.max(0, depth - 1) }
  }
  return maxDepth
}

export function countConsole(content: string): number {
  const matches = content.match(/\bconsole\.\w+/g)
  return matches ? matches.length : 0
}

export function countComments(content: string): number {
  let count = 0
  const singleMatch = content.match(/\/\/.*$/gm)
  if (singleMatch) count += singleMatch.length
  const blockMatch = content.match(/\/\*[\s\S]*?\*\//g)
  if (blockMatch) count += blockMatch.length
  return count
}

export function countTodos(content: string): number {
  const matches = content.match(/\bTODO\b|\bFIXME\b|\bHACK\b/gi)
  return matches ? matches.length : 0
}

export function countJSDoc(content: string): number {
  const matches = content.match(/\/\*\*[\s\S]*?\*\//g)
  return matches ? matches.length : 0
}

export function countDescriptiveNames(content: string): number {
  const matches = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return matches ? matches.length : 0
}

export function countValidations(content: string): number {
  const matches = content.match(/\b(typeof|instanceof|\.length\s*[><=!]|\bin\b|\!\s*\w|===|!==)/g)
  return matches ? matches.length : 0
}

// ─── Lens Measurement ────────────────────────────────────

/**
 * Measure lens focus properties
 * @example
 * measureLens('export function calc() {}') // { type, focalLength, ... }
 */
export function measureLens(content: string): LensMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const descriptive = countDescriptiveNames(content)
  const imports = countImports(content)

  const focalLength = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (jsdoc > 0 ? 20 : 0) +
    (descriptive > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0) +
    (countComments(content) > 0 ? 10 : 0),
  )))

  let type: LensType = 'defective'
  if (exports > 0 && types > 0 && jsdoc > 0 && descriptive > 0) type = 'apochromatic'
  else if (exports > 0 && types > 0) type = 'achromatic'
  else if (exports > 0 && jsdoc > 0) type = 'plan-achromatic'
  else if (exports > 0 && imports > 0) type = 'compound'
  else if (loc > 0) type = 'simple'

  const isFocused = exports > 0 && descriptive > 0
  const isBlurred = exports === 0 && loc > 0
  const isDistorted = exports > 0 && descriptive === 0
  const hasMultipleFoci = exports > 3
  const focusScore = focalLength

  const apertureVal = exports + imports + countFunctions(content) + countClasses(content)
  const fNumber = focalLength === 0 ? 0 : Math.round(Math.min(100, Math.max(1, focalLength / Math.max(1, apertureVal) * 5)))

  return { type, focalLength, fNumber, isFocused, isBlurred, isDistorted, hasMultipleFoci, focusScore }
}

// ─── Aperture Measurement ────────────────────────────────

/**
 * Measure aperture scope properties
 * @example
 * measureAperture('export function calc() {}') // { diameter, isOpen, ... }
 */
export function measureAperture(content: string): ApertureMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)

  const diameter = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (functions * 10) +
    (classes * 15) +
    (imports * 5) +
    (exports * 8) +
    Math.min(loc / 5, 20),
  )))

  const isOpen = diameter > 60
  const isStopped = diameter < 30 && loc > 0
  const isOptimal = diameter >= 30 && diameter <= 60
  const hasVignetting = imports > 0 && exports === 0
  const hasFalloff = functions > 3 && exports <= 1
  const fStop = diameter === 0 ? 0 : Math.round(Math.min(22, Math.max(1, 100 / diameter)))

  return { diameter, isOpen, isStopped, isOptimal, hasVignetting, hasFalloff, fStop }
}

// ─── Magnification Measurement ───────────────────────────

/**
 * Measure magnification detail properties
 * @example
 * measureMagnification('if (x) { return calc() }') // { level, isMacro, ... }
 */
export function measureMagnification(content: string): MagnificationMeasure {
  const loc = countLoc(content)
  const branches = countBranches(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const validations = countValidations(content)
  const nesting = maxNesting(content)

  const level = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (branches * 8) +
    (nesting * 10) +
    (errors * 8) +
    (validations * 5) +
    Math.min(types * 3, 15),
  )))

  const isMacro = level > 70
  const isNormal = level >= 30 && level <= 70
  const isWide = level < 30 && loc > 0
  const hasEmptyMagnification = branches > 3 && types === 0 && countJSDoc(content) === 0
  const hasUsefulDetail = branches > 0 && types > 0
  const detailDensity = loc === 0 ? 0 : Math.min(100, Math.round(
    ((branches + validations + errors) / Math.max(1, loc)) * 100,
  ))

  return { level, isMacro, isNormal, isWide, hasEmptyMagnification, hasUsefulDetail, detailDensity }
}

// ─── Resolution Measurement ──────────────────────────────

/**
 * Measure resolution sharpness properties
 * @example
 * measureResolution('const x: number = validate(input)') // { sharpness, ... }
 */
export function measureResolution(content: string): ResolutionMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const validations = countValidations(content)
  const imports = countImports(content)
  const functions = countFunctions(content)

  const sharpness = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 25 : 0) +
    (errors > 0 ? 20 : 0) +
    (validations > 0 ? 20 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (countTodos(content) === 0 ? 10 : 0),
  )))

  const hasDiffraction = imports > 5 && functions > 0 && loc / Math.max(1, functions) < 5
  const hasSphericalAberration = functions > 2 && types > 0 && errors === 0
  const hasComa = countConsole(content) > 0 && countExports(content) > 0
  const hasAstigmatism = types > 0 && types < functions

  const resolvingPower = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (sharpness * 0.4) +
    (errors > 0 ? 20 : 0) +
    (validations > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (countBranches(content) > 0 && errors > 0 ? 10 : 0),
  )))

  const contrast = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 30 : 0) +
    (errors > 0 ? 25 : 0) +
    (countConsole(content) === 0 ? 20 : 0) +
    (countTodos(content) === 0 ? 15 : 0) +
    (validations > 0 ? 10 : 0),
  )))

  return { sharpness, hasDiffraction, hasSphericalAberration, hasComa, hasAstigmatism, resolvingPower, contrast }
}

// ─── Aberration Measurement ──────────────────────────────

/**
 * Measure aberration distortion properties
 * @example
 * measureAberration('export function a() {} export class B {}') // { chromatic, ... }
 */
export function measureAberration(content: string): AberrationMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const consoleCount = countConsole(content)

  const exportTypes: string[] = []
  if (functions > 0) exportTypes.push('function')
  if (classes > 0) exportTypes.push('class')
  if (/\bexport\s+(const|let|var)\s/.test(content)) exportTypes.push('variable')
  if (/\bexport\s+(interface|type)\s/.test(content)) exportTypes.push('type')

  const chromatic = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exportTypes.length > 2 ? 30 : exportTypes.length > 1 ? 15 : 0) +
    (consoleCount > 0 ? 20 : 0) +
    (countTodos(content) > 0 ? 15 : 0) +
    (functions > 5 ? 15 : 0) +
    (classes > 2 ? 10 : 0) +
    (exports > 5 ? 10 : 0),
  )))

  const isCorrected = exportTypes.length <= 1 && consoleCount === 0 && countTodos(content) === 0
  const hasColorFringing = exportTypes.length > 2
  const hasBarrelDistortion = exports > 3 && imports < 2
  const hasPincushion = imports > 3 && exports < 2
  const fringeCount = Math.max(0, exportTypes.length - 1) + (consoleCount > 0 ? 1 : 0)
  const isMinimal = chromatic < 20

  return { chromatic, isCorrected, hasColorFringing, hasBarrelDistortion, hasPincushion, fringeCount, isMinimal }
}

// ─── Gathering Measurement ───────────────────────────────

/**
 * Measure light gathering properties
 * @example
 * measureGathering('import { x } from "y"; export function calc() {}') // { power, ... }
 */
export function measureGathering(content: string): GatheringMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const errors = countErrorHandling(content)

  const power = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (imports > 0 ? 15 : 0) +
    (types > 0 ? 20 : 0) +
    (jsdoc > 0 ? 20 : 0) +
    (comments > 0 ? 10 : 0) +
    (errors > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (countValidations(content) > 0 ? 10 : 0),
  )))

  const hasFieldStop = countValidations(content) > 0
  const hasEyepiece = countExports(content) > 0
  const hasFilter = countErrorHandling(content) > 0
  const hasFinder = jsdoc > 0 || comments > 2
  const hasCollimation = types > 0 && errors > 0

  const lightTransmission = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (hasEyepiece ? 20 : 0) +
    (hasFilter ? 20 : 0) +
    (hasCollimation ? 20 : 0) +
    (hasFinder ? 15 : 0) +
    (hasFieldStop ? 15 : 0) +
    (countConsole(content) === 0 ? 10 : 0),
  )))

  return { power, hasFieldStop, hasEyepiece, hasFilter, hasFinder, hasCollimation, lightTransmission }
}

// ─── Mount Measurement ───────────────────────────────────

/**
 * Measure mount stability properties
 * @example
 * measureMount('export function calc(): number { try { return 1 } catch { return 0 } }') // { isStable, ... }
 */
export function measureMount(content: string): MountMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const descriptive = countDescriptiveNames(content)

  const isStable = exports > 0 && types > 0 && errors > 0
  const isAligned = descriptive > 0 && types > 0
  const hasTracking = /@\w+|deprecated|version/i.test(content)
  const hasGoTo = /\bexport\s+default\b/.test(content) || (exports === 1 && countFunctions(content) >= 1)

  const alignmentScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 20 : 0) +
    (descriptive > 0 ? 15 : 0) +
    (countComments(content) > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0),
  )))

  return { isStable, isAligned, hasTracking, hasGoTo, alignmentScore }
}

// ─── Classification ──────────────────────────────────────

export function classifyCondition(qualityScore: number): ElementCondition {
  if (qualityScore >= 85) return 'hubble-quality'
  if (qualityScore >= 68) return 'research-grade'
  if (qualityScore >= 50) return 'observatory'
  if (qualityScore >= 32) return 'backyard-scope'
  if (qualityScore >= 15) return 'toy-telescope'
  return 'broken-lens'
}

export function classifyBayType(elements: LensElement[]): BayType {
  if (elements.length === 0) return 'dark-closet'
  const avg = elements.reduce((s, e) => s + e.qualityScore, 0) / elements.length
  if (avg >= 80) return 'professional-dome'
  if (avg >= 62) return 'campus-observatory'
  if (avg >= 45) return 'backyard-observatory'
  if (avg >= 28) return 'rooftop'
  if (avg >= 12) return 'window'
  return 'dark-closet'
}

export function classifyBayCondition(elements: LensElement[]): BayCondition {
  if (elements.length === 0) return 'opaque'
  const avg = elements.reduce((s, e) => s + e.qualityScore, 0) / elements.length
  if (avg >= 80) return 'crystal-clear'
  if (avg >= 62) return 'sharp'
  if (avg >= 45) return 'adequate'
  if (avg >= 28) return 'blurry'
  if (avg >= 12) return 'distorted'
  return 'opaque'
}

export function classifyAstronomerGrade(avgClarity: number): AstronomerGrade {
  if (avgClarity >= 80) return 'optical-engineer'
  if (avgClarity >= 65) return 'telescope-maker'
  if (avgClarity >= 48) return 'astronomer'
  if (avgClarity >= 32) return 'stargazer'
  if (avgClarity >= 16) return 'tourist'
  return 'blind'
}

// ─── Core Analysis ───────────────────────────────────────

/**
 * Analyze a single file as a lens element
 * @example
 * analyzeLensElement('export function calc() {}', 'calc.ts') // LensElement
 */
export function analyzeLensElement(content: string, filePath: string): LensElement {
  const lens = measureLens(content)
  const apertureDetail = measureAperture(content)
  const magnificationDetail = measureMagnification(content)
  const resolutionDetail = measureResolution(content)
  const aberrationDetail = measureAberration(content)
  const gathering = measureGathering(content)
  const mountDetail = measureMount(content)

  const focalLength = lens.focalLength
  const apertureVal = apertureDetail.diameter
  const magnificationVal = magnificationDetail.level
  const resolutionVal = resolutionDetail.resolvingPower
  const aberrationVal = aberrationDetail.chromatic
  const lightGatheringVal = gathering.power

  const loc = countLoc(content)
  const qualityScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (focalLength * 0.20) +
    (resolutionVal * 0.20) +
    (gathering.lightTransmission * 0.15) +
    (resolutionDetail.contrast * 0.15) +
    (mountDetail.alignmentScore * 0.15) +
    (100 - aberrationVal) * 0.15,
  )))

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    focalLength, aperture: apertureVal, magnification: magnificationVal,
    resolution: resolutionVal, aberration: aberrationVal, lightGathering: lightGatheringVal,
    lens, apertureDetail, magnificationDetail, resolutionDetail,
    aberrationDetail, gathering, mount: mountDetail,
    condition, qualityScore,
  }
}

// ─── Observatory Bay ─────────────────────────────────────

/**
 * Analyze a directory as an observatory bay
 * @example
 * analyzeObservatoryBay(elements, 'src') // ObservatoryBay
 */
export function analyzeObservatoryBay(elements: LensElement[], dirPath: string): ObservatoryBay {
  const avgFocalLength = elements.length === 0 ? 0 : Math.round(elements.reduce((s, e) => s + e.focalLength, 0) / elements.length)
  const avgResolution = elements.length === 0 ? 0 : Math.round(elements.reduce((s, e) => s + e.resolution, 0) / elements.length)
  const avgAberration = elements.length === 0 ? 0 : Math.round(elements.reduce((s, e) => s + e.aberration, 0) / elements.length)
  const hubbleCount = elements.filter(e => e.condition === 'hubble-quality').length
  const brokenCount = elements.filter(e => e.condition === 'broken-lens').length
  const focusedCount = elements.filter(e => e.lens.isFocused).length
  const distortedCount = elements.filter(e => e.lens.isDistorted).length

  return {
    directory: dirPath, elements,
    avgFocalLength, avgResolution, avgAberration,
    hubbleCount, brokenCount, focusedCount, distortedCount,
    bayType: classifyBayType(elements),
    condition: classifyBayCondition(elements),
  }
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate actionable recommendations
 * @example
 * generateRecommendations(elements, bays, observatory, stats) // string[]
 */
export function generateRecommendations(
  _elements: LensElement[],
  bays: ObservatoryBay[],
  observatory: Observatory,
  stats: TelescopeLensStats,
): string[] {
  const recs: string[] = []

  if (stats.brokenLensCount + stats.toyTelescopeCount > 0) {
    recs.push(`Blurry lenses: ${stats.brokenLensCount + stats.toyTelescopeCount} file(s) need better focus with exports and types`)
  }
  if (stats.distortedCount > stats.totalFiles * 0.3) {
    recs.push('High distortion ratio - add descriptive naming to clarify purpose')
  }
  if (stats.hasFilterCount === 0 && stats.totalFiles > 0) {
    recs.push('No filtering detected - add error handling to filter out bad inputs')
  }
  if (stats.blurredCount > 0) {
    recs.push(`Unfocused code: ${stats.blurredCount} file(s) lack exports, making purpose unclear`)
  }
  if (stats.correctedCount === 0 && stats.totalFiles > 0) {
    recs.push('No corrected aberrations - single-responsibility files are rare')
  }
  if (observatory.overallClarity >= 70) {
    recs.push('Crystal-clear codebase - excellent focus and resolution throughout')
  }
  if (stats.hasCollimationCount > stats.totalFiles * 0.5) {
    recs.push('Well-collimated code - types and error handling properly aligned')
  }
  if (bays.length > 1) {
    const darkBays = bays.filter(b => b.bayType === 'window' || b.bayType === 'dark-closet')
    if (darkBays.length > 0) {
      recs.push(`Dark bays: ${darkBays.map(b => b.directory).join(', ')} need better illumination`)
    }
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete telescope-lens result
 * @example
 * buildTelescopeLensResult(['a.ts'], ['export function a() {}'], {}) // TelescopeLensResult
 */
export function buildTelescopeLensResult(files: string[], contents: string[], _options: Record<string, unknown>): TelescopeLensResult {
  const elements: LensElement[] = files.map((file, i) => {
    const content = i < contents.length ? contents[i] : ''
    return analyzeLensElement(content ?? '', file)
  })

  const dirMap = new Map<string, LensElement[]>()
  for (const element of elements) {
    const parts = element.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(element) } else { dirMap.set(dir, [element]) }
  }

  const bays = Array.from(dirMap.entries()).map(([dir, dirElements]) =>
    analyzeObservatoryBay(dirElements, dir),
  )

  const totalFiles = elements.length
  const avgFocalLength = totalFiles === 0 ? 0 : Math.round(elements.reduce((s, e) => s + e.focalLength, 0) / totalFiles)
  const avgAperture = totalFiles === 0 ? 0 : Math.round(elements.reduce((s, e) => s + e.aperture, 0) / totalFiles)
  const avgMagnification = totalFiles === 0 ? 0 : Math.round(elements.reduce((s, e) => s + e.magnification, 0) / totalFiles)
  const avgResolution = totalFiles === 0 ? 0 : Math.round(elements.reduce((s, e) => s + e.resolution, 0) / totalFiles)
  const avgAberration = totalFiles === 0 ? 0 : Math.round(elements.reduce((s, e) => s + e.aberration, 0) / totalFiles)
  const avgLightGathering = totalFiles === 0 ? 0 : Math.round(elements.reduce((s, e) => s + e.lightGathering, 0) / totalFiles)
  const overallClarity = totalFiles === 0 ? 0 : Math.round(elements.reduce((s, e) => s + e.qualityScore, 0) / totalFiles)

  const observatory: Observatory = {
    avgFocalLength,
    avgResolution,
    avgAberration,
    avgLightGathering,
    isFocused: overallClarity >= 60,
    overallClarity,
  }

  const conditionCounts = { hubbleQuality: 0, researchGrade: 0, observatoryCount: 0, backyardScope: 0, toyTelescope: 0, brokenLens: 0 }
  const lensCounts = { achromatic: 0, apochromatic: 0, planAchromatic: 0, simple: 0, compound: 0, defective: 0 }

  for (const element of elements) {
    switch (element.condition) {
      case 'hubble-quality': conditionCounts.hubbleQuality++; break
      case 'research-grade': conditionCounts.researchGrade++; break
      case 'observatory': conditionCounts.observatoryCount++; break
      case 'backyard-scope': conditionCounts.backyardScope++; break
      case 'toy-telescope': conditionCounts.toyTelescope++; break
      case 'broken-lens': conditionCounts.brokenLens++; break
    }
    switch (element.lens.type) {
      case 'achromatic': lensCounts.achromatic++; break
      case 'apochromatic': lensCounts.apochromatic++; break
      case 'plan-achromatic': lensCounts.planAchromatic++; break
      case 'simple': lensCounts.simple++; break
      case 'compound': lensCounts.compound++; break
      case 'defective': lensCounts.defective++; break
    }
  }

  const clearest = totalFiles === 0 ? 'none' : elements.reduce((best, e) => e.focalLength > best.focalLength ? e : best).file
  const sharpest = totalFiles === 0 ? 'none' : elements.reduce((best, e) => e.resolution > best.resolution ? e : best).file
  const mostAberrated = totalFiles === 0 ? 'none' : elements.reduce((worst, e) => e.aberration > worst.aberration ? e : worst).file
  const bestFocused = totalFiles === 0 ? 'none' : elements.reduce((best, e) => e.lens.focusScore > best.lens.focusScore ? e : best).file
  const mostPowerful = totalFiles === 0 ? 'none' : elements.reduce((best, e) => e.lightGathering > best.lightGathering ? e : best).file

  const stats: TelescopeLensStats = {
    totalFiles,
    totalBays: bays.length,
    avgFocalLength,
    avgAperture,
    avgMagnification,
    avgResolution,
    avgAberration,
    avgLightGathering,
    hubbleQualityCount: conditionCounts.hubbleQuality,
    researchGradeCount: conditionCounts.researchGrade,
    observatoryCount: conditionCounts.observatoryCount,
    backyardScopeCount: conditionCounts.backyardScope,
    toyTelescopeCount: conditionCounts.toyTelescope,
    brokenLensCount: conditionCounts.brokenLens,
    achromaticCount: lensCounts.achromatic,
    apochromaticCount: lensCounts.apochromatic,
    simpleCount: lensCounts.simple,
    defectiveCount: lensCounts.defective,
    focusedCount: elements.filter(e => e.lens.isFocused).length,
    blurredCount: elements.filter(e => e.lens.isBlurred).length,
    distortedCount: elements.filter(e => e.lens.isDistorted).length,
    multipleFociCount: elements.filter(e => e.lens.hasMultipleFoci).length,
    correctedCount: elements.filter(e => e.aberrationDetail.isCorrected).length,
    hasFilterCount: elements.filter(e => e.gathering.hasFilter).length,
    hasCollimationCount: elements.filter(e => e.gathering.hasCollimation).length,
    isStableCount: elements.filter(e => e.mount.isStable).length,
    overallClarity,
    astronomerGrade: classifyAstronomerGrade(overallClarity),
    clearest,
    sharpest,
    mostAberrated,
    bestFocused,
    mostPowerful,
  }

  const recommendations = generateRecommendations(elements, bays, observatory, stats)

  return { elements, bays, observatory, stats, recommendations }
}
