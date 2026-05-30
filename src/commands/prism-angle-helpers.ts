// ─── Interfaces ──────────────────────────────────────────

export interface PerspectiveAngle {
  score: number
  isClear: boolean
  isDistorted: boolean
  blindSpots: string[]
  highlights: string[]
}

export type PrismMaterial = 'diamond' | 'glass' | 'crystal' | 'quartz' | 'plastic' | 'ice'
export type LightCondition = 'flawless-diamond' | 'clear-crystal' | 'good-glass' | 'cloudy' | 'frosted' | 'opaque'
export type BenchType = 'laboratory' | 'workshop' | 'classroom' | 'toy-store' | 'junk-shop' | 'darkroom'
export type BenchCondition = 'research-grade' | 'professional' | 'consumer' | 'budget' | 'defective' | 'broken'
export type OpticianGrade = 'master-optician' | 'optician' | 'glassblower' | 'lens-grinder' | 'apprentice' | 'blind'

export interface PrismMeasure {
  material: PrismMaterial
  clarity: number
  hasInclusions: boolean
  hasBubbles: boolean
  hasScratches: boolean
  isFlawless: boolean
  inclusionCount: number
  bubbleCount: number
  scratchCount: number
}

export interface SpectrumMeasure {
  colors: string[]
  isComplete: boolean
  hasMissingColors: boolean
  hasExtraColors: boolean
  hasUltraviolet: boolean
  hasInfrared: boolean
  missingColors: string[]
}

export interface RefractionMeasure {
  index: number
  isConsistent: boolean
  hasTotalReflection: boolean
  hasScattering: boolean
  hasAbsorption: boolean
  scatteringPoints: number
  absorptionPoints: number
}

export interface AngleMeasure {
  incidence: number
  deviation: number
  isNormalIncidence: boolean
  isOblique: boolean
  hasCriticalAngle: boolean
  criticalAnglePoints: string[]
}

export interface AberrationMeasure {
  lateral: number
  axial: number
  hasDistortion: boolean
  hasCurvature: boolean
  distortionPoints: string[]
  isMinimal: boolean
}

export interface LightRay {
  file: string
  refractionQuality: number
  dispersion: number
  angularAccuracy: number
  spectralCompleteness: number
  opticalClarity: number
  chromaticAberration: number
  perspectives: {
    user: PerspectiveAngle
    maintainer: PerspectiveAngle
    tester: PerspectiveAngle
    reviewer: PerspectiveAngle
    optimizer: PerspectiveAngle
    newcomer: PerspectiveAngle
  }
  prism: PrismMeasure
  spectrum: SpectrumMeasure
  refraction: RefractionMeasure
  angle: AngleMeasure
  aberration: AberrationMeasure
  condition: LightCondition
  qualityScore: number
}

export interface OpticalBench {
  directory: string
  rays: LightRay[]
  avgRefraction: number
  avgClarity: number
  avgAberration: number
  flawlessCount: number
  opaqueCount: number
  consistentCount: number
  benchType: BenchType
  condition: BenchCondition
}

export interface Laboratory {
  avgRefraction: number
  avgClarity: number
  avgAberration: number
  isConsistent: boolean
  overallClarity: number
}

export interface PrismAngleStats {
  totalFiles: number
  totalBenches: number
  avgRefractionQuality: number
  avgDispersion: number
  avgAngularAccuracy: number
  avgSpectralCompleteness: number
  avgOpticalClarity: number
  avgChromaticAberration: number
  flawlessDiamondCount: number
  clearCrystalCount: number
  goodGlassCount: number
  cloudyCount: number
  frostedCount: number
  opaqueCount: number
  diamondCount: number
  glassCount: number
  crystalCount: number
  plasticCount: number
  iceCount: number
  consistentCount: number
  scatteringCount: number
  absorptionCount: number
  hasUltravioletCount: number
  hasInfraredCount: number
  completeSpectrumCount: number
  minimalAberrationCount: number
  overallClarity: number
  opticianGrade: OpticianGrade
  clearest: string
  mostDistorted: string
  mostConsistent: string
  bestSpectrum: string
}

