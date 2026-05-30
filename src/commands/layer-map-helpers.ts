// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single dependency connection between two layers.
 *
 * @example
 * const dep: LayerDependency = { from: 'presentation', to: 'business', count: 5, files: ['a.ts'], isViolation: false }
 */
export interface LayerDependency {
  from: string
  to: string
  count: number
  files: string[]
  isViolation: boolean
}

/**
 * An architectural layer violation.
 *
 * @example
 * const v: LayerViolation = { from: 'data', to: 'presentation', type: 'skip-layer', severity: 'critical', ... }
 */
export interface LayerViolation {
  from: string
  to: string
  type: 'skip-layer' | 'upward-dependency' | 'circular'
  description: string
  severity: 'warning' | 'critical'
  files: string[]
}

/**
 * An architectural layer.
 *
 * @example
 * const layer: ArchLayer = { name: 'presentation', files: [...], depth: 0, imports: [], exports: [] }
 */
export interface ArchLayer {
  name: string
  files: string[]
  fileCount: number
  totalLines: number
  totalSize: number
  imports: LayerDependency[]
  exports: string[]
  depth: number
  color: string
}

/**
 * Aggregate layer map statistics.
 *
 * @example
 * const stats: LayerMapStats = { totalLayers: 4, healthScore: 85, ... }
 */
export interface LayerMapStats {
  totalLayers: number
  totalFiles: number
  totalLines: number
  violationsCount: number
  layerBalance: number
  healthScore: number
}

/**
 * Complete layer map analysis result.
 *
 * @example
 * const result: LayerMapResult = { layers: [...], violations: [], stats: {...}, ... }
 */
export interface LayerMapResult {
  layers: ArchLayer[]
  dependencies: LayerDependency[]
  violations: LayerViolation[]
  stats: LayerMapStats
  recommendations: string[]
}

/**
 * Options for layer map analysis.
 *
 * @example
 * const opts: LayerMapOptions = { verbose: true }
 */
export interface LayerMapOptions {
  verbose?: boolean
}

// ─── Layer Detection ──────────────────────────────────────────────────────────

/** Layer name type */
export type LayerName = 'entry' | 'presentation' | 'business' | 'data' | 'infrastructure' | 'tests' | 'unknown'

/** Depth ordering: entry=0 (top) → infrastructure=4 (bottom) */
const LAYER_DEPTH: Record<LayerName, number> = {
  entry: 0,
  presentation: 1,
  business: 2,
  data: 3,
  infrastructure: 4,
  tests: 5,
  unknown: 6,
}

/** Layer colors for formatting */
const LAYER_COLORS: Record<LayerName, string> = {
  entry: 'green',
  presentation: 'cyan',
  business: 'yellow',
  data: 'magenta',
  infrastructure: 'blue',
  tests: 'gray',
  unknown: 'white',
}

/** Pattern maps for layer detection */
const PRESENTATION_DIRS = ['components', 'views', 'pages', 'routes', 'controllers', 'handlers', 'handler', 'commands', 'screens', 'ui']
const BUSINESS_DIRS = ['services', 'domain', 'business', 'logic', 'core', 'use-cases', 'usecases', 'features', 'app']
const DATA_DIRS = ['repositories', 'dao', 'data', 'models', 'stores', 'database', 'db', 'persistence', 'entities']
const INFRA_DIRS = ['config', 'utils', 'helpers', 'lib', 'shared', 'common', 'infrastructure', 'adapters', 'middleware', 'plugins']
const TEST_DIRS = ['test', 'tests', '__tests__', 'spec', 'specs', '__mocks__']
const ENTRY_FILES = ['index.ts', 'index.js', 'main.ts', 'main.js', 'app.ts', 'app.js', 'server.ts', 'server.js', 'cli.ts', 'cli.js']

/**
 * Detect which architectural layer a file belongs to.
 *
 * @example
 * detectLayer('src/components/Button.tsx') // 'presentation'
 * detectLayer('src/services/user.service.ts') // 'business'
 * detectLayer('src/repositories/user.repo.ts') // 'data'
 */
