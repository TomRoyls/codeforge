// ─── Types ──────────────────────────────────────────────────────────────────────

export type FractalScale = 'function' | 'class' | 'file' | 'directory' | 'project'
export type FileQuality = 'mandelbrot' | 'sierpinski' | 'koch' | 'tree' | 'random'
export type DimensionInterpretation = 'simple' | 'moderate' | 'complex' | 'chaotic'
export type FractalOverallQuality = 'crystalline' | 'organized' | 'branching' | 'organic' | 'chaotic'

export interface FractalPattern {
  name: string
  scale: FractalScale
  pattern: string
  occurrences: number
  consistency: number
  isSelfSimilar: boolean
  scales: string[]
}

export interface FractalLevel {
  scale: string
  nodes: number
  avgComplexity: number
  patternCount: number
  selfSimilarityScore: number
  dominantPattern: string
}

export interface FractalDimension {
  dimension: number
  interpretation: DimensionInterpretation
  description: string
}

export interface FractalFile {
  file: string
  functionPatterns: FractalPattern[]
  classPatterns: FractalPattern[]
  selfSimilarity: number
  fractalDepth: number
  quality: FileQuality
}

export interface FractalStats {
  totalPatterns: number
  selfSimilarPatterns: number
  avgConsistency: number
  avgSelfSimilarity: number
  fractalDimension: number
  maxFractalDepth: number
  scaleInvariantCount: number
  mandelbrotFiles: number
  randomFiles: number
  overallSelfSimilarity: number
  fractalQuality: FractalOverallQuality
  iterationScore: number
}

export interface FractalResult {
  patterns: FractalPattern[]
  levels: FractalLevel[]
  dimension: FractalDimension
  files: FractalFile[]
  stats: FractalStats
  recommendations: string[]
}

export interface FractalOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Pattern Extraction ─────────────────────────────────────────────────────────

/**
 * Extract repeating patterns at a given scale.
 *
 * @example
 * extractPatternsAtScale('function add() {} function sub() {}', 'function') // => FractalPattern[]
 */
export function extractPatternsAtScale(content: string, scale: FractalScale): FractalPattern[] {
  if (content.trim().length === 0) return []

  const patterns: FractalPattern[] = []

  if (scale === 'function') {
    patterns.push(...extractFunctionPatterns(content))
  } else if (scale === 'class') {
    patterns.push(...extractClassPatterns(content))
  } else if (scale === 'file') {
    patterns.push(...extractFilePatterns(content))
  }

  return patterns
}

function extractFunctionPatterns(content: string): FractalPattern[] {
  const patterns: FractalPattern[] = []

  const fnSigs = Array.from(content.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g))
  const arrowFns = Array.from(content.matchAll(/(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=])\s*=>/g))
  const totalFns = fnSigs.length + arrowFns.length

  if (totalFns > 0) {
    const typedFns = fnSigs.filter(m => m[2]?.includes(':')).length
    const asyncFns = fnSigs.filter(m => m[0].includes('async')).length
    const exportedFns = fnSigs.filter(m => m[0].includes('export')).length

    const consistency = totalFns > 0
      ? Math.round(((typedFns + asyncFns + exportedFns) / (totalFns * 3)) * 100)
      : 0

    patterns.push({
      name: 'function-signature',
      scale: 'function',
      pattern: 'Function definitions with consistent signatures',
      occurrences: totalFns,
      consistency: Math.min(100, consistency + 30),
      isSelfSimilar: false,
      scales: ['function'],
    })

    if (typedFns > 0) {
      patterns.push({
        name: 'typed-parameters',
        scale: 'function',
        pattern: 'Functions with typed parameters',
        occurrences: typedFns,
        consistency: totalFns > 0 ? Math.round((typedFns / totalFns) * 100) : 0,
        isSelfSimilar: false,
        scales: ['function'],
      })
    }

    if (exportedFns > 0) {
      patterns.push({
        name: 'exported-functions',
        scale: 'function',
        pattern: 'Exported function declarations',
        occurrences: exportedFns,
        consistency: totalFns > 0 ? Math.round((exportedFns / totalFns) * 100) : 0,
        isSelfSimilar: false,
        scales: ['function'],
      })
    }
  }

  const returns = Array.from(content.matchAll(/\breturn\b/g)).length
  if (returns > 0 && totalFns > 0) {
    patterns.push({
      name: 'return-statements',
      scale: 'function',
      pattern: 'Return statements in functions',
      occurrences: returns,
      consistency: totalFns > 0 ? Math.min(100, Math.round((returns / totalFns) * 50) + 50) : 0,
      isSelfSimilar: false,
      scales: ['function'],
    })
  }

  return patterns
}