export interface PrismAngleResult {
  rays: LightRay[]
  benches: OpticalBench[]
  laboratory: Laboratory
  stats: PrismAngleStats
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
  const ternaryMatch = content.match(/\?\s*[^?]/g)
  if (ternaryMatch) count += ternaryMatch.length
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

export function countTestIndicators(content: string): number {
  const matches = content.match(/\b(describe|it|test|expect|beforeEach|afterEach|beforeAll|afterAll)\s*[\(.]/g)
  return matches ? matches.length : 0
}

// ─── Prism Measurement ───────────────────────────────────

/**
 * Measure prism material, clarity, and flaws
 * @example
 * measurePrism('export function calc(x: number): number { return x }') // { material, clarity, ... }
 */
export function measurePrism(content: string): PrismMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const descriptive = countDescriptiveNames(content)
  const todos = countTodos(content)
  const consoleCount = countConsole(content)

  const clarity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 15 : 0) +
    (functions > 0 ? 10 : 0) +
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (comments > 0 ? 10 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (descriptive > 0 ? 10 : 0) +
    (todos === 0 ? 5 : 0),
  )))

  let material: PrismMaterial = 'ice'
  if (clarity >= 85) material = 'diamond'
  else if (clarity >= 70) material = 'crystal'
  else if (clarity >= 55) material = 'glass'
  else if (clarity >= 40) material = 'quartz'
  else if (clarity >= 20) material = 'plastic'

  const inclusionCount = todos + consoleCount
  const hasInclusions = inclusionCount > 0
  const bubbleCount = functions > 0 && types === 0 ? functions : 0
  const hasBubbles = bubbleCount > 0
  const scratchCount = exports > 0 && comments === 0 ? exports : 0
  const hasScratches = scratchCount > 0
  const isFlawless = clarity >= 85 && !hasInclusions && !hasBubbles && !hasScratches

  return { material, clarity, hasInclusions, hasBubbles, hasScratches, isFlawless, inclusionCount, bubbleCount, scratchCount }
}

// ─── Spectrum Measurement ────────────────────────────────

/**
 * Measure spectral completeness
 * @example
 * measureSpectrum('export function calc() {}') // { colors, isComplete, ... }
 */
export function measureSpectrum(content: string): SpectrumMeasure {
  const loc = countLoc(content)
  const colors: string[] = []

  if (countFunctions(content) > 0) colors.push('functions')
  if (countClasses(content) > 0) colors.push('classes')
  if (countImports(content) > 0) colors.push('imports')
  if (countExports(content) > 0) colors.push('exports')
  if (countTypeAnnotations(content) > 0) colors.push('types')
  if (countErrorHandling(content) > 0) colors.push('error-handling')
  if (countComments(content) > 0) colors.push('comments')
  if (countJSDoc(content) > 0) colors.push('jsdoc')
  if (countBranches(content) > 0) colors.push('branches')
  if (countDescriptiveNames(content) > 0) colors.push('descriptive-names')
  if (countTestIndicators(content) > 0) colors.push('tests')

  const allExpected = ['functions', 'exports', 'types', 'error-handling', 'comments']
  const missingColors = loc === 0 ? [] : allExpected.filter(c => !colors.includes(c))
  const hasMissingColors = missingColors.length > 0
  const hasExtraColors = colors.length > 8
  const isComplete = loc === 0 ? false : missingColors.length === 0
  const hasUltraviolet = countTodos(content) > 0
  const hasInfrared = /\bdeprecated\b|\blegacy\b|\b@deprecated\b/i.test(content)

  return { colors, isComplete, hasMissingColors, hasExtraColors, hasUltraviolet, hasInfrared, missingColors }
}

