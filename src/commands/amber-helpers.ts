// ─── Interfaces ──────────────────────────────────────────

export interface GeologicalLayer {
  depth: number
  pattern: string
  quality: number
  age: string
  isStable: boolean
  isEroding: boolean
}

export interface PreservedSpecimen {
  file: string
  preservation: number
  age: 'recent' | 'established' | 'mature' | 'ancient' | 'fossilized'
  quality: number
  isTimeless: boolean
  isFossilized: boolean
  isDegrading: boolean
  isInclusions: boolean
  resinFreshness: number
  layers: GeologicalLayer[]
  classification: 'perfect-preservation' | 'well-preserved' | 'partially-preserved' | 'degraded' | 'fossilized'
}

export interface FossilArtifact {
  type: 'deprecated-pattern' | 'dead-code' | 'unused-import' | 'legacy-api' | 'outdated-idiom' | 'zombie-code'
  file: string
  line: number
  description: string
  replacementSuggestion: string
  difficulty: 'trivial' | 'moderate' | 'difficult' | 'excavation-required'
}

export interface AmberStats {
  totalSpecimens: number
  perfectlyPreserved: number
  fossilized: number
  degrading: number
  timelessPatterns: number
  totalFossils: number
  trivialFossils: number
  excavationRequired: number
  avgPreservation: number
  avgQuality: number
  avgResinFreshness: number
  recentCode: number
  ancientCode: number
  fossilizedCode: number
  preservationIndex: number
  fossilizationRisk: number
  geologicalComplexity: number
  overallPreservation: 'pristine-collection' | 'well-curated' | 'natural-history' | 'quarry' | 'tar-pits'
}