function extractClassPatterns(content: string): FractalPattern[] {
  const patterns: FractalPattern[] = []

  const classes = Array.from(content.matchAll(/(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/g))
  if (classes.length > 0) {
    const exportedClasses = classes.filter(m => m[0].includes('export')).length
    patterns.push({
      name: 'class-definitions',
      scale: 'class',
      pattern: 'Class definitions',
      occurrences: classes.length,
      consistency: classes.length > 0 ? Math.round((exportedClasses / classes.length) * 100) : 0,
      isSelfSimilar: false,
      scales: ['class'],
    })

    const methods = Array.from(content.matchAll(/(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*\w+)?\s*\{/g))
    if (methods.length > 0) {
      const privateMethods = Array.from(content.matchAll(/private\s+\w+\s*\(/g)).length
      patterns.push({
        name: 'class-methods',
        scale: 'class',
        pattern: 'Methods within classes',
        occurrences: methods.length,
        consistency: methods.length > 0 ? Math.min(100, Math.round((privateMethods / methods.length) * 100) + 30) : 0,
        isSelfSimilar: false,
        scales: ['class'],
      })
    }
  }

  return patterns
}

function extractFilePatterns(content: string): FractalPattern[] {
  const patterns: FractalPattern[] = []

  const imports = Array.from(content.matchAll(/^import\s/gm)).length
  const exports = Array.from(content.matchAll(/^export\s/gm)).length

  if (imports > 0) {
    patterns.push({
      name: 'import-statements',
      scale: 'file',
      pattern: 'Import declarations',
      occurrences: imports,
      consistency: 80,
      isSelfSimilar: false,
      scales: ['file'],
    })
  }

  if (exports > 0) {
    const namedExports = Array.from(content.matchAll(/^export\s+(?:const|let|var|function|class|type|interface|enum)\s/gm)).length
    patterns.push({
      name: 'export-statements',
      scale: 'file',
      pattern: 'Export declarations',
      occurrences: exports,
      consistency: exports > 0 ? Math.round((namedExports / exports) * 100) : 0,
      isSelfSimilar: false,
      scales: ['file'],
    })
  }

  return patterns
}

// ─── Self-Similarity Detection ──────────────────────────────────────────────────

/**
 * Detect self-similar patterns across scales.
 *
 * @example
 * detectSelfSimilarity(patterns) // => updated patterns with isSelfSimilar
 */
export function detectSelfSimilarity(patterns: FractalPattern[]): FractalPattern[] {
  const nameMap = new Map<string, FractalPattern[]>()
  for (const p of patterns) {
    const existing = nameMap.get(p.name) ?? []
    existing.push(p)
    nameMap.set(p.name, existing)
  }

  const updated = patterns.map(p => {
    const all = nameMap.get(p.name) ?? [p]
    const uniqueScales = Array.from(new Set(all.map(a => a.scale)))
    const isSelfSimilar = uniqueScales.length >= 2

    return {
      ...p,
      isSelfSimilar,
      scales: uniqueScales,
    }
  })

  return updated
}

// ─── Fractal Dimension ──────────────────────────────────────────────────────────

/**
 * Compute fractal dimension from level data.
 *
 * @example
 * computeFractalDimension(levels) // => FractalDimension
 */
export function computeFractalDimension(levels: FractalLevel[]): FractalDimension {
  if (levels.length <= 1) {
    return { dimension: 1.0, interpretation: 'simple', description: 'Single-scale structure' }
  }

  const complexities = levels.map(l => l.avgComplexity)
  const maxC = Math.max(...complexities)
  const minC = Math.min(...complexities)
  const range = maxC - minC

  const dimension = range > 0
    ? 1.0 + Math.min(2.0, (range / 100) * levels.length * 0.5)
    : 1.0 + (levels.length * 0.2)

  const dim = Math.round(dimension * 100) / 100
  const clamped = Math.max(1.0, Math.min(3.0, dim))

  let interpretation: DimensionInterpretation = 'simple'
  let description = ''
  if (clamped < 1.5) {
    interpretation = 'simple'
    description = 'Simple, linear code structure'
  } else if (clamped < 2.0) {
    interpretation = 'moderate'
    description = 'Moderate complexity with organized patterns'
  } else if (clamped < 2.5) {
    interpretation = 'complex'
    description = 'Complex structure with multiple layers'
  } else {
    interpretation = 'chaotic'
    description = 'Highly complex, potentially chaotic structure'
  }

  return { dimension: clamped, interpretation, description }
}

// ─── Self-Similarity Score ──────────────────────────────────────────────────────

/**
 * Compute self-similarity score between a level and other levels.
 *
 * @example
 * computeSelfSimilarityScore(level, others) // => 75
 */
export function computeSelfSimilarityScore(level: FractalLevel, otherLevels: FractalLevel[]): number {
  if (otherLevels.length === 0) return 100

  const diffs = otherLevels.map(other => {
    const complexityDiff = Math.abs(level.avgComplexity - other.avgComplexity)
    const patternDiff = Math.abs(level.patternCount - other.patternCount) * 5
    return 100 - (complexityDiff + patternDiff) / 2
  })

  const avg = diffs.reduce((s, d) => s + d, 0) / diffs.length
  return Math.max(0, Math.min(100, Math.round(avg)))
}

// ─── Fractal Quality Classification ─────────────────────────────────────────────

/**
 * Classify overall fractal quality.
 *
 * @example
 * classifyFractalQuality(80, 75, 1.5) // => 'crystalline'
 */
export function classifyFractalQuality(
  selfSimilarity: number,
  consistency: number,
  dimension: number,
): FractalOverallQuality {
  const score = (selfSimilarity + consistency) / 2

  if (score >= 80 && dimension < 2.5) return 'crystalline'
  if (score >= 65 && dimension < 2.0) return 'organized'
  if (score >= 45) return 'branching'
  if (score >= 25) return 'organic'
  return 'chaotic'
}

/**
 * Classify individual file quality.
 *
 * @example
 * classifyFileQuality(file) // => 'sierpinski'
 */
export function classifyFileQuality(file: FractalFile): FileQuality {
  if (file.selfSimilarity >= 90 && file.fractalDepth >= 3) return 'mandelbrot'
  if (file.selfSimilarity >= 75) return 'sierpinski'
  if (file.selfSimilarity >= 55) return 'koch'
  if (file.selfSimilarity >= 30) return 'tree'
  return 'random'
}

// ─── Iteration Score ────────────────────────────────────────────────────────────

/**
 * Compute iteration score — how deeply consistent patterns nest.
 *
 * @example
 * computeIterationScore(files) // => 75
 */
export function computeIterationScore(files: FractalFile[]): number {
  if (files.length === 0) return 0

  const avgSimilarity = files.reduce((s, f) => s + f.selfSimilarity, 0) / files.length
  const avgDepth = files.reduce((s, f) => s + f.fractalDepth, 0) / files.length
  const depthFactor = Math.min(100, avgDepth * 20)

  return Math.max(0, Math.min(100, Math.round((avgSimilarity * 0.6 + depthFactor * 0.4))))
}

// ─── Fractal Levels ─────────────────────────────────────────────────────────────

/**
 * Build fractal levels from files and contents.
 *
 * @example
 * buildFractalLevels(files, contents) // => FractalLevel[]
 */
export function buildFractalLevels(files: string[], contents: string[]): FractalLevel[] {
  const levels: FractalLevel[] = []

  const allFnPatterns: FractalPattern[] = []
  const allClassPatterns: FractalPattern[] = []
  const allFilePatterns: FractalPattern[] = []

  let totalFunctions = 0
  let totalClasses = 0
  let totalFnComplexity = 0

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const fnPats = extractPatternsAtScale(content, 'function')
    const clsPats = extractPatternsAtScale(content, 'class')
    const filePats = extractPatternsAtScale(content, 'file')

    allFnPatterns.push(...fnPats)
    allClassPatterns.push(...clsPats)
    allFilePatterns.push(...filePats)

    const fns = Array.from(content.matchAll(/function\s+\w+/g)).length
    totalFunctions += fns
    totalFnComplexity += content.split('\n').filter(l => /\bif\b|\bfor\b|\bwhile\b/.test(l)).length

    const cls = Array.from(content.matchAll(/class\s+\w+/g)).length
    totalClasses += cls
  }

  const avgFnComplexity = totalFunctions > 0 ? Math.min(100, Math.round((totalFnComplexity / totalFunctions) * 10)) : 0

  levels.push({
    scale: 'function',
    nodes: totalFunctions,
    avgComplexity: avgFnComplexity,
    patternCount: allFnPatterns.length,
    selfSimilarityScore: 0,
    dominantPattern: allFnPatterns[0]?.name ?? 'none',
  })

  levels.push({
    scale: 'class',
    nodes: totalClasses,
    avgComplexity: totalClasses > 0 ? avgFnComplexity : 0,
    patternCount: allClassPatterns.length,
    selfSimilarityScore: 0,
    dominantPattern: allClassPatterns[0]?.name ?? 'none',
  })

  levels.push({
    scale: 'file',
    nodes: files.length,
    avgComplexity: files.length > 0 ? Math.round(contents.reduce((s, c) => s + c.split('\n').length, 0) / files.length) : 0,
    patternCount: allFilePatterns.length,
    selfSimilarityScore: 0,
    dominantPattern: allFilePatterns[0]?.name ?? 'none',
  })

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i]
    if (!level) continue
    const others = levels.filter((_, j) => j !== i)
    level.selfSimilarityScore = computeSelfSimilarityScore(level, others)
  }

  return levels
}