// ─── Refraction Measurement ──────────────────────────────

/**
 * Measure refraction index and scattering
 * @example
 * measureRefraction('if (a) { if (b) { x } }') // { index, hasScattering, ... }
 */
export function measureRefraction(content: string): RefractionMeasure {
  const loc = countLoc(content)
  const branches = countBranches(content)
  const nesting = maxNesting(content)
  const errors = countErrorHandling(content)
  const functions = countFunctions(content)

  const index = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (branches > 0 ? 20 : 0) +
    (nesting > 1 ? 15 : 0) +
    (functions > 0 ? 15 : 0) +
    (loc > 20 ? 10 : 0) +
    (errors === 0 && branches > 0 ? 20 : 0) +
    (nesting > 3 ? 20 : 0),
  )))

  const isConsistent = branches === 0 || errors > 0
  const hasTotalReflection = loc > 0 && countExports(content) === 0 && countImports(content) === 0
  const hasScattering = nesting > 3
  const hasAbsorption = branches > 0 && errors === 0
  const scatteringPoints = hasScattering ? Math.max(0, nesting - 3) : 0
  const absorptionPoints = hasAbsorption ? branches : 0

  return { index, isConsistent, hasTotalReflection, hasScattering, hasAbsorption, scatteringPoints, absorptionPoints }
}

// ─── Angle Measurement ───────────────────────────────────

/**
 * Measure angle of incidence and deviation
 * @example
 * measureAngle('export function calc(x: number): number { return x }') // { incidence, deviation, ... }
 */
export function measureAngle(content: string): AngleMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const functions = countFunctions(content)
  const imports = countImports(content)
  const branches = countBranches(content)

  const incidence = loc === 0 ? 0 : Math.min(90, Math.max(0, Math.round(
    (exports > 0 ? 20 : 0) +
    (types > 0 ? 25 : 0) +
    (functions > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0) +
    (loc > 5 ? 10 : 0) +
    (branches > 0 ? 10 : 0),
  )))

  const deviation = loc === 0 ? 0 : Math.min(90, Math.max(0, Math.round(
    (exports === 0 ? 20 : 0) +
    (types === 0 ? 20 : 0) +
    (functions === 0 ? 15 : 0) +
    (imports === 0 ? 10 : 0) +
    (branches > 5 ? 15 : 0) +
    (maxNesting(content) > 3 ? 20 : 0),
  )))

  const isNormalIncidence = incidence >= 70
  const isOblique = incidence < 40 && loc > 0
  const criticalAnglePoints: string[] = []
  if (exports > 0 && types === 0) criticalAnglePoints.push('untyped-exports')
  if (functions > 0 && countErrorHandling(content) === 0) criticalAnglePoints.push('no-error-handling')
  if (branches > 5) criticalAnglePoints.push('high-branch-count')
  if (maxNesting(content) > 3) criticalAnglePoints.push('deep-nesting')
  const hasCriticalAngle = criticalAnglePoints.length > 0

  return { incidence, deviation, isNormalIncidence, isOblique, hasCriticalAngle, criticalAnglePoints }
}

// ─── Aberration Measurement ──────────────────────────────

/**
 * Measure chromatic aberration
 * @example
 * measureAberration('function a() {} function b() {}') // { lateral, axial, ... }
 */
export function measureAberration(content: string): AberrationMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const exports = countExports(content)
  const branches = countBranches(content)
  const errors = countErrorHandling(content)

  const lateral = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types === 0 && functions > 0 ? 25 : 0) +
    (comments === 0 && exports > 0 ? 25 : 0) +
    (errors === 0 && branches > 0 ? 25 : 0) +
    (functions > 5 ? 25 : 0),
  )))

  const axial = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (maxNesting(content) > 3 ? 30 : 0) +
    (branches > 5 ? 25 : 0) +
    (functions > 3 && types === 0 ? 25 : 0) +
    (exports > 0 && countJSDoc(content) === 0 ? 20 : 0),
  )))

  const distortionPoints: string[] = []
  if (types === 0 && functions > 0) distortionPoints.push('untyped-functions')
  if (comments === 0 && exports > 0) distortionPoints.push('undocumented-exports')
  if (errors === 0 && branches > 0) distortionPoints.push('unhandled-branches')

  const hasDistortion = distortionPoints.length > 0
  const hasCurvature = loc > 0 && Math.abs(lateral - axial) > 30
  const isMinimal = lateral < 15 && axial < 15

  return { lateral, axial, hasDistortion, hasCurvature, distortionPoints, isMinimal }
}