export interface AmberResult {
  specimens: PreservedSpecimen[]
  fossils: FossilArtifact[]
  stats: AmberStats
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────

const TODO_FIXME_RE = /(?:TODO|FIXME|HACK|XXX|WORKAROUND)\b/gi
const DEPRECATED_RE = /@deprecated\b/
const CONSOLE_LOG_RE = /console\.log\s*\(/
const VAR_RE = /\bvar\s+\w+/
const REQUIRE_RE = /require\s*\(\s*['"]/
const LEGACY_API_RE = /\b(?:arguments\.callee|with\s*\(|eval\s*\(|new\s+Function\s*\(|document\.write\b)/g
const ANY_TYPE_RE = /:\s*any\b/
const EMPTY_CATCH_RE = /catch\s*\([^)]*\)\s*\{\s*\}/
const ZOMBIE_CODE_RE = /\/\/\s*(?:eslint-disable|ts-ignore|@ts-ignore|@ts-expect-error|istanbul\s+ignore)/gi
const MODERN_SYNTAX_RE = /(?:const\s|let\s|=>|\basync\b|\bawait\b|\bclass\b|`[^`]*\$\{|(?:\.\.\.)|\?\.\w|!\.)/g
const EXPORT_RE = /export\s+(?:default\s+)?(?:function|const|class|interface|type|enum|async\s+function)\s+(\w+)/g
const IMPORT_FROM_RE = /import\s+(?:\{[^}]*\}|\w+)\s+from\s+['"]([^'"]+)['"]/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const TYPE_ANNOTATION_RE = /:\s*(?:string|number|boolean|void|Promise|Record|Map|Set|Array|[A-Z]\w+)/
const INTERFACE_RE = /(?:interface|type)\s+\w+\s*(?:<[^>]+>)?\s*\{/
const TEST_PROXY_RE = /(?:describe|it|test)\s*\(\s*['"]/

// ─── evaluatePreservation ────────────────────────────────

/**
 * Evaluate code preservation quality (0-100)
 * @example
 * evaluatePreservation('export function foo(): void {}', 'a.ts') // high score
 */
export function evaluatePreservation(content: string, _filePath: string): number {
  if (content.trim().length === 0) return 50
  let score = 60

  const lines = content.split('\n').length

  // Documentation boosts preservation
  const jsdocMatches = content.match(JSDOC_RE)
  if (jsdocMatches && jsdocMatches.length > 0) score += 10

  // Type annotations boost
  if (TYPE_ANNOTATION_RE.test(content)) score += 8

  // Interfaces/types boost
  if (INTERFACE_RE.test(content)) score += 7

  // Test proxies boost
  if (TEST_PROXY_RE.test(content)) score += 5

  // Consistent patterns (consistent quotes, semicolons)
  const singleQuotes = (content.match(/'/g) ?? []).length
  const doubleQuotes = (content.match(/"/g) ?? []).length
  if (singleQuotes > 0 && doubleQuotes > 0) {
    const ratio = Math.min(singleQuotes, doubleQuotes) / Math.max(singleQuotes, doubleQuotes)
    if (ratio < 0.3) score += 3 // Mostly consistent
  } else {
    score += 3 // Fully consistent
  }

  // TODO/FIXME reduce preservation
  const todoCount = (content.match(TODO_FIXME_RE) ?? []).length
  score -= Math.min(15, todoCount * 3)

  // Deprecated markers reduce
  if (DEPRECATED_RE.test(content)) score -= 10

  // Console.log reduces
  const consoleCount = (content.match(CONSOLE_LOG_RE) ?? []).length
  score -= Math.min(10, consoleCount * 2)

  // Any type reduces
  const anyCount = (content.match(ANY_TYPE_RE) ?? []).length
  score -= Math.min(10, anyCount * 3)

  // Empty catch reduces
  if (EMPTY_CATCH_RE.test(content)) score -= 5

  // Very long files reduce preservation (harder to maintain)
  if (lines > 500) score -= 10
  else if (lines > 300) score -= 5

  return Math.max(0, Math.min(100, score))
}

// ─── estimateAge ─────────────────────────────────────────

/**
 * Estimate code age classification based on patterns
 * @example
 * estimateAge('const x = () => {}', 'a.ts') // 'recent'
 */
export function estimateAge(content: string, _filePath: string): PreservedSpecimen['age'] {
  let modernScore = 0
  let legacyScore = 0

  const modernMatches = content.match(MODERN_SYNTAX_RE)
  modernScore = modernMatches ? modernMatches.length : 0

  // Legacy indicators
  if (VAR_RE.test(content)) legacyScore += 3
  if (REQUIRE_RE.test(content)) legacyScore += 3
  if (/\bfunction\s+\w+\s*\([^)]*\)\s*\{/.test(content) && !content.includes('=>')) legacyScore += 2
  if (LEGACY_API_RE.test(content)) legacyScore += 4

  const total = modernScore + legacyScore
  if (total === 0) return 'established'

  const modernRatio = modernScore / total

  if (modernRatio > 0.8) return 'recent'
  if (modernRatio > 0.5) return 'established'
  if (modernRatio > 0.3) return 'mature'
  if (modernRatio > 0.1) return 'ancient'
  return 'fossilized'
}

// ─── detectFossilization ─────────────────────────────────

/**
 * Detect if code is fossilized (can't change without breaking)
 * @example
 * detectFossilization('export function core() {}', 'core.ts', ['a.ts', 'b.ts']) // false
 */
export function detectFossilization(
  content: string,
  _filePath: string,
  _allFiles: string[],
): boolean {
  // Count how many files might import this one
  const exports: string[] = []
  EXPORT_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = EXPORT_RE.exec(content)) !== null) {
    const capture = m[1]
    if (capture) exports.push(capture)
  }

  // Many exports with many dependents = fossilized
  if (exports.length >= 8) return true

  // No abstraction — one giant function/module
  const lines = content.split('\n').length
  const functionCount = (content.match(/(?:function\s+\w|=>\s*\{)/g) ?? []).length
  if (lines > 400 && functionCount <= 2) return true

  // Tight coupling — many direct imports
  IMPORT_FROM_RE.lastIndex = 0
  const importCount = (content.match(IMPORT_FROM_RE) ?? []).length
  if (importCount >= 10) return true

  return false
}

// ─── detectDegrading ─────────────────────────────────────

/**
 * Detect if code quality is declining
 * @example
 * detectDegrading('// TODO fix\n// FIXME hack\n// XXX broken') // true
 */
export function detectDegrading(content: string, _filePath: string): boolean {
  const todoCount = (content.match(TODO_FIXME_RE) ?? []).length
  const lines = content.split('\n').length
  if (lines === 0) return false

  const todoDensity = todoCount / lines
  return todoDensity > 0.05 // More than 1 TODO per 20 lines
}

// ─── analyzeGeologicalLayers ─────────────────────────────

/**
 * Analyze abstraction layers as geological strata
 * @example
 * analyzeGeologicalLayers('function foo() { if (x) { while(y) {} } }', 'a.ts') // GeologicalLayer[]
 */
export function analyzeGeologicalLayers(content: string, _filePath: string): GeologicalLayer[] {
  const lines = content.split('\n')
  const layers: GeologicalLayer[] = []
  let maxDepth = 0

  // Track indentation depth per line
  for (const line of lines) {
    const leading = line.match(/^(\s*)/)?.[1] ?? ''
    const depth = Math.floor(leading.length / 2)
    if (depth > maxDepth) maxDepth = depth
  }

  // Create layers at different depths
  const depths = Array.from(new Set(
    lines.map((line) => {
      const leading = line.match(/^(\s*)/)?.[1] ?? ''
      return Math.floor(leading.length / 2)
    }),
  )).sort((a, b) => a - b)

  for (let i = 0; i < depths.length; i++) {
    const depth = depths[i] ?? 0
    const linesAtDepth = lines.filter((line) => {
      const leading = line.match(/^(\s*)/)?.[1] ?? ''
      return Math.floor(leading.length / 2) === depth
    })

    const contentAtDepth = linesAtDepth.join('\n')
    const pattern = detectDominantPattern(contentAtDepth)
    const quality = evaluateLayerQuality(contentAtDepth)

    layers.push({
      age: depth === 0 ? 'foundation' : depth <= 2 ? 'established' : 'deep',
      depth,
      isEroding: quality < 40,
      isStable: quality >= 60,
      pattern,
      quality,
    })
  }

  return layers
}

function detectDominantPattern(content: string): string {
  if (/export\s+(?:default\s+)?(?:function|const|class)/.test(content)) return 'exports'
  if (/import\s+/.test(content)) return 'imports'
  if (/(?:function|=>)\s*\(/.test(content)) return 'functions'
  if (/(?:if|for|while|switch)\s*\(/.test(content)) return 'control-flow'
  if (/const\s+\w+\s*=/.test(content)) return 'declarations'
  if (/(?:interface|type)\s+\w+/.test(content)) return 'type-definitions'
  return 'other'
}

function evaluateLayerQuality(content: string): number {
  let quality = 50
  if (TYPE_ANNOTATION_RE.test(content)) quality += 15
  if (content.includes('// ') || content.includes('/*')) quality += 10
  if (TEST_PROXY_RE.test(content)) quality += 10
  const todoCount = (content.match(TODO_FIXME_RE) ?? []).length
  quality -= Math.min(20, todoCount * 5)
  if (ANY_TYPE_RE.test(content)) quality -= 10
  if (EMPTY_CATCH_RE.test(content)) quality -= 10
  return Math.max(0, Math.min(100, quality))
}

// ─── identifyFossilArtifacts ─────────────────────────────

/**
 * Identify fossil artifacts (dead patterns) in code
 * @example
 * identifyFossilArtifacts('var x = 1', 'a.ts') // FossilArtifact[]
 */
export function identifyFossilArtifacts(content: string, filePath: string): FossilArtifact[] {
  const fossils: FossilArtifact[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const lineNum = i + 1

    // Deprecated patterns
    if (DEPRECATED_RE.test(line)) {
      fossils.push({
        description: 'Deprecated marker found',
        difficulty: 'moderate',
        file: filePath,
        line: lineNum,
        replacementSuggestion: 'Remove deprecated code or migrate to new API',
        type: 'deprecated-pattern',
      })
    }

    // Dead code (commented-out blocks)
    if (/^\s*\/\/\s*(function|const|let|var|if|for|while|return)\s/.test(line)) {
      fossils.push({
        description: 'Commented-out code detected',
        difficulty: 'trivial',
        file: filePath,
        line: lineNum,
        replacementSuggestion: 'Remove dead code or restore if needed',
        type: 'dead-code',
      })
    }

    // Unused imports (heuristic: import never referenced)
    const importMatch = line.match(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/)
    if (importMatch) {
      const matchSymbols = importMatch[1]
      if (matchSymbols) {
        const symbols = matchSymbols.split(',').map((s) => s.trim())
        for (const sym of symbols) {
          const usageRe = new RegExp(`\\b${sym}\\b`, 'g')
          const usageCount = (content.match(usageRe) ?? []).length
          if (usageCount <= 1) {
            fossils.push({
              description: `Unused import: ${sym}`,
              difficulty: 'trivial',
              file: filePath,
              line: lineNum,
              replacementSuggestion: `Remove unused import '${sym}'`,
              type: 'unused-import',
            })
          }
        }
      }
    }

    // Legacy API usage
    const legacyMatch = line.match(LEGACY_API_RE)
    if (legacyMatch) {
      fossils.push({
        description: `Legacy API usage: ${legacyMatch[0] ?? 'unknown'}`,
        difficulty: 'difficult',
        file: filePath,
        line: lineNum,
        replacementSuggestion: 'Replace with modern equivalent',
        type: 'legacy-api',
      })
    }

    // Outdated idiom: var
    if (VAR_RE.test(line)) {
      fossils.push({
        description: 'Outdated idiom: var keyword',
        difficulty: 'trivial',
        file: filePath,
        line: lineNum,
        replacementSuggestion: 'Replace var with const or let',
        type: 'outdated-idiom',
      })
    }

    // Zombie code: suppression comments
    if (ZOMBIE_CODE_RE.test(line)) {
      fossils.push({
        description: 'Zombie code: suppression comment',
        difficulty: 'moderate',
        file: filePath,
        line: lineNum,
        replacementSuggestion: 'Fix the underlying issue instead of suppressing',
        type: 'zombie-code',
      })
    }
  }

  return fossils
}

// ─── classifySpecimen ────────────────────────────────────

/**
 * Classify a specimen based on preservation, quality, and age
 * @example
 * classifySpecimen(90, 85, 'recent') // 'perfect-preservation'
 */
export function classifySpecimen(
  preservation: number,
  quality: number,
  age: PreservedSpecimen['age'],
): PreservedSpecimen['classification'] {
  const combined = preservation * 0.5 + quality * 0.5

  if (age === 'fossilized') return 'fossilized'
  if (combined >= 80 && age !== 'ancient') return 'perfect-preservation'
  if (combined >= 60) return 'well-preserved'
  if (combined >= 40) return 'partially-preserved'
  return 'degraded'
}

// ─── computePreservationIndex ────────────────────────────

/**
 * Compute overall preservation index (0-100)
 * @example
 * computePreservationIndex(specimens) // 75
 */
export function computePreservationIndex(specimens: PreservedSpecimen[]): number {
  if (specimens.length === 0) return 100
  return Math.round(
    specimens.reduce((sum, s) => sum + s.preservation, 0) / specimens.length,
  )
}

// ─── computeFossilizationRisk ────────────────────────────

/**
 * Compute fossilization risk (0-100)
 * @example
 * computeFossilizationRisk(specimens) // 30
 */
export function computeFossilizationRisk(specimens: PreservedSpecimen[]): number {
  if (specimens.length === 0) return 0
  const atRisk = specimens.filter(
    (s) => s.isFossilized || s.isDegrading || s.age === 'ancient' || s.age === 'fossilized',
  )
  return Math.round((atRisk.length / specimens.length) * 100)
}

// ─── classifyOverall ─────────────────────────────────────

/**
 * Classify overall preservation status
 * @example
 * classifyOverall(85, 20) // 'pristine-collection'
 */
export function classifyOverall(
  preservationIndex: number,
  fossilizationRisk: number,
): AmberStats['overallPreservation'] {
  const score = preservationIndex * 0.6 + (100 - fossilizationRisk) * 0.4

  if (score >= 80) return 'pristine-collection'
  if (score >= 60) return 'well-curated'
  if (score >= 40) return 'natural-history'
  if (score >= 20) return 'quarry'
  return 'tar-pits'
}

// ─── evaluateQuality ─────────────────────────────────────

/**
 * Evaluate intrinsic code quality (0-100)
 * @example
 * evaluateQuality('const x: number = 1') // high score
 */
export function evaluateQuality(content: string, _filePath: string): number {
  if (content.trim().length === 0) return 50
  let quality = 50

  if (TYPE_ANNOTATION_RE.test(content)) quality += 15
  if (INTERFACE_RE.test(content)) quality += 10
  if (content.includes('export')) quality += 5

  const anyCount = (content.match(ANY_TYPE_RE) ?? []).length
  quality -= Math.min(15, anyCount * 5)

  if (EMPTY_CATCH_RE.test(content)) quality -= 10
  if (VAR_RE.test(content)) quality -= 5
  if (/\beval\s*\(/.test(content)) quality -= 15

  const lines = content.split('\n')
  const longLines = lines.filter((l) => l.length > 120).length
  quality -= Math.min(10, longLines)

  return Math.max(0, Math.min(100, quality))
}

// ─── computeResinFreshness ───────────────────────────────

/**
 * Compute resin freshness — how recently maintained (0-100)
 * @example
 * computeResinFreshness('recent') // 90
 */
export function computeResinFreshness(age: PreservedSpecimen['age']): number {
  switch (age) {
    case 'recent': return 90
    case 'established': return 70
    case 'mature': return 50
    case 'ancient': return 30
    case 'fossilized': return 10
  }
}

// ─── detectInclusions ────────────────────────────────────

/**
 * Detect embedded dependencies (hard to extract)
 * @example
 * detectInclusions('import { a } from "dep"\nimport { b } from "dep2"') // true
 */
export function detectInclusions(content: string): boolean {
  IMPORT_FROM_RE.lastIndex = 0
  const importSources: string[] = []
  let m: RegExpExecArray | null
  while ((m = IMPORT_FROM_RE.exec(content)) !== null) {
    const source = m[1]
    if (source) importSources.push(source)
  }
  // Heavily coupled = many distinct import sources
  const uniqueSources = Array.from(new Set(importSources))
  return uniqueSources.length >= 6
}

// ─── detectTimelessPatterns ──────────────────────────────

/**
 * Detect if code uses timeless patterns
 * @example
 * detectTimelessPatterns('interface Config { key: string }') // true
 */
export function detectTimelessPatterns(content: string): boolean {
  // Pure interfaces/types are timeless
  const isOnlyTypes = /^(?:export\s+)?(?:interface|type)\s+/.test(content.trim()) &&
    !/(?:function|const|let|var)\s+\w+\s*[=(]/.test(content)
  if (isOnlyTypes) return true

  // Well-documented exports are timeless
  const jsdocCount = (content.match(JSDOC_RE) ?? []).length
  const exportCount = (content.match(EXPORT_RE) ?? []).length
  if (jsdocCount >= exportCount && exportCount > 0) return true

  // Pure utility functions with types
  const hasTypedFunctions = /export\s+function\s+\w+\([^)]*:\s*\w+[^)]*\)\s*:\s*\w+/.test(content)
  if (hasTypedFunctions && content.split('\n').length < 100) return true

  return false
}

// ─── computeGeologicalComplexity ─────────────────────────

/**
 * Compute geological complexity (0-100) based on layer diversity
 * @example
 * computeGeologicalComplexity(specimens) // 50
 */
export function computeGeologicalComplexity(specimens: PreservedSpecimen[]): number {
  if (specimens.length === 0) return 0
  const totalLayers = specimens.reduce((sum, s) => sum + s.layers.length, 0)
  const avg = totalLayers / specimens.length
  return Math.min(100, Math.round(avg * 10))
}

// ─── generateRecommendations ────────────────────────────

/**
 * Generate recommendations for code preservation
 * @example
 * generateRecommendations(specimens, fossils, stats) // ['Refactor fossilized code...']
 */
export function generateRecommendations(
  _specimens: PreservedSpecimen[],
  fossils: FossilArtifact[],
  stats: AmberStats,
): string[] {
  const recs: string[] = []

  if (stats.fossilized > 0) {
    recs.push(`Carefully modernize ${stats.fossilized} fossilized module(s) with comprehensive test coverage first`)
  }

  if (stats.degrading > 0) {
    recs.push(`Stabilize ${stats.degrading} degrading module(s) by resolving TODO/FIXME items`)
  }

  const trivialFossils = fossils.filter((f) => f.difficulty === 'trivial')
  if (trivialFossils.length > 0) {
    recs.push(`Excavate ${trivialFossils.length} trivial fossil artifact(s): unused imports, commented-out code, var keywords`)
  }

  if (stats.excavationRequired > 0) {
    recs.push(`Plan strategic refactoring for ${stats.excavationRequired} difficult artifact(s)`)
  }

  if (stats.fossilizationRisk > 50) {
    recs.push('High fossilization risk: add abstraction layers to tightly coupled modules')
  }

  if (stats.overallPreservation === 'tar-pits') {
    recs.push('Critical: Codebase is a tar-pits. Create a strategic refactoring roadmap before adding features.')
  } else if (stats.overallPreservation === 'quarry') {
    recs.push('Consider a dedicated modernization sprint to improve overall code preservation.')
  }

  return recs
}

// ─── buildAmberResult ────────────────────────────────────

/**
 * Build the full amber analysis result
 * @example
 * buildAmberResult(['foo.ts'], ['export function hello() {}'], {}) // AmberResult
 */
export function buildAmberResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): AmberResult {
  const specimens: PreservedSpecimen[] = []
  const allFossils: FossilArtifact[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const filePath = files[i] ?? ''

    const preservation = evaluatePreservation(content, filePath)
    const quality = evaluateQuality(content, filePath)
    const age = estimateAge(content, filePath)
    const isFossilized = detectFossilization(content, filePath, files)
    const isDegrading = detectDegrading(content, filePath)
    const isInclusions = detectInclusions(content)
    const isTimeless = detectTimelessPatterns(content)
    const resinFreshness = computeResinFreshness(age)
    const layers = analyzeGeologicalLayers(content, filePath)
    const classification = classifySpecimen(preservation, quality, age)

    specimens.push({
      age,
      classification,
      file: filePath,
      isDegrading,
      isFossilized,
      isInclusions,
      isTimeless,
      layers,
      preservation,
      quality,
      resinFreshness,
    })

    const fossils = identifyFossilArtifacts(content, filePath)
    allFossils.push(...fossils)
  }

  const preservationIndex = computePreservationIndex(specimens)
  const fossilizationRisk = computeFossilizationRisk(specimens)
  const overallPreservation = classifyOverall(preservationIndex, fossilizationRisk)
  const geologicalComplexity = computeGeologicalComplexity(specimens)

  const stats: AmberStats = {
    ancientCode: specimens.filter((s) => s.age === 'ancient').length,
    avgPreservation: preservationIndex,
    avgQuality: specimens.length > 0
      ? Math.round(specimens.reduce((sum, s) => sum + s.quality, 0) / specimens.length)
      : 100,
    avgResinFreshness: specimens.length > 0
      ? Math.round(specimens.reduce((sum, s) => sum + s.resinFreshness, 0) / specimens.length)
      : 100,
    degrading: specimens.filter((s) => s.isDegrading).length,
    excavationRequired: allFossils.filter((f) => f.difficulty === 'difficult' || f.difficulty === 'excavation-required').length,
    fossilized: specimens.filter((s) => s.isFossilized).length,
    fossilizedCode: specimens.filter((s) => s.age === 'fossilized').length,
    geologicalComplexity,
    overallPreservation,
    perfectlyPreserved: specimens.filter((s) => s.classification === 'perfect-preservation').length,
    preservationIndex,
    recentCode: specimens.filter((s) => s.age === 'recent').length,
    timelessPatterns: specimens.filter((s) => s.isTimeless).length,
    totalFossils: allFossils.length,
    totalSpecimens: specimens.length,
    trivialFossils: allFossils.filter((f) => f.difficulty === 'trivial').length,
    fossilizationRisk,
  }

  const recommendations = generateRecommendations(specimens, allFossils, stats)

  return {
    fossils: allFossils,
    recommendations,
    specimens,
    stats,
  }
}
