// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImportWeight {
  importedFile: string
  directCost: number
  transitiveCost: number
  depth: number
  isExternal: boolean
}

export interface FileWeight {
  file: string
  directImports: number
  transitiveImports: number
  directLines: number
  transitiveLines: number
  weightScore: number
  category: 'lightweight' | 'medium' | 'heavy' | 'obese'
  imports: ImportWeight[]
}

export interface WeightDistribution {
  lightweight: number
  medium: number
  heavy: number
  obese: number
}

export interface WeightStats {
  totalFiles: number
  averageDirectImports: number
  averageTransitiveImports: number
  averageWeightScore: number
  heaviestFile: string
  lightestFile: string
  totalTransitiveLines: number
}

export interface WeightResult {
  files: FileWeight[]
  distribution: WeightDistribution
  stats: WeightStats
  heaviest: FileWeight[]
  recommendations: string[]
}

export interface WeightOptions {
  top?: number
}

// ─── Import Graph ─────────────────────────────────────────────────────────────

/**
 * Build a map from each file to its resolved direct imports.
 *
 * @example
 * buildImportGraph(files, contents) // Map<string, string[]>
 */
export function buildImportGraph(
  files: string[],
  contents: string[],
): Map<string, string[]> {
  const graph = new Map<string, string[]>()
  const fileSet = new Set(files)

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]!
    const content = contents[i] ?? ''
    const dir = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : ''
    const dirParts = dir ? dir.split('/') : []

    const imports: string[] = []
    const importMatches = content.matchAll(/from\s+['"](\.[^'"]+)['"]/g)
    for (const match of importMatches) {
      const rawPath = match[1] ?? ''
      const resolved = resolveImportPath(rawPath, dirParts, fileSet)
      if (resolved) {
        imports.push(resolved)
      }
    }
    graph.set(filePath, imports)
  }

  return graph
}

/**
 * Resolve a relative import path to a project file.
 *
 * @example
 * resolveImportPath('../core/file', ['src', 'commands'], fileSet) // 'src/core/file.ts'
 */
export function resolveImportPath(
  rawPath: string,
  fileDirParts: string[],
  fileSet: Set<string>,
): string | null {
  const segments = rawPath.split('/')
  const current = [...fileDirParts]

  for (const seg of segments) {
    if (seg === '..') {
      current.pop()
    } else if (seg !== '.') {
      current.push(seg)
    }
  }

  const joined = current.join('/')
  const extRemoved = joined.replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, '')

  const candidates = [
    extRemoved + '.ts',
    extRemoved + '.tsx',
    extRemoved + '.js',
    extRemoved + '/index.ts',
    extRemoved + '/index.js',
    joined,
  ]

  for (const candidate of candidates) {
    if (fileSet.has(candidate)) return candidate
  }

  return null
}

// ─── Transitive Imports ───────────────────────────────────────────────────────

/**
 * Compute all transitive imports for a file with cycle detection.
 *
 * @example
 * computeTransitiveImports('a.ts', graph, new Set()) // Set of all transitively imported files
 */
export function computeTransitiveImports(
  file: string,
  graph: Map<string, string[]>,
  visited: Set<string>,
): Set<string> {
  const result = new Set<string>()
  if (visited.has(file)) return result
  visited.add(file)

  const directImports = graph.get(file) ?? []
  for (const imp of directImports) {
    result.add(imp)
    const transitive = computeTransitiveImports(imp, graph, visited)
    for (const t of transitive) {
      result.add(t)
    }
  }

  return result
}

// ─── File Weight ──────────────────────────────────────────────────────────────

/**
 * Compute weight metrics for a single file.
 *
 * @example
 * computeFileWeight('a.ts', graph, lineMap, maxTransitive) // FileWeight
 */
export function computeFileWeight(
  file: string,
  graph: Map<string, string[]>,
  lineMap: Map<string, number>,
  maxTransitiveLines: number,
): FileWeight {
  const directImports = graph.get(file) ?? []
  const directLines = lineMap.get(file) ?? 0

  const visited = new Set<string>()
  const transitiveSet = computeTransitiveImports(file, graph, visited)

  let transitiveLines = directLines
  for (const imp of transitiveSet) {
    transitiveLines += lineMap.get(imp) ?? 0
  }

  const importWeights: ImportWeight[] = directImports.map((imp) => {
    const impVisited = new Set<string>()
    const impTransitive = computeTransitiveImports(imp, graph, impVisited)
    let transCost = lineMap.get(imp) ?? 0
    for (const t of impTransitive) {
      transCost += lineMap.get(t) ?? 0
    }
    return {
      importedFile: imp,
      directCost: lineMap.get(imp) ?? 0,
      transitiveCost: transCost,
      depth: 1,
      isExternal: false,
    }
  })

  const weightScore = maxTransitiveLines > 0
    ? Math.min(100, Math.round((transitiveLines / maxTransitiveLines) * 100))
    : 0

  return {
    file,
    directImports: directImports.length,
    transitiveImports: transitiveSet.size,
    directLines,
    transitiveLines,
    weightScore,
    category: classifyWeight(weightScore),
    imports: importWeights,
  }
}

// ─── classifyWeight ───────────────────────────────────────────────────────────