// ─── Perspective Evaluation ──────────────────────────────

/**
 * Evaluate a single perspective
 * @example
 * evaluatePerspective('export function calc() {}', 'user') // { score, isClear, ... }
 */
export function evaluatePerspective(content: string, perspective: string): PerspectiveAngle {
  const loc = countLoc(content)
  if (loc === 0) {
    return { score: 0, isClear: false, isDistorted: true, blindSpots: ['empty-file'], highlights: [] }
  }

  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const jsdoc = countJSDoc(content)
  const descriptive = countDescriptiveNames(content)
  const tests = countTestIndicators(content)
  const todos = countTodos(content)

  let score = 0
  const blindSpots: string[] = []
  const highlights: string[] = []
  const branches = countBranches(content)
  const classes = countClasses(content)
  const comments = countComments(content)
  const functions = countFunctions(content)
  const imports = countImports(content)

  switch (perspective) {
    case 'user': {
      score = Math.min(100, Math.max(0, Math.round(
        (exports > 0 ? 25 : 0) +
        (jsdoc > 0 ? 20 : 0) +
        (descriptive > 0 ? 20 : 0) +
        (types > 0 ? 15 : 0) +
        (errors > 0 ? 10 : 0) +
        (todos === 0 ? 10 : 0),
      )))
      if (exports === 0) blindSpots.push('no-public-api')
      if (jsdoc === 0) blindSpots.push('no-documentation')
      if (types === 0) blindSpots.push('no-type-signatures')
      if (exports > 0) highlights.push('has-exports')
      if (jsdoc > 0) highlights.push('documented-api')
      if (descriptive > 0) highlights.push('descriptive-names')
      break
    }
    case 'maintainer': {
      score = Math.min(100, Math.max(0, Math.round(
        (comments > 0 ? 20 : 0) +
        (errors > 0 ? 20 : 0) +
        (types > 0 ? 15 : 0) +
        (branches < 10 ? 15 : 0) +
        (maxNesting(content) <= 3 ? 15 : 0) +
        (descriptive > 0 ? 15 : 0),
      )))
      if (errors === 0 && branches > 0) blindSpots.push('no-error-handling')
      if (maxNesting(content) > 3) blindSpots.push('deep-nesting')
      if (todos > 0) blindSpots.push('has-todos')
      if (comments > 0) highlights.push('commented')
      if (errors > 0) highlights.push('error-handling')
      if (types > 0) highlights.push('typed')
      break
    }
    case 'tester': {
      score = Math.min(100, Math.max(0, Math.round(
        (tests > 0 ? 30 : 0) +
        (exports > 0 ? 15 : 0) +
        (functions > 0 ? 15 : 0) +
        (types > 0 ? 15 : 0) +
        (errors > 0 ? 15 : 0) +
        (branches > 0 ? 10 : 0),
      )))
      if (tests === 0) blindSpots.push('no-tests')
      if (exports === 0) blindSpots.push('no-exports')
      if (errors === 0 && functions > 0) blindSpots.push('untested-errors')
      if (tests > 0) highlights.push('has-tests')
      if (exports > 0) highlights.push('exported-functions')
      break
    }
    case 'reviewer': {
      score = Math.min(100, Math.max(0, Math.round(
        (jsdoc > 0 ? 20 : 0) +
        (types > 0 ? 20 : 0) +
        (comments > 0 ? 15 : 0) +
        (descriptive > 0 ? 15 : 0) +
        (errors > 0 ? 15 : 0) +
        (imports > 0 ? 15 : 0),
      )))
      if (jsdoc === 0) blindSpots.push('no-jsdoc')
      if (types === 0) blindSpots.push('no-types')
      if (comments === 0 && loc > 10) blindSpots.push('no-comments')
      if (jsdoc > 0) highlights.push('well-documented')
      if (types > 0) highlights.push('type-annotated')
      if (descriptive > 0) highlights.push('readable-names')
      break
    }
    case 'optimizer': {
      score = Math.min(100, Math.max(0, Math.round(
        (functions > 0 && functions <= 5 ? 20 : 0) +
        (loc <= 50 ? 15 : 0) +
        (imports > 0 ? 15 : 0) +
        (classes > 0 ? 10 : 0) +
        (maxNesting(content) <= 2 ? 20 : 0) +
        (branches <= 5 ? 20 : 0),
      )))
      if (loc > 100) blindSpots.push('large-file')
      if (maxNesting(content) > 3) blindSpots.push('deep-nesting')
      if (branches > 10) blindSpots.push('many-branches')
      if (functions <= 5) highlights.push('few-functions')
      if (maxNesting(content) <= 2) highlights.push('shallow-nesting')
      break
    }
    case 'newcomer': {
      score = Math.min(100, Math.max(0, Math.round(
        (comments > 0 ? 20 : 0) +
        (jsdoc > 0 ? 20 : 0) +
        (descriptive > 0 ? 20 : 0) +
        (maxNesting(content) <= 2 ? 15 : 0) +
        (functions <= 5 ? 15 : 0) +
        (exports > 0 ? 10 : 0),
      )))
      if (jsdoc === 0) blindSpots.push('no-api-docs')
      if (comments === 0) blindSpots.push('no-explanations')
      if (maxNesting(content) > 3) blindSpots.push('complex-nesting')
      if (comments > 0) highlights.push('explained')
      if (descriptive > 0) highlights.push('self-documenting')
      if (functions <= 5) highlights.push('simple-structure')
      break
    }
    default: {
      score = 0
      blindSpots.push('unknown-perspective')
    }
  }

  const isClear = score >= 60
  const isDistorted = score < 40

  return { score, isClear, isDistorted, blindSpots, highlights }
}