// ─── Build Per-File ─────────────────────────────────────────────────────────────

function buildFractalFile(file: string, content: string): FractalFile {
  const fnPatterns = extractPatternsAtScale(content, 'function')
  const clsPatterns = extractPatternsAtScale(content, 'class')

  const allPatterns = [...fnPatterns, ...clsPatterns]
  const avgConsistency = allPatterns.length > 0
    ? Math.round(allPatterns.reduce((s, p) => s + p.consistency, 0) / allPatterns.length)
    : 0

  const nestedBlocks = Array.from(content.matchAll(/\{/g)).length
  const lines = content.split('\n').length
  const fractalDepth = lines > 0 ? Math.min(5, Math.max(1, Math.round(nestedBlocks / Math.max(1, lines) * 5))) : 0

  const selfSimilarity = allPatterns.length > 0
    ? Math.min(100, avgConsistency + (allPatterns.length > 2 ? 20 : 0))
    : 0

  const rawFile: FractalFile = {
    file,
    functionPatterns: fnPatterns,
    classPatterns: clsPatterns,
    selfSimilarity,
    fractalDepth,
    quality: 'random',
  }

  rawFile.quality = classifyFileQuality(rawFile)

  return rawFile
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate fractal analysis recommendations.
 *
 * @example
 * generateRecommendations(patterns, levels, files, stats) // => string[]
 */
export function generateRecommendations(
  patterns: FractalPattern[],
  _levels: FractalLevel[],
  files: FractalFile[],
  stats: FractalStats,
): string[] {
  const recs: string[] = []

  const randomFiles = files.filter(f => f.quality === 'random')
  if (randomFiles.length > 0) {
    recs.push(`${randomFiles.length} file${randomFiles.length > 1 ? 's' : ''} show random patterns — establish consistent coding patterns`)
  }

  if (stats.selfSimilarPatterns === 0 && patterns.length > 0) {
    recs.push('No self-similar patterns detected — apply consistent patterns across function, class, and file levels')
  }

  if (stats.avgConsistency < 40) {
    recs.push('Low pattern consistency — standardize coding conventions across the codebase')
  }

  if (stats.fractalDimension > 2.5) {
    recs.push('High fractal dimension indicates chaotic complexity — simplify structure at deeper scales')
  }

  if (stats.iterationScore < 30) {
    recs.push('Low iteration score — patterns do not nest consistently, refactor for deeper self-similarity')
  }

  if (stats.fractalQuality === 'chaotic') {
    recs.push('Overall chaotic structure — establish a clear architectural pattern and apply it uniformly')
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete fractal analysis result.
 *
 * @example
 * buildFractalResult(['a.ts'], ['code'], {}) // => FractalResult
 */
export function buildFractalResult(files: string[], contents: string[], _options: FractalOptions): FractalResult {
  if (files.length === 0) {
    return {
      patterns: [],
      levels: [],
      dimension: { dimension: 0, interpretation: 'simple', description: 'No files' },
      files: [],
      stats: {
        totalPatterns: 0, selfSimilarPatterns: 0, avgConsistency: 0,
        avgSelfSimilarity: 0, fractalDimension: 0, maxFractalDepth: 0,
        scaleInvariantCount: 0, mandelbrotFiles: 0, randomFiles: 0,
        overallSelfSimilarity: 0, fractalQuality: 'chaotic', iterationScore: 0,
      },
      recommendations: [],
    }
  }

  const fractalFiles = files.map((f, i) => buildFractalFile(f, contents[i] ?? ''))

  const allPatterns = fractalFiles.flatMap(f => [...f.functionPatterns, ...f.classPatterns])
  const updatedPatterns = detectSelfSimilarity(allPatterns)

  const levels = buildFractalLevels(files, contents)
  const dimension = computeFractalDimension(levels)

  const selfSimilarPatterns = updatedPatterns.filter(p => p.isSelfSimilar).length
  const avgConsistency = updatedPatterns.length > 0
    ? Math.round(updatedPatterns.reduce((s, p) => s + p.consistency, 0) / updatedPatterns.length)
    : 0
  const avgSelfSimilarity = fractalFiles.length > 0
    ? Math.round(fractalFiles.reduce((s, f) => s + f.selfSimilarity, 0) / fractalFiles.length)
    : 0
  const maxFractalDepth = Math.max(0, ...fractalFiles.map(f => f.fractalDepth))
  const scaleInvariantCount = updatedPatterns.filter(p => p.scales.length >= 2).length
  const mandelbrotFiles = fractalFiles.filter(f => f.quality === 'mandelbrot').length
  const randomFiles = fractalFiles.filter(f => f.quality === 'random').length
  const iterationScore = computeIterationScore(fractalFiles)

  const fractalQuality = classifyFractalQuality(avgSelfSimilarity, avgConsistency, dimension.dimension)

  const stats: FractalStats = {
    totalPatterns: updatedPatterns.length,
    selfSimilarPatterns,
    avgConsistency,
    avgSelfSimilarity,
    fractalDimension: dimension.dimension,
    maxFractalDepth,
    scaleInvariantCount,
    mandelbrotFiles,
    randomFiles,
    overallSelfSimilarity: avgSelfSimilarity,
    fractalQuality,
    iterationScore,
  }

  const recommendations = generateRecommendations(updatedPatterns, levels, fractalFiles, stats)

  return { patterns: updatedPatterns, levels, dimension, files: fractalFiles, stats, recommendations }
}