export function detectLayer(filePath: string): LayerName {
  const normalized = filePath.replace(/\\/g, '/')
  const parts = normalized.split('/')

  // Check entry files (root-level or src-level index/main/app/server)
  const fileName = parts[parts.length - 1] ?? ''
  if (ENTRY_FILES.includes(fileName) && parts.length <= 3) {
    return 'entry'
  }

  // Check test patterns
  for (const part of parts) {
    if (TEST_DIRS.includes(part.toLowerCase())) return 'tests'
  }
  if (fileName.includes('.test.') || fileName.includes('.spec.') || fileName.includes('_test.')) {
    return 'tests'
  }

  // Check layer directories (first match wins, scanning from shallowest)
  for (const part of parts) {
    const lower = part.toLowerCase()
    if (PRESENTATION_DIRS.includes(lower)) return 'presentation'
    if (BUSINESS_DIRS.includes(lower)) return 'business'
    if (DATA_DIRS.includes(lower)) return 'data'
    if (INFRA_DIRS.includes(lower)) return 'infrastructure'
  }

  // Check filename-based patterns for commands/ directory
  if (normalized.includes('/commands/') || normalized.includes('/handlers/')) return 'presentation'

  return 'unknown'
}

/**
 * Get the depth value for a layer.
 *
 * @example
 * getLayerDepth('presentation') // 1
 * getLayerDepth('infrastructure') // 4
 */
export function getLayerDepth(layer: string): number {
  return LAYER_DEPTH[layer as LayerName] ?? 6
}

/**
 * Get the color for a layer.
 *
 * @example
 * getLayerColor('presentation') // 'cyan'
 */
export function getLayerColor(layer: string): string {
  return LAYER_COLORS[layer as LayerName] ?? 'white'
}

// ─── Build Layers ─────────────────────────────────────────────────────────────

/**
 * Group files into architectural layers with stats.
 *
 * @example
 * const layers = buildLayers(['src/components/A.tsx', 'src/services/B.ts'], [contentA, contentB])
 */
export function buildLayers(files: string[], contents: string[]): ArchLayer[] {
  const layerMap = new Map<string, { files: string[]; lines: number; size: number }>()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const layer = detectLayer(file)

    const existing = layerMap.get(layer)
    if (existing) {
      existing.files.push(file)
      existing.lines += content.split('\n').length
      existing.size += content.length
    } else {
      layerMap.set(layer, {
        files: [file],
        lines: content.split('\n').length,
        size: content.length,
      })
    }
  }

  const layers: ArchLayer[] = []
  for (const [name, data] of layerMap) {
    layers.push({
      name,
      files: data.files.sort(),
      fileCount: data.files.length,
      totalLines: data.lines,
      totalSize: data.size,
      imports: [],
      exports: [],
      depth: getLayerDepth(name),
      color: getLayerColor(name),
    })
  }

  layers.sort((a, b) => a.depth - b.depth)
  return layers
}

// ─── Extract Imports ──────────────────────────────────────────────────────────

/**
 * Extract import paths from source content.
 *
 * @example
 * extractImportPaths("import { foo } from './bar'") // ['./bar']
 */
export function extractImportPaths(content: string): string[] {
  const paths: string[] = []
  const regex = /import\s+.*?from\s+['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    paths.push(match[1] ?? '')
  }
  return paths
}

// ─── Analyze Layer Dependencies ───────────────────────────────────────────────

/**
 * Analyze cross-layer dependencies.
 *
 * @example
 * const deps = analyzeLayerDependencies(layers, files, contents)
 */
export function analyzeLayerDependencies(
  layers: ArchLayer[],
  files: string[],
  contents: string[],
): LayerDependency[] {
  const fileToLayer = new Map<string, string>()
  for (const layer of layers) {
    for (const file of layer.files) {
      fileToLayer.set(file, layer.name)
    }
  }

  const depMap = new Map<string, { count: number; files: Set<string> }>()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const fromLayer = fileToLayer.get(file)
    if (!fromLayer) continue

    const imports = extractImportPaths(content)
    for (const imp of imports) {
      // Only consider relative imports
      if (!imp.startsWith('.')) continue

      // Try to match import to a known file
      const resolvedFile = resolveImportToLayerFile(imp, file, fileToLayer)
      if (!resolvedFile) continue

      const toLayer = fileToLayer.get(resolvedFile)
      if (!toLayer || toLayer === fromLayer) continue

      const key = `${fromLayer}->${toLayer}`
      const existing = depMap.get(key)
      if (existing) {
        existing.count++
        existing.files.add(file)
      } else {
        depMap.set(key, { count: 1, files: new Set([file]) })
      }
    }
  }

  const results: LayerDependency[] = []
  for (const [key, data] of depMap) {
    const [from, to] = key.split('->')
    const isViolation = isDependencyViolation(from!, to!)
    results.push({
      from: from!,
      to: to!,
      count: data.count,
      files: [...data.files].sort(),
      isViolation,
    })
  }

  results.sort((a, b) => b.count - a.count)
  return results
}