// ─── Condition Classification ────────────────────────────

export function classifyCondition(qualityScore: number): LightCondition {
  if (qualityScore >= 85) return 'flawless-diamond'
  if (qualityScore >= 68) return 'clear-crystal'
  if (qualityScore >= 50) return 'good-glass'
  if (qualityScore >= 32) return 'cloudy'
  if (qualityScore >= 15) return 'frosted'
  return 'opaque'
}

export function classifyBenchType(rays: LightRay[]): BenchType {
  if (rays.length === 0) return 'darkroom'
  const avg = rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  if (avg >= 80) return 'laboratory'
  if (avg >= 60) return 'workshop'
  if (avg >= 42) return 'classroom'
  if (avg >= 25) return 'toy-store'
  if (avg >= 10) return 'junk-shop'
  return 'darkroom'
}

export function classifyBenchCondition(rays: LightRay[]): BenchCondition {
  if (rays.length === 0) return 'broken'
  const avg = rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  if (avg >= 80) return 'research-grade'
  if (avg >= 60) return 'professional'
  if (avg >= 42) return 'consumer'
  if (avg >= 25) return 'budget'
  if (avg >= 10) return 'defective'
  return 'broken'
}

export function classifyOpticianGrade(avgClarity: number): OpticianGrade {
  if (avgClarity >= 80) return 'master-optician'
  if (avgClarity >= 65) return 'optician'
  if (avgClarity >= 48) return 'glassblower'
  if (avgClarity >= 32) return 'lens-grinder'
  if (avgClarity >= 16) return 'apprentice'
  return 'blind'
}

