// ─── Types ─────────────────────────────────────────────────────────────────────

export type Depth = 'near' | 'mid' | 'far'
export type Significance = 'minor' | 'notable' | 'major'
export type DepthCategory = 'shallow' | 'moderate' | 'deep' | 'abyssal'

export interface Observation {
  subject: string
  detail: string
  significance: Significance
  depth: Depth
}

export interface Perspective {
  depth: Depth
  description: string
  observations: Observation[]
  metrics: Record<string, number>
}

export interface DepthLayer {
  file: string
  nearDepth: number
  midDepth: number
  farDepth: number
  parallaxScore: number
  depthCategory: DepthCategory
}

export interface ParallaxStats {
  totalFiles: number
  shallowCount: number
  deepCount: number
  avgParallax: number
  avgNear: number
  avgMid: number
  avgFar: number
  deepestFile: string
  shallowestFile: string
  perspectiveAgreement: number
  overallDepth: number
}

export interface ParallaxResult {
  perspectives: Perspective[]
  layers: DepthLayer[]
  stats: ParallaxStats
  recommendations: string[]
}

export interface ParallaxOptions {
  verbose?: boolean
}

// ─── Near Perspective (function-level) ─────────────────────────────────────────

/**
 * Analyse content at function-level detail.
 *
 * @example
 * observeNear('function add(a, b) { return a + b }')
 * // => { observations: [...], metrics: { functionCount: 1, avgLength: 36, ... } }
 */
export function observeNear(content: string): Pick<Perspective, 'observations' | 'metrics'> {
  const lines = content.split('\n')
  const observations: Observation[] = []

  // Function detection
  const fnMatches = content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>|(?:async\s+)?(?:\w+)\s*\([^)]*\)\s*\{)/g) ?? []
  const arrowFnMatches = content.match(/=>\s*\{?/g) ?? []
  const totalFns = fnMatches.length + arrowFnMatches.length
  const avgFnLength = totalFns > 0 ? content.length / totalFns : content.length

  // Cyclomatic complexity indicators
  const ifCount = (content.match(/\bif\b/g) ?? []).length
  const elseCount = (content.match(/\belse\b/g) ?? []).length
  const switchCount = (content.match(/\bswitch\b/g) ?? []).length
  const caseCount = (content.match(/\bcase\b/g) ?? []).length
  const ternaryCount = (content.match(/\?[^?]/g) ?? []).length
  const complexity = ifCount + elseCount + switchCount + caseCount + ternaryCount + 1

  // Parameter counts
  const paramPattern = /\(([^)]*)\)/g
  let paramMatch: RegExpExecArray | null
  let totalParams = 0
  let fnWithParams = 0
  while ((paramMatch = paramPattern.exec(content)) !== null) {
    const params = paramMatch[1].split(',').filter(p => p.trim().length > 0)
    if (params.length > 0) {
      totalParams += params.length
      fnWithParams++
    }
  }
  const avgParams = fnWithParams > 0 ? totalParams / fnWithParams : 0

  // Return type coverage (TypeScript)
  const typedReturns = (content.match(/:\s*\w+\s*\)/g) ?? []).length
  const totalReturns = (content.match(/\breturn\b/g) ?? []).length
  const returnCoverage = totalReturns > 0 ? (typedReturns / totalReturns) * 100 : 100

  // Nesting depth
  let maxNesting = 0
  let currentNesting = 0
  for (const line of lines) {
    const opens = (line.match(/\{/g) ?? []).length
    const closes = (line.match(/\}/g) ?? []).length
    currentNesting += opens - closes
    if (currentNesting > maxNesting) maxNesting = currentNesting
  }

  if (totalFns > 15) {
    observations.push({ subject: 'function count', detail: `${totalFns} functions detected`, significance: 'major', depth: 'near' })
  } else if (totalFns > 8) {
    observations.push({ subject: 'function count', detail: `${totalFns} functions detected`, significance: 'notable', depth: 'near' })
  } else if (totalFns > 0) {
    observations.push({ subject: 'function count', detail: `${totalFns} functions detected`, significance: 'minor', depth: 'near' })
  }

  if (complexity > 15) {
    observations.push({ subject: 'complexity', detail: `cyclomatic complexity ~${complexity}`, significance: 'major', depth: 'near' })
  } else if (complexity > 8) {
    observations.push({ subject: 'complexity', detail: `cyclomatic complexity ~${complexity}`, significance: 'notable', depth: 'near' })
  }

  if (avgParams > 4) {
    observations.push({ subject: 'parameters', detail: `average ${avgParams.toFixed(1)} parameters per function`, significance: 'notable', depth: 'near' })
  }

  if (maxNesting > 5) {
    observations.push({ subject: 'nesting', detail: `max nesting depth ${maxNesting}`, significance: 'major', depth: 'near' })
  } else if (maxNesting > 3) {
    observations.push({ subject: 'nesting', detail: `max nesting depth ${maxNesting}`, significance: 'notable', depth: 'near' })
  }

  if (returnCoverage < 50 && totalReturns > 0) {
    observations.push({ subject: 'type coverage', detail: `return type coverage ${returnCoverage.toFixed(0)}%`, significance: 'notable', depth: 'near' })
  }

  const metrics: Record<string, number> = {
    avgFnLength: Math.round(avgFnLength),
    avgParams: Math.round(avgParams * 10) / 10,
    complexity,
    functionCount: totalFns,
    maxNesting,
    returnCoverage: Math.round(returnCoverage),
    ternaryCount,
  }

  return { metrics, observations }
}

