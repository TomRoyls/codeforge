// ─── Interfaces ──────────────────────────────────────────────────────────────

export type ChamberType = 'mandala' | 'star' | 'flower' | 'crystal' | 'geometric' | 'chaotic'
export type ChamberCondition = 'breathtaking' | 'beautiful' | 'pleasant' | 'mediocre' | 'ugly' | 'broken'
export type OpticianGrade = 'master-optician' | 'optician' | 'glassblower' | 'apprentice' | 'child' | 'blind'

export interface PerspectiveView {
  score: number
  pattern: string
  isClear: boolean
  isBeautiful: boolean
  isDistorted: boolean
  issues: string[]
  highlights: string[]
}

export interface PatternInfo {
  hasSymmetry: boolean
  hasRepetition: boolean
  hasReflection: boolean
  hasRotation: boolean
  hasFractal: boolean
  hasDistortion: boolean
  distortionPoints: string[]
}

export interface ColorProfile {
  richness: number
  harmony: number
  contrast: number
  isMonochrome: boolean
  isPolychrome: boolean
  isClashing: boolean
}

export interface KaleidoscopeShard {
  file: string
  rotation: number
  symmetry: number
  alignment: number
  beauty: number
  perspectives: {
    structural: PerspectiveView
    behavioral: PerspectiveView
    logical: PerspectiveView
    stylistic: PerspectiveView
    semantic: PerspectiveView
    relational: PerspectiveView
  }
  dominantPerspective: string
  weakestPerspective: string
  perspectiveVariance: number
  pattern: PatternInfo
  color: ColorProfile
  qualityScore: number
}

export interface KaleidoscopeChamber {
  directory: string
  shards: KaleidoscopeShard[]
  avgSymmetry: number
  avgAlignment: number
  avgBeauty: number
  avgPerspectiveVariance: number
  dominantPerspective: string
  weakPerspective: string
  harmoniousCount: number
  clashingCount: number
  chamberType: ChamberType
  chamberBeauty: number
  condition: ChamberCondition
}

export interface KaleidoscopeTurnStats {
  totalFiles: number
  totalChambers: number
  avgSymmetry: number
  avgAlignment: number
  avgBeauty: number
  avgPerspectiveVariance: number
  avgStructuralScore: number
  avgBehavioralScore: number
  avgLogicalScore: number
  avgStylisticScore: number
  avgSemanticScore: number
  avgRelationalScore: number
  harmoniousFiles: number
  clashingFiles: number
  monochromeFiles: number
  polychromeFiles: number
  symmetryFiles: number
  distortionFiles: number
  mandalaChambers: number
  chaoticChambers: number
  breathtakingChambers: number
  brokenChambers: number
  overallSymmetry: number
  opticianGrade: OpticianGrade
  mostSymmetrical: string
  leastSymmetrical: string
  mostBeautiful: string
  bestFromAllAngles: string
}

export interface KaleidoscopeTurnResult {
  shards: KaleidoscopeShard[]
  chambers: KaleidoscopeChamber[]
  overallSymmetry: number
  stats: KaleidoscopeTurnStats
  recommendations: string[]
}

// ─── Content Primitives ──────────────────────────────────────────────────────

/**
 * Count lines of code
 * @example
 * countLoc('const x = 1\nconst y = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count imports
 * @example
 * countImports('import { x } from "y"') // 1
 */
export function countImports(content: string): number {
  return (content.match(/^import\s+/gm) ?? []).length
}

/**
 * Count exports
 * @example
 * countExports('export function a() {}') // 1
 */
export function countExports(content: string): number {
  return (content.match(/\bexport\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+/g) ?? []).length
}

/**
 * Count functions
 * @example
 * countFunctions('function a() {}') // 1
 */
export function countFunctions(content: string): number {
  return (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) ?? []).length
}

/**
 * Count error handling
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{|\bcatch\s*\(|\.catch\s*\(|\bthrow\s+/g) ?? []).length
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)/g) ?? []).length
}

/**
 * Count branches
 * @example
 * countBranches('if (a) {}') // 1
 */