// ─── Core Analysis ───────────────────────────────────────

/**
 * Analyze a single file as a light ray
 * @example
 * analyzeLightRay('export function calc() {}', 'calc.ts') // LightRay
 */
export function analyzeLightRay(content: string, filePath: string): LightRay {
  const prism = measurePrism(content)
  const spectrum = measureSpectrum(content)
  const refraction = measureRefraction(content)
  const angle = measureAngle(content)
  const aberration = measureAberration(content)

  const perspectives = {
    user: evaluatePerspective(content, 'user'),
    maintainer: evaluatePerspective(content, 'maintainer'),
    tester: evaluatePerspective(content, 'tester'),
    reviewer: evaluatePerspective(content, 'reviewer'),
    optimizer: evaluatePerspective(content, 'optimizer'),
    newcomer: evaluatePerspective(content, 'newcomer'),
  }

  const perspectiveScores = [
    perspectives.user.score,
    perspectives.maintainer.score,
    perspectives.tester.score,
    perspectives.reviewer.score,
    perspectives.optimizer.score,
    perspectives.newcomer.score,
  ]
  const avgPerspective = perspectiveScores.reduce((a, b) => a + b, 0) / perspectiveScores.length
  const maxPerspective = Math.max(...perspectiveScores)
  const minPerspective = Math.min(...perspectiveScores)

  const refractionQuality = Math.round(avgPerspective)
  const dispersion = Math.min(100, Math.round(maxPerspective - minPerspective))
  const angularAccuracy = angle.incidence
  const spectralCompleteness = countLoc(content) === 0 ? 0 : spectrum.isComplete ? 100 : Math.max(0, 100 - spectrum.missingColors.length * 20)
  const opticalClarity = prism.clarity
  const chromaticAberration = Math.round((aberration.lateral + aberration.axial) / 2)

  const qualityScore = countLoc(content) === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (refractionQuality * 0.25) +
    (angularAccuracy * 0.20) +
    (spectralCompleteness * 0.15) +
    (opticalClarity * 0.20) +
    ((100 - chromaticAberration) * 0.10) +
    ((100 - dispersion) * 0.10),
  )))

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    refractionQuality,
    dispersion,
    angularAccuracy,
    spectralCompleteness,
    opticalClarity,
    chromaticAberration,
    perspectives,
    prism,
    spectrum,
    refraction,
    angle,
    aberration,
    condition,
    qualityScore,
  }
}

// ─── Optical Bench ───────────────────────────────────────

/**
 * Analyze a directory as an optical bench
 * @example
 * analyzeOpticalBench(rays, 'src') // OpticalBench
 */