// ─── Mid Perspective (file-level) ──────────────────────────────────────────────

/**
 * Analyse content at file-level structure.
 *
 * @example
 * observeMid('src/app.ts', content, allFiles)
 * // => { observations: [...], metrics: { lineCount: 42, ... } }
 */
export function observeMid(file: string, content: string, allFiles: string[]): Pick<Perspective, 'observations' | 'metrics'> {
  const lines = content.split('\n')
  const lineCount = lines.length
  const observations: Observation[] = []

  // File size
  if (lineCount > 300) {
    observations.push({ subject: 'file size', detail: `${lineCount} lines`, significance: 'major', depth: 'mid' })
  } else if (lineCount > 150) {
    observations.push({ subject: 'file size', detail: `${lineCount} lines`, significance: 'notable', depth: 'mid' })
  }

  // Import/export ratio
  const imports = (content.match(/import\s+/g) ?? []).length
  const exports = (content.match(/export\s+/g) ?? []).length
  const importExportRatio = imports > 0 ? exports / imports : exports

  if (imports > 10) {
    observations.push({ subject: 'imports', detail: `${imports} imports`, significance: 'notable', depth: 'mid' })
  }
  if (exports > 10) {
    observations.push({ subject: 'exports', detail: `${exports} exports`, significance: 'notable', depth: 'mid' })
  }

  // Documentation coverage
  const docComments = (content.match(/\/\*\*[\s\S]*?\*\//g) ?? []).length
  const lineComments = (content.match(/\/\/.*/g) ?? []).length
  const commentLines = docComments * 3 + lineComments
  const docRatio = lineCount > 0 ? commentLines / lineCount : 0

  if (docRatio < 0.05 && lineCount > 50) {
    observations.push({ subject: 'documentation', detail: `low doc coverage (${(docRatio * 100).toFixed(0)}%)`, significance: 'notable', depth: 'mid' })
  } else if (docRatio > 0.3) {
    observations.push({ subject: 'documentation', detail: `well documented (${(docRatio * 100).toFixed(0)}%)`, significance: 'minor', depth: 'mid' })
  }

  // Test file association
  const base = file.replace(/\.\w+$/, '')
  const hasTest = allFiles.some(f =>
    f !== file && (f.includes('.test.') || f.includes('.spec.')) && f.includes(base.split('/').pop() ?? '')
  )
  if (!hasTest && !file.includes('.test.') && !file.includes('.spec.')) {
    observations.push({ subject: 'testing', detail: 'no associated test file', significance: 'notable', depth: 'mid' })
  }

  // Code organization patterns
  const classCount = (content.match(/\bclass\s+\w+/g) ?? []).length
  const interfaceCount = (content.match(/\binterface\s+\w+/g) ?? []).length
  const typeCount = (content.match(/\btype\s+\w+/g) ?? []).length

  if (classCount > 3) {
    observations.push({ subject: 'organization', detail: `${classCount} classes in single file`, significance: 'notable', depth: 'mid' })
  }

  const metrics: Record<string, number> = {
    classCount,
    commentRatio: Math.round(docRatio * 100),
    docComments,
    exportCount: exports,
    importCount: imports,
    importExportRatio: Math.round(importExportRatio * 100) / 100,
    lineCount,
    hasTest: hasTest ? 1 : 0,
    interfaceCount,
    typeCount,
  }

  return { metrics, observations }
}

// ─── Far Perspective (module-level) ────────────────────────────────────────────

/**
 * Analyse the codebase at architectural/module level.
 *
 * @example
 * observeFar(files, contents)
 * // => { observations: [...], metrics: { directoryCount: 5, ... } }
 */
export function observeFar(files: string[], contents: string[]): Pick<Perspective, 'observations' | 'metrics'> {
  const observations: Observation[] = []

  // Directory structure
  const dirs = new Set<string>()
  for (const f of files) {
    const parts = f.split('/')
    if (parts.length > 1) dirs.add(parts.slice(0, -1).join('/'))
  }
  const dirCount = dirs.size

  if (dirCount > 10) {
    observations.push({ subject: 'directories', detail: `${dirCount} directories`, significance: 'notable', depth: 'far' })
  } else if (dirCount > 0) {
    observations.push({ subject: 'directories', detail: `${dirCount} directories`, significance: 'minor', depth: 'far' })
  }

  // Files per directory balance
  const dirFileCounts = new Map<string, number>()
  for (const f of files) {
    const parts = f.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '<root>'
    dirFileCounts.set(dir, (dirFileCounts.get(dir) ?? 0) + 1)
  }
  const fileCounts = Array.from(dirFileCounts.values())
  const maxFiles = Math.max(...fileCounts, 0)
  const avgFiles = fileCounts.length > 0 ? fileCounts.reduce((a, b) => a + b, 0) / fileCounts.length : 0

  if (maxFiles > 20) {
    observations.push({ subject: 'balance', detail: `directory with ${maxFiles} files (avg ${avgFiles.toFixed(1)})`, significance: 'major', depth: 'far' })
  } else if (maxFiles > 10) {
    observations.push({ subject: 'balance', detail: `directory with ${maxFiles} files (avg ${avgFiles.toFixed(1)})`, significance: 'notable', depth: 'far' })
  }

  // Inter-module coupling (shared imports across directories)
  const dirImports = new Map<string, Set<string>>()
  for (let i = 0; i < files.length; i++) {
    const parts = files[i].split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '<root>'
    if (!dirImports.has(dir)) dirImports.set(dir, new Set())
    const importDirs = dirImports.get(dir)!
    const importMatches = contents[i].match(/from\s+['"]([^'"]+)['"]/g) ?? []
    for (const m of importMatches) {
      const importPath = m.match(/from\s+['"]([^'"]+)['"]/)?.[1] ?? ''
      if (importPath.startsWith('.')) {
        const importParts = importPath.split('/')
        if (importParts.length > 1) {
          importDirs.add(importParts.slice(0, -1).join('/'))
        }
      }
    }
  }

  let totalCouplings = 0
  for (const [, deps] of dirImports) totalCouplings += deps.size
  const avgCoupling = dirCount > 0 ? totalCouplings / dirCount : 0

  if (avgCoupling > 5) {
    observations.push({ subject: 'coupling', detail: `high inter-module coupling (avg ${avgCoupling.toFixed(1)} external deps)`, significance: 'major', depth: 'far' })
  } else if (avgCoupling > 2) {
    observations.push({ subject: 'coupling', detail: `moderate coupling (avg ${avgCoupling.toFixed(1)} external deps)`, significance: 'notable', depth: 'far' })
  }

  // Module responsibility clarity
  const avgExportsPerDir = new Map<string, number>()
  for (let i = 0; i < files.length; i++) {
    const parts = files[i].split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '<root>'
    const exp = (contents[i].match(/export\s+/g) ?? []).length
    avgExportsPerDir.set(dir, (avgExportsPerDir.get(dir) ?? 0) + exp)
  }
  const exportCounts = Array.from(avgExportsPerDir.values())
  const avgExports = exportCounts.length > 0 ? exportCounts.reduce((a, b) => a + b, 0) / exportCounts.length : 0

  if (avgExports > 30) {
    observations.push({ subject: 'responsibility', detail: `high avg exports per directory (${avgExports.toFixed(0)})`, significance: 'notable', depth: 'far' })
  }

  // Architectural layers
  const hasCore = files.some(f => f.includes('core/'))
  const hasCommands = files.some(f => f.includes('commands/'))
  const hasUtils = files.some(f => f.includes('utils/') || f.includes('helpers/'))
  const layerCount = [hasCore, hasCommands, hasUtils].filter(Boolean).length

  if (layerCount >= 3) {
    observations.push({ subject: 'layers', detail: `${layerCount} architectural layers detected`, significance: 'minor', depth: 'far' })
  } else if (layerCount === 0) {
    observations.push({ subject: 'layers', detail: 'no clear architectural layers', significance: 'notable', depth: 'far' })
  }

  const metrics: Record<string, number> = {
    avgCoupling: Math.round(avgCoupling * 10) / 10,
    avgExportsPerDir: Math.round(avgExports),
    dirCount,
    fileCount: files.length,
    layerCount,
    maxFilesPerDir: maxFiles,
    avgFilesPerDir: Math.round(avgFiles * 10) / 10,
  }

  return { metrics, observations }
}

// ─── Depth Scoring ─────────────────────────────────────────────────────────────

/**
 * Compute near depth score (0-100) from function-level metrics.
 *
 * @example
 * computeNearDepth({ functionCount: 5, complexity: 3, maxNesting: 2, avgParams: 2, returnCoverage: 80, avgFnLength: 40 })
 * // => 52
 */
export function computeNearDepth(nearMetrics: Record<string, number>): number {
  const fnCount = nearMetrics.functionCount ?? 0
  const complexity = nearMetrics.complexity ?? 1
  const maxNesting = nearMetrics.maxNesting ?? 0
  const avgParams = nearMetrics.avgParams ?? 0
  const returnCov = nearMetrics.returnCoverage ?? 100
  const avgFnLen = nearMetrics.avgFnLength ?? 0

  // Function richness (0-25): more functions = more detail
  const fnScore = Math.min(25, fnCount * 2.5)
  // Complexity depth (0-25): moderate complexity reveals more
  const complexScore = Math.min(25, complexity * 1.5)
  // Nesting depth (0-25): deep nesting shows intricate logic
  const nestScore = Math.min(25, maxNesting * 5)
  // Type detail (0-15): typed returns show depth
  const typeScore = Math.min(15, returnCov * 0.15)
  // Function length detail (0-10): moderately long functions reveal more
  const lenScore = avgFnLen > 20 && avgFnLen < 200 ? 10 : Math.min(10, avgFnLen / 20)

  return Math.round(Math.min(100, fnScore + complexScore + nestScore + typeScore + lenScore))
}

/**
 * Compute mid depth score (0-100) from file-level metrics.
 *
 * @example
 * computeMidDepth({ lineCount: 100, importCount: 5, exportCount: 3, commentRatio: 15, hasTest: 1 })
 * // => 52
 */
export function computeMidDepth(midMetrics: Record<string, number>): number {
  const lineCount = midMetrics.lineCount ?? 0
  const imports = midMetrics.importCount ?? 0
  const exports = midMetrics.exportCount ?? 0
  const docRatio = midMetrics.commentRatio ?? 0
  const hasTest = midMetrics.hasTest ?? 0
  const classCount = midMetrics.classCount ?? 0
  const ifaceCount = midMetrics.interfaceCount ?? 0

  // Size richness (0-25)
  const sizeScore = Math.min(25, lineCount / 12)
  // Connectivity (0-20)
  const connScore = Math.min(20, (imports + exports) * 1.5)
  // Documentation depth (0-20)
  const docScore = Math.min(20, docRatio * 0.7)
  // Test presence (0-15)
  const testScore = hasTest ? 15 : 0
  // Structural richness (0-20)
  const structScore = Math.min(20, (classCount + ifaceCount) * 5)

  return Math.round(Math.min(100, sizeScore + connScore + docScore + testScore + structScore))
}

/**
 * Compute far depth score (0-100) from module-level metrics.
 *
 * @example
 * computeFarDepth({ dirCount: 5, layerCount: 3, avgCoupling: 2, maxFilesPerDir: 8 })
 * // => 68
 */
export function computeFarDepth(farMetrics: Record<string, number>): number {
  const dirCount = farMetrics.dirCount ?? 0
  const layerCount = farMetrics.layerCount ?? 0
  const avgCoupling = farMetrics.avgCoupling ?? 0
  const fileCount = farMetrics.fileCount ?? 0
  const avgFilesPerDir = farMetrics.avgFilesPerDir ?? 0

  // Directory organization (0-25)
  const dirScore = Math.min(25, dirCount * 3)
  // Layered architecture (0-25)
  const layerScore = Math.min(25, layerCount * 8)
  // Coupling awareness (0-25): moderate coupling shows connectedness
  const couplingScore = Math.min(25, avgCoupling * 5)
  // Scale awareness (0-25): more files = broader view
  const scaleScore = Math.min(25, fileCount * 0.5)

  return Math.round(Math.min(100, dirScore + layerScore + couplingScore + scaleScore))
}

// ─── Parallax Score ────────────────────────────────────────────────────────────

/**
 * Compute weighted parallax score from three perspectives.
 *
 * @example
 * computeParallaxScore(60, 70, 50) // => 61
 */
export function computeParallaxScore(near: number, mid: number, far: number): number {
  return Math.round(near * 0.35 + mid * 0.35 + far * 0.30)
}

/**
 * Classify a parallax score into a depth category.
 *
 * @example
 * classifyDepth(20) // => 'shallow'
 * classifyDepth(50) // => 'moderate'
 * classifyDepth(75) // => 'deep'
 * classifyDepth(92) // => 'abyssal'
 */
export function classifyDepth(parallaxScore: number): DepthCategory {
  if (parallaxScore >= 80) return 'abyssal'
  if (parallaxScore >= 55) return 'deep'
  if (parallaxScore >= 30) return 'moderate'
  return 'shallow'
}

// ─── Agreement & Overall ───────────────────────────────────────────────────────

/**
 * Compute how much the three perspectives agree (0-100).
 *
 * @example
 * computePerspectiveAgreement([pers1, pers2, pers3]) // => 85
 */
export function computePerspectiveAgreement(perspectives: Perspective[]): number {
  if (perspectives.length < 3) return 100

  const scores = perspectives.map(p => {
    const vals = Object.values(p.metrics)
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  })

  const max = Math.max(...scores)
  const min = Math.min(...scores)

  if (max === 0) return 100

  // Agreement is inverse of spread
  const spread = max - min
  return Math.round(Math.max(0, Math.min(100, 100 - spread * 2)))
}

/**
 * Compute overall codebase depth (0-100).
 *
 * @example
 * computeOverallDepth(layers) // => 62
 */
export function computeOverallDepth(layers: DepthLayer[]): number {
  if (layers.length === 0) return 0

  const total = layers.reduce((sum, l) => sum + l.parallaxScore, 0)
  return Math.round(total / layers.length)
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate recommendations based on perspectives, layers and stats.
 *
 * @example
 * generateRecommendations(perspectives, layers, stats)
 * // => ['Consider adding more detail to shallow files...']
 */
export function generateRecommendations(perspectives: Perspective[], layers: DepthLayer[], stats: ParallaxStats): string[] {
  const recs: string[] = []

  // Shallow files
  const shallowFiles = layers.filter(l => l.depthCategory === 'shallow')
  if (shallowFiles.length > 0) {
    recs.push(`${shallowFiles.length} file(s) are shallow — consider adding detail, structure, or architectural context`)
  }

  // Perspective disagreements
  if (stats.perspectiveAgreement < 50) {
    recs.push('Perspectives disagree significantly — investigate files where near/mid/far views diverge')
  }

  // Weak perspectives
  if (stats.avgNear < 30) {
    recs.push('Near perspective is weak — add function-level documentation and type annotations')
  }
  if (stats.avgMid < 30) {
    recs.push('Mid perspective is weak — improve file organization, add tests and doc comments')
  }
  if (stats.avgFar < 30) {
    recs.push('Far perspective is weak — establish clearer directory structure and architectural layers')
  }

  // Deep files
  const deepFiles = layers.filter(l => l.depthCategory === 'abyssal')
  if (deepFiles.length > 0) {
    recs.push(`${deepFiles.length} file(s) are abyssal — consider splitting to reduce cognitive load`)
  }

  // Test coverage gap
  const untestedMid = perspectives.find(p => p.depth === 'mid')
  if (untestedMid) {
    const testObs = untestedMid.observations.filter(o => o.subject === 'testing' && o.detail.includes('no associated'))
    if (testObs.length > stats.totalFiles * 0.5) {
      recs.push('More than half of files lack associated tests — improve test coverage')
    }
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the full parallax analysis result.
 *
 * @example
 * buildParallaxResult(files, contents, {})
 * // => { perspectives: [...], layers: [...], stats: {...}, recommendations: [...] }
 */
export function buildParallaxResult(files: string[], contents: string[], options: ParallaxOptions): ParallaxResult {
  // Near perspective
  const nearObs: Observation[] = []
  const nearAggMetrics: Record<string, number> = { avgFnLength: 0, avgParams: 0, complexity: 0, functionCount: 0, maxNesting: 0, returnCoverage: 0, ternaryCount: 0 }
  for (const c of contents) {
    const { observations, metrics } = observeNear(c)
    nearObs.push(...observations)
    for (const [k, v] of Object.entries(metrics)) {
      nearAggMetrics[k] = (nearAggMetrics[k] ?? 0) + v
    }
  }
  for (const k of Object.keys(nearAggMetrics)) {
    nearAggMetrics[k] = Math.round((nearAggMetrics[k] / contents.length) * 10) / 10
  }
  const nearPerspective: Perspective = { depth: 'near', description: 'Function-level detail view', observations: nearObs, metrics: nearAggMetrics }

  // Mid perspective
  const midObs: Observation[] = []
  const midAggMetrics: Record<string, number> = { lineCount: 0, importCount: 0, exportCount: 0, commentRatio: 0, hasTest: 0, classCount: 0, interfaceCount: 0, typeCount: 0, docComments: 0, importExportRatio: 0 }
  for (let i = 0; i < files.length; i++) {
    const { observations, metrics } = observeMid(files[i], contents[i], files)
    midObs.push(...observations)
    for (const [k, v] of Object.entries(metrics)) {
      midAggMetrics[k] = (midAggMetrics[k] ?? 0) + v
    }
  }
  for (const k of Object.keys(midAggMetrics)) {
    midAggMetrics[k] = Math.round((midAggMetrics[k] / contents.length) * 10) / 10
  }
  const midPerspective: Perspective = { depth: 'mid', description: 'File-level structural view', observations: midObs, metrics: midAggMetrics }

  // Far perspective
  const { observations: farObs, metrics: farMetrics } = observeFar(files, contents)
  const farPerspective: Perspective = { depth: 'far', description: 'Module-level architectural view', observations: farObs, metrics: farMetrics }

  const perspectives = [nearPerspective, midPerspective, farPerspective]

  // Build depth layers
  const layers: DepthLayer[] = files.map((file, i) => {
    const content = contents[i]
    const nearResult = observeNear(content)
    const midResult = observeMid(file, content, files)
    const farResult = observeFar(files, contents)

    const nearDepth = computeNearDepth(nearResult.metrics)
    const midDepth = computeMidDepth(midResult.metrics)
    const farDepth = computeFarDepth(farResult.metrics)
    const parallaxScore = computeParallaxScore(nearDepth, midDepth, farDepth)

    return {
      file,
      nearDepth,
      midDepth,
      farDepth,
      parallaxScore,
      depthCategory: classifyDepth(parallaxScore),
    }
  })

  // Stats
  const shallowCount = layers.filter(l => l.depthCategory === 'shallow').length
  const deepCount = layers.filter(l => l.depthCategory === 'deep' || l.depthCategory === 'abyssal').length
  const avgParallax = layers.length > 0 ? layers.reduce((s, l) => s + l.parallaxScore, 0) / layers.length : 0
  const avgNear = layers.length > 0 ? layers.reduce((s, l) => s + l.nearDepth, 0) / layers.length : 0
  const avgMid = layers.length > 0 ? layers.reduce((s, l) => s + l.midDepth, 0) / layers.length : 0
  const avgFar = layers.length > 0 ? layers.reduce((s, l) => s + l.farDepth, 0) / layers.length : 0

  const sorted = [...layers].sort((a, b) => b.parallaxScore - a.parallaxScore)
  const deepestFile = sorted.length > 0 ? sorted[0].file : ''
  const shallowestFile = sorted.length > 0 ? sorted[sorted.length - 1].file : ''

  const stats: ParallaxStats = {
    totalFiles: files.length,
    shallowCount,
    deepCount,
    avgParallax: Math.round(avgParallax),
    avgNear: Math.round(avgNear),
    avgMid: Math.round(avgMid),
    avgFar: Math.round(avgFar),
    deepestFile,
    shallowestFile,
    perspectiveAgreement: computePerspectiveAgreement(perspectives),
    overallDepth: computeOverallDepth(layers),
  }

  const recommendations = generateRecommendations(perspectives, layers, stats)

  return { perspectives, layers, stats, recommendations }
}