/**
 * Classify a weight score into a category.
 *
 * @example
 * classifyWeight(10) // 'lightweight'
 */
export function classifyWeight(score: number): 'lightweight' | 'medium' | 'heavy' | 'obese' {
  if (score < 25) return 'lightweight'
  if (score < 50) return 'medium'
  if (score < 75) return 'heavy'
  return 'obese'
}

// ─── computeDistribution ──────────────────────────────────────────────────────

/**
 * Count files by weight category.
 *
 * @example
 * computeDistribution(files) // { lightweight: 5, medium: 3, heavy: 1, obese: 0 }
 */
export function computeDistribution(files: FileWeight[]): WeightDistribution {
  const dist: WeightDistribution = { lightweight: 0, medium: 0, heavy: 0, obese: 0 }
  for (const f of files) {
    dist[f.category]++
  }
  return dist
}

// ─── findHeaviest ─────────────────────────────────────────────────────────────

/**
 * Find top-N heaviest files by weight score.
 *
 * @example
 * findHeaviest(files, 5) // top 5 heaviest FileWeight[]
 */
export function findHeaviest(files: FileWeight[], count: number): FileWeight[] {
  return [...files].sort((a, b) => b.weightScore - a.weightScore).slice(0, count)
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate actionable recommendations from weight analysis.
 *
 * @example
 * generateRecommendations(heaviest, stats) // ['Consider lazy loading...']
 */
export function generateRecommendations(
  heaviest: FileWeight[],
  stats: WeightStats,
): string[] {
  const recs: string[] = []

  for (const fw of heaviest) {
    if (fw.category === 'obese') {
      recs.push(`${fw.file} is obese (score ${fw.weightScore}) — consider lazy loading heavy dependencies or splitting this file`)
    } else if (fw.category === 'heavy') {
      recs.push(`${fw.file} is heavy (score ${fw.weightScore}) with ${fw.transitiveImports} transitive imports — review if all imports are needed`)
    }
  }

  if (stats.averageWeightScore > 50) {
    recs.push('Average weight score is high — consider introducing barrel files or reducing cross-module imports')
  }

  if (stats.totalTransitiveLines > stats.averageDirectImports * 1000) {
    recs.push('Total transitive lines are very high — look for modules that import large dependency trees')
  }

  if (recs.length === 0) {
    recs.push('Import weights are within healthy range. No action needed.')
  }

  return recs
}

// ─── buildWeightResult ────────────────────────────────────────────────────────

/**
 * Orchestrate full weight analysis.
 *
 * @example
 * buildWeightResult(['a.ts'], ['import b'], { top: 5 }) // WeightResult
 */
export function buildWeightResult(
  files: string[],
  contents: string[],
  options?: WeightOptions,
): WeightResult {
  const topCount = options?.top ?? 10
  const graph = buildImportGraph(files, contents)

  const lineMap = new Map<string, number>()
  for (let i = 0; i < files.length; i++) {
    lineMap.set(files[i]!, (contents[i] ?? '').split('\n').length)
  }

  const fileWeights: FileWeight[] = files.map((f) => {
    const allTransitive = new Set<string>()
    const visited = new Set<string>()
    const trans = computeTransitiveImports(f, graph, visited)
    for (const t of trans) allTransitive.add(t)
    let totalLines = lineMap.get(f) ?? 0
    for (const t of allTransitive) totalLines += lineMap.get(t) ?? 0
    return { file: f, directImports: 0, transitiveImports: 0, directLines: 0, transitiveLines: totalLines, weightScore: 0, category: 'lightweight', imports: [] }
  })

  const maxTransitive = Math.max(...fileWeights.map((fw) => fw.transitiveLines), 1)

  const fullWeights = files.map((f) =>
    computeFileWeight(f, graph, lineMap, maxTransitive),
  )

  const distribution = computeDistribution(fullWeights)
  const heaviest = findHeaviest(fullWeights, topCount)

  const totalFiles = fullWeights.length
  const averageDirectImports = totalFiles > 0
    ? Math.round(fullWeights.reduce((s, fw) => s + fw.directImports, 0) / totalFiles * 10) / 10
    : 0
  const averageTransitiveImports = totalFiles > 0
    ? Math.round(fullWeights.reduce((s, fw) => s + fw.transitiveImports, 0) / totalFiles * 10) / 10
    : 0
  const averageWeightScore = totalFiles > 0
    ? Math.round(fullWeights.reduce((s, fw) => s + fw.weightScore, 0) / totalFiles)
    : 0
  const totalTransitiveLines = fullWeights.reduce((s, fw) => s + fw.transitiveLines, 0)

  const sorted = [...fullWeights].sort((a, b) => b.weightScore - a.weightScore)
  const heaviestFile = sorted[0]?.file ?? 'none'
  const lightestFile = sorted[sorted.length - 1]?.file ?? 'none'

  const stats: WeightStats = {
    totalFiles,
    averageDirectImports,
    averageTransitiveImports,
    averageWeightScore,
    heaviestFile,
    lightestFile,
    totalTransitiveLines,
  }

  const recommendations = generateRecommendations(heaviest, stats)

  return {
    files: fullWeights,
    distribution,
    stats,
    heaviest,
    recommendations,
  }
}