export function analyzeOpticalBench(rays: LightRay[], dirPath: string): OpticalBench {
  const avgRefraction = rays.length === 0 ? 0 : Math.round(rays.reduce((s, r) => s + r.refractionQuality, 0) / rays.length)
  const avgClarity = rays.length === 0 ? 0 : Math.round(rays.reduce((s, r) => s + r.opticalClarity, 0) / rays.length)
  const avgAberration = rays.length === 0 ? 0 : Math.round(rays.reduce((s, r) => s + r.chromaticAberration, 0) / rays.length)
  const flawlessCount = rays.filter(r => r.condition === 'flawless-diamond').length
  const opaqueCount = rays.filter(r => r.condition === 'opaque').length
  const consistentCount = rays.filter(r => r.refraction.isConsistent).length

  const benchType = classifyBenchType(rays)
  const condition = classifyBenchCondition(rays)

  return {
    directory: dirPath,
    rays,
    avgRefraction,
    avgClarity,
    avgAberration,
    flawlessCount,
    opaqueCount,
    consistentCount,
    benchType,
    condition,
  }
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate actionable recommendations
 * @example
 * generateRecommendations(rays, benches, lab, stats) // string[]
 */
export function generateRecommendations(
  _rays: LightRay[],
  benches: OpticalBench[],
  laboratory: Laboratory,
  stats: PrismAngleStats,
): string[] {
  const recs: string[] = []

  if (stats.opaqueCount > 0) {
    recs.push(`Opaque files: ${stats.opaqueCount} file(s) need complete restructuring for clarity`)
  }
  if (stats.cloudyCount + stats.frostedCount > stats.totalFiles / 2) {
    recs.push('More than half the codebase has low clarity - focus on documentation and typing')
  }
  if (stats.avgChromaticAberration > 50) {
    recs.push('High chromatic aberration - reduce perspective-dependent behavior with consistent patterns')
  }
  if (stats.scatteringCount > stats.totalFiles * 0.3) {
    recs.push(`Scattering detected in ${stats.scatteringCount} files - simplify control flow`)
  }
  if (stats.hasUltravioletCount > 0) {
    recs.push(`Hidden behavior: ${stats.hasUltravioletCount} file(s) contain TODOs/FIXMEs`)
  }
  if (stats.hasInfraredCount > 0) {
    recs.push(`Legacy behavior: ${stats.hasInfraredCount} file(s) contain deprecated patterns`)
  }
  if (!laboratory.isConsistent) {
    recs.push('Inconsistent perspectives - code looks different to different stakeholders')
  }
  if (laboratory.overallClarity >= 70) {
    recs.push('Well-focused codebase - good optical clarity across perspectives')
  }
  if (stats.minimalAberrationCount > stats.totalFiles * 0.5) {
    recs.push('Minimal aberration - very consistent behavior from all angles')
  }
  if (benches.length > 1) {
    const darkBenches = benches.filter(b => b.benchType === 'darkroom' || b.benchType === 'junk-shop')
    if (darkBenches.length > 0) {
      recs.push(`Low-quality benches: ${darkBenches.map(b => b.directory).join(', ')} need attention`)
    }
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete prism-angle result
 * @example
 * buildPrismAngleResult(['a.ts'], ['export function a() {}'], {}) // PrismAngleResult
 */
export function buildPrismAngleResult(files: string[], contents: string[], _options: Record<string, unknown>): PrismAngleResult {
  const rays: LightRay[] = files.map((file, i) => {
    const content = i < contents.length ? contents[i] : ''
    return analyzeLightRay(content ?? '', file)
  })

  const dirMap = new Map<string, LightRay[]>()
  for (const ray of rays) {
    const parts = ray.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(ray) } else { dirMap.set(dir, [ray]) }
  }

  const benches = Array.from(dirMap.entries()).map(([dir, dirRays]) =>
    analyzeOpticalBench(dirRays, dir),
  )

  const totalFiles = rays.length
  const avgRefractionQuality = totalFiles === 0 ? 0 : Math.round(rays.reduce((s, r) => s + r.refractionQuality, 0) / totalFiles)
  const avgDispersion = totalFiles === 0 ? 0 : Math.round(rays.reduce((s, r) => s + r.dispersion, 0) / totalFiles)
  const avgAngularAccuracy = totalFiles === 0 ? 0 : Math.round(rays.reduce((s, r) => s + r.angularAccuracy, 0) / totalFiles)
  const avgSpectralCompleteness = totalFiles === 0 ? 0 : Math.round(rays.reduce((s, r) => s + r.spectralCompleteness, 0) / totalFiles)
  const avgOpticalClarity = totalFiles === 0 ? 0 : Math.round(rays.reduce((s, r) => s + r.opticalClarity, 0) / totalFiles)
  const avgChromaticAberration = totalFiles === 0 ? 0 : Math.round(rays.reduce((s, r) => s + r.chromaticAberration, 0) / totalFiles)

  const laboratory: Laboratory = {
    avgRefraction: avgRefractionQuality,
    avgClarity: avgOpticalClarity,
    avgAberration: avgChromaticAberration,
    isConsistent: avgDispersion < 30,
    overallClarity: avgOpticalClarity,
  }

  const conditionCounts = { flawlessDiamond: 0, clearCrystal: 0, goodGlass: 0, cloudy: 0, frosted: 0, opaque: 0 }
  const materialCounts = { diamond: 0, glass: 0, crystal: 0, quartz: 0, plastic: 0, ice: 0 }

  for (const ray of rays) {
    switch (ray.condition) {
      case 'flawless-diamond': conditionCounts.flawlessDiamond++; break
      case 'clear-crystal': conditionCounts.clearCrystal++; break
      case 'good-glass': conditionCounts.goodGlass++; break
      case 'cloudy': conditionCounts.cloudy++; break
      case 'frosted': conditionCounts.frosted++; break
      case 'opaque': conditionCounts.opaque++; break
    }
    switch (ray.prism.material) {
      case 'diamond': materialCounts.diamond++; break
      case 'glass': materialCounts.glass++; break
      case 'crystal': materialCounts.crystal++; break
      case 'quartz': materialCounts.quartz++; break
      case 'plastic': materialCounts.plastic++; break
      case 'ice': materialCounts.ice++; break
    }
  }

  const consistentCount = rays.filter(r => r.refraction.isConsistent).length
  const scatteringCount = rays.filter(r => r.refraction.hasScattering).length
  const absorptionCount = rays.filter(r => r.refraction.hasAbsorption).length
  const hasUltravioletCount = rays.filter(r => r.spectrum.hasUltraviolet).length
  const hasInfraredCount = rays.filter(r => r.spectrum.hasInfrared).length
  const completeSpectrumCount = rays.filter(r => r.spectrum.isComplete).length
  const minimalAberrationCount = rays.filter(r => r.aberration.isMinimal).length

  const clearest = totalFiles === 0 ? 'none' :
    rays.reduce((best, r) => r.opticalClarity > best.opticalClarity ? r : best).file
  const mostDistorted = totalFiles === 0 ? 'none' :
    rays.reduce((worst, r) => r.chromaticAberration > worst.chromaticAberration ? r : worst).file
  const mostConsistent = totalFiles === 0 ? 'none' :
    rays.reduce((best, r) => r.dispersion < best.dispersion ? r : best).file
  const bestSpectrum = totalFiles === 0 ? 'none' :
    rays.reduce((best, r) => r.spectralCompleteness > best.spectralCompleteness ? r : best).file

  const stats: PrismAngleStats = {
    totalFiles,
    totalBenches: benches.length,
    avgRefractionQuality,
    avgDispersion,
    avgAngularAccuracy,
    avgSpectralCompleteness,
    avgOpticalClarity,
    avgChromaticAberration,
    flawlessDiamondCount: conditionCounts.flawlessDiamond,
    clearCrystalCount: conditionCounts.clearCrystal,
    goodGlassCount: conditionCounts.goodGlass,
    cloudyCount: conditionCounts.cloudy,
    frostedCount: conditionCounts.frosted,
    opaqueCount: conditionCounts.opaque,
    diamondCount: materialCounts.diamond,
    glassCount: materialCounts.glass,
    crystalCount: materialCounts.crystal,
    plasticCount: materialCounts.plastic,
    iceCount: materialCounts.ice,
    consistentCount,
    scatteringCount,
    absorptionCount,
    hasUltravioletCount,
    hasInfraredCount,
    completeSpectrumCount,
    minimalAberrationCount,
    overallClarity: avgOpticalClarity,
    opticianGrade: classifyOpticianGrade(avgOpticalClarity),
    clearest,
    mostDistorted,
    mostConsistent,
    bestSpectrum,
  }

  const recommendations = generateRecommendations(rays, benches, laboratory, stats)

  return { rays, benches, laboratory, stats, recommendations }
}