/**
 * Resolve an import path to a file in the layer map.
 *
 * @example
 * resolveImportToLayerFile('./foo', 'src/a.ts', fileToLayer) // 'src/foo.ts'
 */
export function resolveImportToLayerFile(
  importPath: string,
  fromFile: string,
  fileToLayer: Map<string, string>,
): string | null {
  const dir = fromFile.substring(0, fromFile.lastIndexOf('/'))
  const segments = importPath.split('/')
  const resolved = [...dir.split('/'), ...segments].filter((s) => s !== '.')

  // Handle ..
  const stack: string[] = []
  for (const seg of resolved) {
    if (seg === '..') {
      stack.pop()
    } else {
      stack.push(seg)
    }
  }

  const candidate = stack.join('/')

  // Try exact match, then with extensions
  for (const ext of ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js']) {
    const tryPath = candidate + ext
    if (fileToLayer.has(tryPath)) return tryPath
  }

  return null
}

// ─── Violation Detection ──────────────────────────────────────────────────────

/**
 * Check if a dependency from one layer to another is a violation.
 *
 * Proper flow: entry → presentation → business → data → infrastructure
 * Violations: upward dependencies, skip-layer
 *
 * @example
 * isDependencyViolation('data', 'presentation') // true
 * isDependencyViolation('presentation', 'business') // false
 */
export function isDependencyViolation(from: string, to: string): boolean {
  const fromDepth = getLayerDepth(from)
  const toDepth = getLayerDepth(to)

  // Tests and unknown layers are exempt
  if (from === 'tests' || from === 'unknown' || to === 'tests' || to === 'unknown') return false

  // Upward = to has lower depth number than from (e.g., data(3) → presentation(1))
  if (toDepth < fromDepth) return true

  // Skip-layer: jumping more than 1 level down
  if (toDepth - fromDepth > 1) return true

  return false
}

/**
 * Detect all architectural violations from dependencies.
 *
 * @example
 * const violations = detectLayerViolations(dependencies)
 */
export function detectLayerViolations(dependencies: LayerDependency[]): LayerViolation[] {
  const violations: LayerViolation[] = []

  for (const dep of dependencies) {
    if (!dep.isViolation) continue

    const fromDepth = getLayerDepth(dep.from)
    const toDepth = getLayerDepth(dep.to)

    let type: LayerViolation['type']
    if (toDepth < fromDepth) {
      type = 'upward-dependency'
    } else if (toDepth - fromDepth > 1) {
      type = 'skip-layer'
    } else {
      continue
    }

    violations.push({
      from: dep.from,
      to: dep.to,
      type,
      description: `${dep.from} → ${dep.to}: ${type === 'upward-dependency' ? 'upward dependency' : 'skip-layer dependency'} (${dep.count} imports)`,
      severity: type === 'upward-dependency' ? 'critical' : 'warning',
      files: dep.files,
    })
  }

  // Check for circular dependencies
  const circulars = detectCircularDependencies(dependencies)
  for (const circ of circulars) {
    violations.push({
      from: circ.from,
      to: circ.to,
      type: 'circular',
      description: `Circular dependency: ${circ.from} ↔ ${circ.to} (${circ.count} imports)`,
      severity: 'critical',
      files: circ.files,
    })
  }

  return violations
}

/**
 * Detect circular dependencies between layers.
 *
 * @example
 * detectCircularDependencies(deps) // [{ from: 'business', to: 'data', ... }]
 */