export function countBranches(content: string): number {
  return (content.match(/\bif\s*\(|\?\s*[^?]\s*:|\bswitch\s*\(/g) ?? []).length
}

/**
 * Count max nesting depth
 * @example
 * maxNesting('{{{}}}') // 3
 */
export function maxNesting(content: string): number {
  let max = 0
  let cur = 0
  for (const ch of content) {
    if (ch === '{') { cur++; if (cur > max) max = cur }
    else if (ch === '}') { cur = Math.max(0, cur - 1) }
  }
  return max
}

/**
 * Count console statements
 * @example
 * countConsole('console.log("x")') // 1
 */
export function countConsole(content: string): number {
  return (content.match(/console\.\w+\s*\(/g) ?? []).length
}

/**
 * Count comments
 * @example
 * countComments('// hello') // 1
 */
export function countComments(content: string): number {
  return (content.match(/\/\//g) ?? []).length + (content.match(/\/\*/g) ?? []).length
}

/**
 * Count TODO markers
 * @example
 * countTodos('TODO: fix') // 1
 */
export function countTodos(content: string): number {
  return (content.match(/TODO|FIXME|HACK|XXX/gi) ?? []).length
}

/**
 * Count abstraction layers (classes, interfaces, types)
 * @example
 * countAbstractions('class A {} interface B {}') // 2
 */
export function countAbstractions(content: string): number {
  return (content.match(/\bclass\s+\w|\binterface\s+\w|\btype\s+\w+\s*=/g) ?? []).length
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify chamber type from shard averages
 * @example
 * classifyChamberType(85, 80) // 'mandala'
 */
export function classifyChamberType(avgSymmetry: number, avgBeauty: number): ChamberType {
  if (avgSymmetry >= 80 && avgBeauty >= 70) return 'mandala'
  if (avgSymmetry >= 65 && avgBeauty >= 60) return 'star'
  if (avgBeauty >= 60 && avgSymmetry >= 40) return 'flower'
  if (avgSymmetry >= 60 && avgBeauty < 50) return 'crystal'
  if (avgSymmetry >= 30) return 'geometric'
  return 'chaotic'
}

/**
 * Classify chamber condition from beauty score
 * @example
 * classifyChamberCondition(90) // 'breathtaking'
 */
export function classifyChamberCondition(beauty: number): ChamberCondition {
  if (beauty >= 85) return 'breathtaking'
  if (beauty >= 70) return 'beautiful'
  if (beauty >= 55) return 'pleasant'
  if (beauty >= 35) return 'mediocre'
  if (beauty >= 15) return 'ugly'
  return 'broken'
}

/**
 * Classify optician grade from average symmetry
 * @example
 * classifyOpticianGrade(85) // 'master-optician'
 */
export function classifyOpticianGrade(avgSymmetry: number): OpticianGrade {
  if (avgSymmetry >= 80) return 'master-optician'
  if (avgSymmetry >= 65) return 'optician'
  if (avgSymmetry >= 45) return 'glassblower'
  if (avgSymmetry >= 30) return 'apprentice'
  if (avgSymmetry >= 15) return 'child'
  return 'blind'
}

// ─── Perspective Analysis ────────────────────────────────────────────────────

/**
 * Analyze one perspective view of code
 * @example
 * analyzePerspectiveView('export function a() {}', 'structural') // PerspectiveView
 */
export function analyzePerspectiveView(content: string, perspective: string): PerspectiveView {
  const loc = countLoc(content)
  const issues: string[] = []
  const highlights: string[] = []

  let score = 0
  let pattern = 'empty'
  let isClear = false
  let isBeautiful = false
  let isDistorted = false

  if (loc === 0) {
    return { score: 0, pattern: 'empty', isClear: false, isBeautiful: false, isDistorted: false, issues: ['empty file'], highlights: [] }
  }

  switch (perspective) {
    case 'structural': {
      const exports = countExports(content)
      const imports = countImports(content)
      const abstractions = countAbstractions(content)
      const funcs = countFunctions(content)

      score = Math.min(100, Math.round(
        (exports > 0 ? 20 : 0) +
        (imports > 0 ? 15 : 0) +
        (abstractions > 0 ? 20 : 0) +
        (funcs > 0 ? 15 : 0) +
        (maxNesting(content) <= 3 ? 15 : maxNesting(content) <= 5 ? 8 : 0) +
        (countComments(content) > 0 ? 15 : 0),
      ))

      pattern = abstractions > 2 ? 'complex-architecture' : exports > 0 ? 'modular' : 'monolithic'
      if (maxNesting(content) > 5) issues.push('deeply nested structure')
      if (exports === 0 && loc > 20) issues.push('no exports in large file')
      if (abstractions > 0) highlights.push('has abstraction layers')
      if (exports > 0 && imports > 0) highlights.push('well-connected module')

      isClear = exports > 0 || abstractions > 0
      isBeautiful = score >= 70
      isDistorted = maxNesting(content) > 5 || (exports === 0 && loc > 30)
      break
    }

    case 'behavioral': {
      const errors = countErrorHandling(content)
      const branches = countBranches(content)
      const funcs = countFunctions(content)
      const console_ = countConsole(content)

      score = Math.min(100, Math.round(
        (errors > 0 ? 25 : 0) +
        (funcs > 0 ? 20 : 0) +
        (branches > 0 ? 10 : 0) +
        (branches <= 5 ? 15 : branches <= 10 ? 8 : 0) +
        (console_ <= 2 ? 15 : 0) +
        (countTypeAnnotations(content) > 0 ? 15 : 0),
      ))

      pattern = errors > 2 ? 'defensive' : funcs > 0 ? 'active' : 'passive'
      if (errors === 0 && funcs > 0) issues.push('no error handling')
      if (console_ > 5) issues.push('excessive console output')
      if (errors > 0) highlights.push('has error handling')
      if (branches > 0 && branches <= 5) highlights.push('controlled flow')

      isClear = funcs > 0 || errors > 0
      isBeautiful = score >= 70
      isDistorted = console_ > 5 || (errors === 0 && funcs > 2)
      break
    }

    case 'logical': {
      const branches = countBranches(content)
      const nest = maxNesting(content)
      const types = countTypeAnnotations(content)

      score = Math.min(100, Math.round(
        (branches > 0 ? 15 : 0) +
        (nest <= 3 ? 25 : nest <= 5 ? 15 : 5) +
        (types > 0 ? 20 : 0) +
        (countComments(content) > 0 ? 15 : 0) +
        (countFunctions(content) > 0 ? 15 : 0) +
        (countErrorHandling(content) > 0 ? 10 : 0),
      ))

      pattern = branches > 8 ? 'complex-logic' : branches > 3 ? 'branching' : 'linear'
      if (nest > 5) issues.push('deep nesting')
      if (branches > 10) issues.push('too many branches')
      if (types > 0) highlights.push('type-safe logic')
      if (nest <= 3) highlights.push('flat control flow')

      isClear = nest <= 4
      isBeautiful = score >= 70
      isDistorted = nest > 5 || branches > 10
      break
    }

    case 'stylistic': {
      const comments = countComments(content)
      const types = countTypeAnnotations(content)
      const todos = countTodos(content)

      score = Math.min(100, Math.round(
        (comments > 0 ? 25 : 0) +
        (types > 0 ? 20 : 0) +
        (todos === 0 ? 20 : todos <= 2 ? 10 : 0) +
        (maxNesting(content) <= 3 ? 20 : maxNesting(content) <= 5 ? 10 : 0) +
        (countConsole(content) <= 1 ? 15 : 0),
      ))

      pattern = comments > 5 ? 'well-documented' : comments > 0 ? 'commented' : 'bare'
      if (comments === 0 && loc > 20) issues.push('no comments')
      if (todos > 2) issues.push('many TODOs')
      if (comments > 0) highlights.push('has documentation')
      if (types > 0) highlights.push('typed style')

      isClear = comments > 0 || types > 0
      isBeautiful = score >= 70
      isDistorted = todos > 2 || (comments === 0 && loc > 30)
      break
    }

    case 'semantic': {
      const exports = countExports(content)
      const funcs = countFunctions(content)
      const types = countTypeAnnotations(content)

      score = Math.min(100, Math.round(
        (exports > 0 ? 25 : 0) +
        (funcs > 0 ? 20 : 0) +
        (types > 0 ? 20 : 0) +
        (countComments(content) > 0 ? 15 : 0) +
        (countAbstractions(content) > 0 ? 10 : 0) +
        (loc > 0 ? 10 : 0),
      ))

      pattern = exports > 2 ? 'rich-api' : exports > 0 ? 'exported' : 'internal'
      if (exports === 0 && loc > 20) issues.push('no public API')
      if (types === 0 && loc > 10) issues.push('no type information')
      if (exports > 0) highlights.push('clear public interface')
      if (funcs > 0 && types > 0) highlights.push('typed functions')

      isClear = exports > 0 || funcs > 0
      isBeautiful = score >= 70
      isDistorted = exports === 0 && loc > 20
      break
    }

    case 'relational': {
      const imports = countImports(content)
      const exports = countExports(content)
      const abstractions = countAbstractions(content)

      score = Math.min(100, Math.round(
        (imports > 0 ? 20 : 0) +
        (exports > 0 ? 25 : 0) +
        (imports > 0 && exports > 0 ? 20 : 0) +
        (abstractions > 0 ? 15 : 0) +
        (countFunctions(content) > 0 ? 10 : 0) +
        (countErrorHandling(content) > 0 ? 10 : 0),
      ))

      pattern = imports > 3 && exports > 3 ? 'hub' : imports > 0 && exports > 0 ? 'bridge' : imports > 0 ? 'consumer' : exports > 0 ? 'provider' : 'isolated'
      if (imports === 0 && exports === 0) issues.push('isolated from codebase')
      if (imports > 5) issues.push('heavy dependencies')
      if (imports > 0 && exports > 0) highlights.push('bidirectional connections')
      if (abstractions > 0) highlights.push('defines shared types')

      isClear = imports > 0 || exports > 0
      isBeautiful = score >= 70
      isDistorted = imports === 0 && exports === 0
      break
    }

    default: {
      pattern = 'unknown'
    }
  }

  return { score, pattern, isClear, isBeautiful, isDistorted, issues, highlights }
}

// ─── Pattern Detection ───────────────────────────────────────────────────────

/**
 * Detect patterns in code
 * @example
 * detectPatterns('export function a() {}\nexport function b() {}') // PatternInfo
 */
export function detectPatterns(content: string): PatternInfo {
  const loc = countLoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFunctions(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const comments = countComments(content)
  const todos = countTodos(content)

  const hasSymmetry = exports > 0 && imports > 0 && comments > 0 && errors > 0
  const hasRepetition = funcs > 2 || exports > 2
  const hasReflection = imports > 0 && exports > 0
  const hasRotation = types > 0 && comments > 0 && errors > 0 && exports > 0
  const hasFractal = countAbstractions(content) > 1 && funcs > 1

  const distortionPoints: string[] = []
  if (todos > 2) distortionPoints.push('too-many-todos')
  if (maxNesting(content) > 5) distortionPoints.push('deep-nesting')
  if (errors === 0 && loc > 30) distortionPoints.push('no-error-handling')
  if (comments === 0 && loc > 20) distortionPoints.push('undocumented')
  if (countConsole(content) > 5) distortionPoints.push('noisy-output')
  const hasDistortion = distortionPoints.length > 0

  return { hasSymmetry, hasRepetition, hasReflection, hasRotation, hasFractal, hasDistortion, distortionPoints }
}

// ─── Color Profile ────────────────────────────────────────────────────────────

/**
 * Measure color profile of code
 * @example
 * measureColorProfile('export function a() {} export class B {}') // ColorProfile
 */
export function measureColorProfile(content: string): ColorProfile {
  const constructTypes: string[] = []
  if (countFunctions(content) > 0) constructTypes.push('functions')
  if (/\bclass\s+\w/.test(content)) constructTypes.push('classes')
  if (/\binterface\s+\w/.test(content)) constructTypes.push('interfaces')
  if (/\btype\s+\w+\s*=/.test(content)) constructTypes.push('types')
  if (countImports(content) > 0) constructTypes.push('imports')
  if (countExports(content) > 0) constructTypes.push('exports')
  if (countErrorHandling(content) > 0) constructTypes.push('error-handling')

  const richness = Math.min(100, constructTypes.length * 15)
  const harmony = Math.min(100, Math.round(
    (constructTypes.length >= 3 ? 30 : constructTypes.length * 10) +
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (countComments(content) > 0 ? 25 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0),
  ))
  const contrast = Math.min(100, Math.round(
    (countExports(content) > 0 && countImports(content) > 0 ? 30 : 0) +
    (countAbstractions(content) > 0 ? 25 : 0) +
    (countFunctions(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 25 : 0),
  ))

  const isMonochrome = constructTypes.length <= 2
  const isPolychrome = constructTypes.length >= 5
  const isClashing = countTodos(content) > 3 || (countErrorHandling(content) === 0 && countLoc(content) > 50)

  return { richness, harmony, contrast, isMonochrome, isPolychrome, isClashing }
}

// ─── Perspective Variance ─────────────────────────────────────────────────────

/**
 * Measure variance across perspectives
 * @example
 * measurePerspectiveVariance({ structural: { score: 80 }, behavioral: { score: 60 } }) // number
 */
export function measurePerspectiveVariance(perspectives: Record<string, PerspectiveView>): number {
  const scores = Object.values(perspectives).map(p => p.score)
  if (scores.length === 0) return 0
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length
  const variance = scores.reduce((s, v) => s + (v - avg) ** 2, 0) / scores.length
  const stddev = Math.sqrt(variance)
  return Math.min(100, Math.round(100 - stddev))
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a kaleidoscope shard
 * @example
 * analyzeKaleidoscopeShard('export function calc() { return 1 }', 'calc.ts') // KaleidoscopeShard
 */
export function analyzeKaleidoscopeShard(content: string, filePath: string): KaleidoscopeShard {

  const perspectives = {
    structural: analyzePerspectiveView(content, 'structural'),
    behavioral: analyzePerspectiveView(content, 'behavioral'),
    logical: analyzePerspectiveView(content, 'logical'),
    stylistic: analyzePerspectiveView(content, 'stylistic'),
    semantic: analyzePerspectiveView(content, 'semantic'),
    relational: analyzePerspectiveView(content, 'relational'),
  }

  const scores = Object.values(perspectives).map(p => p.score)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0
  const maxScore = Math.max(...scores)
  const minScore = Math.min(...scores)

  const perspectiveEntries = Object.entries(perspectives)
  const firstEntry = perspectiveEntries[0] ?? ['structural', perspectives.structural]
  const dominantEntry = perspectiveEntries.reduce((a, b) => b[1].score > a[1].score ? b : a, firstEntry)
  const weakestEntry = perspectiveEntries.reduce((a, b) => b[1].score < a[1].score ? b : a, firstEntry)

  const symmetry = Math.min(100, Math.round(
    avgScore * 0.5 +
    (100 - (maxScore - minScore)) * 0.3 +
    measurePerspectiveVariance(perspectives) * 0.2,
  ))

  const alignment = Math.min(100, Math.round(
    measurePerspectiveVariance(perspectives) * 0.4 +
    avgScore * 0.3 +
    (perspectiveEntries.filter(([, p]) => p.isClear).length / 6) * 30,
  ))

  const loc = countLoc(content)
  const beauty = Math.min(100, Math.round(
    avgScore * 0.35 +
    (perspectiveEntries.filter(([, p]) => p.isBeautiful).length / 6) * 30 +
    (perspectiveEntries.filter(([, p]) => !p.isDistorted).length / 6) * 20 +
    (loc > 0 ? 10 : 0) + 5,
  ))

  const pattern = detectPatterns(content)
  const color = measureColorProfile(content)
  const perspectiveVariance = measurePerspectiveVariance(perspectives)

  const rotation = Math.min(360, Math.round(
    (Object.values(perspectives).filter(p => p.isClear).length / 6) * 180 +
    (symmetry / 100) * 180,
  ))

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    symmetry * 0.25 +
    alignment * 0.2 +
    beauty * 0.2 +
    perspectiveVariance * 0.15 +
    (color.harmony / 100) * 10 +
    (pattern.hasDistortion ? -5 : 5) + 5,
  )))

  return {
    file: filePath, rotation, symmetry, alignment, beauty,
    perspectives,
    dominantPerspective: dominantEntry[0],
    weakestPerspective: weakestEntry[0],
    perspectiveVariance,
    pattern, color, qualityScore,
  }
}

// ─── Chamber Analysis ────────────────────────────────────────────────────────

/**
 * Analyze a directory as a kaleidoscope chamber
 * @example
 * analyzeKaleidoscopeChamber(shards, 'src') // KaleidoscopeChamber
 */
export function analyzeKaleidoscopeChamber(shards: KaleidoscopeShard[], dirPath: string): KaleidoscopeChamber {
  if (shards.length === 0) {
    return {
      directory: dirPath, shards: [], avgSymmetry: 0, avgAlignment: 0, avgBeauty: 0,
      avgPerspectiveVariance: 0, dominantPerspective: 'structural', weakPerspective: 'structural',
      harmoniousCount: 0, clashingCount: 0, chamberType: 'chaotic', chamberBeauty: 0, condition: 'broken',
    }
  }

  const n = shards.length
  const avgSymmetry = Math.round(shards.reduce((s, sh) => s + sh.symmetry, 0) / n)
  const avgAlignment = Math.round(shards.reduce((s, sh) => s + sh.alignment, 0) / n)
  const avgBeauty = Math.round(shards.reduce((s, sh) => s + sh.beauty, 0) / n)
  const avgPerspectiveVariance = Math.round(shards.reduce((s, sh) => s + sh.perspectiveVariance, 0) / n)

  const perspCounts = new Map<string, number>()
  const weakCounts = new Map<string, number>()
  for (const sh of shards) {
    perspCounts.set(sh.dominantPerspective, (perspCounts.get(sh.dominantPerspective) ?? 0) + 1)
    weakCounts.set(sh.weakestPerspective, (weakCounts.get(sh.weakestPerspective) ?? 0) + 1)
  }
  const sortedPersp = Array.from(perspCounts.entries()).sort((a, b) => b[1] - a[1])
  const dominantPerspective = sortedPersp[0]?.[0] ?? 'structural'
  const sortedWeak = Array.from(weakCounts.entries()).sort((a, b) => b[1] - a[1])
  const weakPerspective = sortedWeak[0]?.[0] ?? 'structural'

  const harmoniousCount = shards.filter(s => !s.pattern.hasDistortion).length
  const clashingCount = shards.filter(s => s.color.isClashing).length

  const chamberType = classifyChamberType(avgSymmetry, avgBeauty)
  const chamberBeauty = avgBeauty
  const condition = classifyChamberCondition(chamberBeauty)

  return {
    directory: dirPath, shards, avgSymmetry, avgAlignment, avgBeauty,
    avgPerspectiveVariance, dominantPerspective, weakPerspective,
    harmoniousCount, clashingCount, chamberType, chamberBeauty, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate kaleidoscope turn recommendations
 * @example
 * generateRecommendations(shards, chambers, overall, stats) // string[]
 */
export function generateRecommendations(
  _shards: KaleidoscopeShard[],
  _chambers: KaleidoscopeChamber[],
  _overallSymmetry: number,
  stats: KaleidoscopeTurnStats,
): string[] {
  void _shards
  void _chambers
  void _overallSymmetry
  const recs: string[] = []

  if (stats.distortionFiles > 0) {
    recs.push(`Distortion detected: ${stats.distortionFiles} files show inconsistent patterns from different angles`)
  }
  if (stats.clashingFiles > 0) {
    recs.push(`Clashing colors: ${stats.clashingFiles} files have conflicting construct patterns`)
  }
  if (stats.brokenChambers > 0) {
    recs.push(`Broken chambers: ${stats.brokenChambers} directories have poor kaleidoscope patterns`)
  }
  if (stats.overallSymmetry >= 60) {
    recs.push('Good symmetry: the codebase shows consistent patterns from multiple perspectives')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete kaleidoscope turn result from files and contents
 * @example
 * buildKaleidoscopeTurnResult(['a.ts'], ['export function a() {}'], {}) // KaleidoscopeTurnResult
 */
export function buildKaleidoscopeTurnResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): KaleidoscopeTurnResult {
  void options

  const shards: KaleidoscopeShard[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeKaleidoscopeShard(content, file)
    } catch {
      return analyzeKaleidoscopeShard('', file)
    }
  })

  const dirMap = new Map<string, KaleidoscopeShard[]>()
  for (const sh of shards) {
    const dir = sh.file.includes('/') ? sh.file.slice(0, sh.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(sh) } else { dirMap.set(dir, [sh]) }
  }

  const chambers: KaleidoscopeChamber[] = Array.from(dirMap.entries()).map(([dir, shs]) =>
    analyzeKaleidoscopeChamber(shs, dir),
  )

  const n = shards.length || 1
  const overallSymmetry = Math.round(shards.reduce((s, sh) => s + sh.symmetry, 0) / n)

  const firstShard = shards[0]

  const stats: KaleidoscopeTurnStats = {
    totalFiles: files.length,
    totalChambers: chambers.length,
    avgSymmetry: overallSymmetry,
    avgAlignment: Math.round(shards.reduce((s, sh) => s + sh.alignment, 0) / n),
    avgBeauty: Math.round(shards.reduce((s, sh) => s + sh.beauty, 0) / n),
    avgPerspectiveVariance: Math.round(shards.reduce((s, sh) => s + sh.perspectiveVariance, 0) / n),
    avgStructuralScore: Math.round(shards.reduce((s, sh) => s + sh.perspectives.structural.score, 0) / n),
    avgBehavioralScore: Math.round(shards.reduce((s, sh) => s + sh.perspectives.behavioral.score, 0) / n),
    avgLogicalScore: Math.round(shards.reduce((s, sh) => s + sh.perspectives.logical.score, 0) / n),
    avgStylisticScore: Math.round(shards.reduce((s, sh) => s + sh.perspectives.stylistic.score, 0) / n),
    avgSemanticScore: Math.round(shards.reduce((s, sh) => s + sh.perspectives.semantic.score, 0) / n),
    avgRelationalScore: Math.round(shards.reduce((s, sh) => s + sh.perspectives.relational.score, 0) / n),
    harmoniousFiles: shards.filter(s => !s.pattern.hasDistortion).length,
    clashingFiles: shards.filter(s => s.color.isClashing).length,
    monochromeFiles: shards.filter(s => s.color.isMonochrome).length,
    polychromeFiles: shards.filter(s => s.color.isPolychrome).length,
    symmetryFiles: shards.filter(s => s.pattern.hasSymmetry).length,
    distortionFiles: shards.filter(s => s.pattern.hasDistortion).length,
    mandalaChambers: chambers.filter(c => c.chamberType === 'mandala').length,
    chaoticChambers: chambers.filter(c => c.chamberType === 'chaotic').length,
    breathtakingChambers: chambers.filter(c => c.condition === 'breathtaking').length,
    brokenChambers: chambers.filter(c => c.condition === 'broken').length,
    overallSymmetry,
    opticianGrade: classifyOpticianGrade(overallSymmetry),
    mostSymmetrical: firstShard
      ? shards.reduce((a, b) => b.symmetry > a.symmetry ? b : a, firstShard).file : 'none',
    leastSymmetrical: firstShard
      ? shards.reduce((a, b) => b.symmetry < a.symmetry ? b : a, firstShard).file : 'none',
    mostBeautiful: firstShard
      ? shards.reduce((a, b) => b.beauty > a.beauty ? b : a, firstShard).file : 'none',
    bestFromAllAngles: firstShard
      ? shards.reduce((a, b) => b.perspectiveVariance > a.perspectiveVariance ? b : a, firstShard).file : 'none',
  }

  const recommendations = generateRecommendations(shards, chambers, overallSymmetry, stats)

  return { shards, chambers, overallSymmetry, stats, recommendations }
}