export function detectCircularDependencies(dependencies: LayerDependency[]): LayerDependency[] {
  const circulars: LayerDependency[] = []
  const seen = new Set<string>()

  for (const dep of dependencies) {
    const key = `${dep.from}->${dep.to}`
    const reverseKey = `${dep.to}->${dep.from}`

    if (seen.has(key)) continue

    const reverse = dependencies.find((d) => d.from === dep.to && d.to === dep.from)
    if (reverse) {
      circulars.push(dep)
      seen.add(key)
      seen.add(reverseKey)
    }
  }

  return circulars
}

// ─── Layer Balance ─────────────────────────────────────────────────────────────

/**
 * Compute how evenly distributed files are across layers (0-1).
 *
 * @example
 * computeLayerBalance(layers) // 0.75
 */
export function computeLayerBalance(layers: ArchLayer[]): number {
  if (layers.length <= 1) return 1

  const counts = layers.map((l) => l.fileCount)
  const total = counts.reduce((a, b) => a + b, 0)
  if (total === 0) return 1

  const expected = total / layers.length
  const deviations = counts.reduce((sum, c) => sum + Math.abs(c - expected), 0)
  const maxDeviation = total * (1 - 1 / layers.length) + (total / layers.length) * (layers.length - 1)

  return Math.round((1 - deviations / maxDeviation) * 100) / 100
}

// ─── Health Score ──────────────────────────────────────────────────────────────

/**
 * Compute health score (0-100) based on violations and balance.
 *
 * @example
 * computeHealthScore(3, 0.8) // 72
 */
export function computeHealthScore(violationsCount: number, balance: number): number {
  let score = 100

  // Penalty for violations
  score -= violationsCount * 10
  if (score < 0) score = 0

  // Balance bonus/penalty (balance is 0-1, ideal is 1)
  score = Math.round(score * (0.5 + balance * 0.5))

  return Math.max(0, Math.min(100, score))
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate architectural improvement recommendations.
 *
 * @example
 * generateLayerRecommendations(violations, stats) // ['Consider restructuring...']
 */
export function generateLayerRecommendations(violations: LayerViolation[], stats: LayerMapStats): string[] {
  const recs: string[] = []

  if (stats.violationsCount === 0) {
    recs.push('No architectural violations detected. Layer structure looks clean.')
  }

  const upward = violations.filter((v) => v.type === 'upward-dependency')
  if (upward.length > 0) {
    recs.push(`${upward.length} upward dependenc(y/ies) found. Lower layers should not depend on higher layers.`)
    for (const v of upward.slice(0, 3)) {
      recs.push(`  - ${v.from} → ${v.to}: Consider using dependency inversion or events.`)
    }
  }

  const skip = violations.filter((v) => v.type === 'skip-layer')
  if (skip.length > 0) {
    recs.push(`${skip.length} skip-layer dependenc(y/ies) found. Avoid jumping across layers.`)
  }

  const circular = violations.filter((v) => v.type === 'circular')
  if (circular.length > 0) {
    recs.push(`${circular.length} circular dependenc(y/ies) between layers. Extract shared logic to a common module.`)
  }

  if (stats.layerBalance < 0.3) {
    recs.push('Layer balance is very low. Consider redistributing logic more evenly across layers.')
  }

  if (recs.length === 0) {
    recs.push('Architecture looks healthy. Good job maintaining layer separation!')
  }

  return recs
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Build complete layer map analysis result.
 *
 * @example
 * const result = buildLayerMapResult(['src/a.ts'], [content], {})
 */
export function buildLayerMapResult(
  files: string[],
  contents: string[],
  _options: LayerMapOptions = {},
): LayerMapResult {
  const layers = buildLayers(files, contents)
  const dependencies = analyzeLayerDependencies(layers, files, contents)
  const violations = detectLayerViolations(dependencies)

  // Populate layer exports
  for (const layer of layers) {
    layer.exports = layer.files.slice()
    layer.imports = dependencies.filter((d) => d.from === layer.name)
  }

  const totalFiles = files.length
  const totalLines = contents.reduce((sum, c) => sum + c.split('\n').length, 0)
  const balance = computeLayerBalance(layers)
  const healthScore = computeHealthScore(violations.length, balance)

  const stats: LayerMapStats = {
    totalLayers: layers.length,
    totalFiles,
    totalLines,
    violationsCount: violations.length,
    layerBalance: balance,
    healthScore,
  }

  const recommendations = generateLayerRecommendations(violations, stats)

  return { layers, dependencies, violations, stats, recommendations }
}
