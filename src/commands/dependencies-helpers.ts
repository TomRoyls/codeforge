import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// ─── Legacy Types (backward compatibility) ───────────────

interface ImportInfo {
  location: { column: number; end: number; line: number }
  modulePath: string
  sourceFile: string
}

interface DependencyNode {
  filePath: string
  importDetails: Map<string, ImportInfo>
  imports: Set<string>
}

interface DependencyGraph {
  nodes: Map<string, DependencyNode>
}

interface CircularDependency {
  cycle: readonly string[]
  location: ImportInfo['location']
}

interface DependenciesReport {
  circularDependencies: CircularDependency[]
  externalModules: string[]
  filesAnalyzed: number
  graph: { edges: [string, string][]; nodes: string[] }
  internalModules: string[]
  orphanFiles: string[]
}

interface CycleDetectionContext {
  cycles: CircularDependency[]
  graph: DependencyGraph
  maxDepth: number
  path: string[]
  recursionStack: Set<string>
  visited: Set<string>
}

export type {
  CircularDependency,
  CycleDetectionContext,
  DependenciesReport,
  DependencyGraph,
  DependencyNode,
  ImportInfo,
}

// ─── Legacy Functions (backward compatibility) ───────────

/**
 * Extract import statements from source code.
 * @example
 * extractImports('import foo from "bar"', 'test.ts')
 */
export function extractImports(sourceCode: string, filePath: string): ImportInfo[] {
  const imports: ImportInfo[] = []
  const lines = sourceCode.split('\n')

  for (const [lineIndex, line] of lines.entries()) {
    const trimmedLine = line.trim()

    const importMatch = trimmedLine.match(
      /^import\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/,
    )

    const dynamicMatch = trimmedLine.match(/import\s*\(\s*['"]([^'"]+)['"]/)

    const requireMatch = trimmedLine.match(/require\s*\(\s*['"]([^'"]+)['"]/)

    if (importMatch) {
      const modulePath = importMatch[1]

      if (modulePath) {
        imports.push({
          location: { column: 1, end: line.length, line: lineIndex + 1 },
          modulePath,
          sourceFile: filePath,
        })
      }
    } else if (dynamicMatch) {
      const modulePath = dynamicMatch[1]

      if (modulePath) {
        imports.push({
          location: { column: 1, end: line.length, line: lineIndex + 1 },
          modulePath,
          sourceFile: filePath,
        })
      }
    } else if (requireMatch) {
      const modulePath = requireMatch[1]

      if (modulePath) {
        imports.push({
          location: { column: 1, end: line.length, line: lineIndex + 1 },
          modulePath,
          sourceFile: filePath,
        })
      }
    }
  }

  return imports
}

/**
 * Find files not imported by any other file.
 * @example
 * findOrphanFiles(graph)
 */
export function findOrphanFiles(graph: DependencyGraph): string[] {
  const importedFiles = new Set<string>()

  for (const node of graph.nodes.values()) {
    for (const imp of node.imports) {
      if (imp.startsWith('.')) {
        importedFiles.add(imp)
      }
    }
  }

  const orphans: string[] = []

  for (const filePath of graph.nodes.keys()) {
    if (!importedFiles.has(filePath)) {
      orphans.push(filePath)
    }
  }

  return orphans
}

// ─── Legacy Re-exports (backward compatibility) ──────────

export {
  deduplicateCycles,
  detectCircularDependencies,
  detectCyclesFromNode,
  finishNodeVisit,
  normalizeCycle,
  processDependency,
  recordCycle,
} from './dependencies-cycle-helpers.js'

export {
  displayCircularDependencies,
  displayDependencyTree,
  displayDotFormat,
  displayExternalModules,
  displayFullReport,
  formatOutput,
  graphToDotFormat,
} from './dependencies-display-helpers.js'

// ─── NPM Dependency Analysis Types ───────────────────────

export interface SemverRange {
  raw: string
  operator: string
  major: number
  minor: number
  patch: number
}

export interface DependencyInfo {
  name: string
  version: string
  parsedRange: SemverRange
  type: 'dependency' | 'devDependency' | 'peerDependency' | 'optionalDependency'
  isDirect: boolean
  depth: number
}

export interface DependencyTree {
  name: string
  version: string
  dependencies: DependencyTree[]
  depth: number
}

export interface DependenciesResult {
  dependencies: DependencyInfo[]
  tree: DependencyTree
  summary: {
    totalDeps: number
    totalDevDeps: number
    totalPeerDeps: number
    totalOptionalDeps: number
    maxDepth: number
    versionTypes: { type: string; count: number }[]
    healthScore: number
  }
  byType: {
    dependencies: DependencyInfo[]
    devDependencies: DependencyInfo[]
    peerDependencies: DependencyInfo[]
    optionalDependencies: DependencyInfo[]
  }
}

interface PackageJsonData {
  name: string
  version: string
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  peerDependencies: Record<string, string>
  optionalDependencies: Record<string, string>
}

// ─── parsePackageJson ────────────────────────────────────

/**
 * Read and parse package.json from a directory.
 * Returns dependency fields or null if not found/invalid.
 * @example
 * parsePackageJson('/path/to/project')
 */
export function parsePackageJson(dir: string): PackageJsonData | null {
  const pkgPath = join(dir, 'package.json')

  if (!existsSync(pkgPath)) {
    return null
  }

  try {
    const content = readFileSync(pkgPath, 'utf8')
    const pkg = JSON.parse(content) as Record<string, unknown>

    return {
      name: typeof pkg['name'] === 'string' ? pkg['name'] : 'unknown',
      version: typeof pkg['version'] === 'string' ? pkg['version'] : '0.0.0',
      dependencies:
        pkg['dependencies'] && typeof pkg['dependencies'] === 'object'
          ? (pkg['dependencies'] as Record<string, string>)
          : {},
      devDependencies:
        pkg['devDependencies'] && typeof pkg['devDependencies'] === 'object'
          ? (pkg['devDependencies'] as Record<string, string>)
          : {},
      peerDependencies:
        pkg['peerDependencies'] && typeof pkg['peerDependencies'] === 'object'
          ? (pkg['peerDependencies'] as Record<string, string>)
          : {},
      optionalDependencies:
        pkg['optionalDependencies'] && typeof pkg['optionalDependencies'] === 'object'
          ? (pkg['optionalDependencies'] as Record<string, string>)
          : {},
    }
  } catch {
    return null
  }
}

// ─── parseVersionRange ───────────────────────────────────

/**
 * Parse a semver version range string into structured data.
 * @example
 * parseVersionRange('^4.18.2') // { operator: '^', major: 4, minor: 18, patch: 2 }
 * parseVersionRange('1.2.3')   // { operator: '', major: 1, minor: 2, patch: 3 }
 */
export function parseVersionRange(version: string): SemverRange {
  const raw = version.trim()

  // Star wildcard
  if (raw === '*') {
    return { raw, operator: '*', major: 0, minor: 0, patch: 0 }
  }

  // Workspace protocol
  if (raw.startsWith('workspace:')) {
    return { raw, operator: 'workspace', major: 0, minor: 0, patch: 0 }
  }

  // Complex ranges (contain spaces, e.g. ">=1.0.0 <2.0.0")
  if (raw.includes(' ') || raw.includes('||')) {
    const match = raw.match(/(\d+)\.(\d+)\.(\d+)/)
    if (match && match[1] && match[2] && match[3]) {
      return {
        raw,
        operator: 'complex',
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10),
      }
    }
    return { raw, operator: 'complex', major: 0, minor: 0, patch: 0 }
  }

  // Standard semver with optional operator
  const match = raw.match(/^([~^>=<]+)?(\d+)\.(\d+)\.(\d+)/)
  if (match && match[2] && match[3] && match[4]) {
    return {
      raw,
      operator: match[1] ?? '',
      major: parseInt(match[2], 10),
      minor: parseInt(match[3], 10),
      patch: parseInt(match[4], 10),
    }
  }

  // Fallback for unparseable versions
  return { raw, operator: '', major: 0, minor: 0, patch: 0 }
}

// ─── categorizeVersionType ───────────────────────────────

/**
 * Classify a version constraint by its type.
 * @example
 * categorizeVersionType({ operator: '^', ... }) // 'caret'
 * categorizeVersionType({ operator: '', ... })   // 'exact'
 */
export function categorizeVersionType(parsedRange: SemverRange): string {
  const { operator } = parsedRange

  if (operator === '') return 'exact'
  if (operator === '^') return 'caret'
  if (operator === '~') return 'tilde'
  if (operator === '>=' || operator === '>' || operator === '<' || operator === '<=') return 'range'
  if (operator === '*') return 'any'
  if (operator === 'workspace') return 'workspace'
  return 'complex'
}

// ─── extractDependencies ─────────────────────────────────

/**
 * Extract all dependencies from parsed package.json data as DependencyInfo[].
 * @example
 * extractDependencies(pkgData, 'all')
 * extractDependencies(pkgData, 'deps')
 */
export function extractDependencies(
  pkgData: PackageJsonData,
  typeFilter: string,
): DependencyInfo[] {
  const result: DependencyInfo[] = []

  const typeEntries: Array<{
    deps: Record<string, string>
    depType: DependencyInfo['type']
  }> = []

  if (typeFilter === 'deps' || typeFilter === 'all') {
    typeEntries.push({ deps: pkgData.dependencies, depType: 'dependency' })
  }
  if (typeFilter === 'devDeps' || typeFilter === 'all') {
    typeEntries.push({ deps: pkgData.devDependencies, depType: 'devDependency' })
  }
  if (typeFilter === 'all') {
    typeEntries.push({ deps: pkgData.peerDependencies, depType: 'peerDependency' })
    typeEntries.push({ deps: pkgData.optionalDependencies, depType: 'optionalDependency' })
  }

  for (const { deps, depType } of typeEntries) {
    for (const [name, version] of Object.entries(deps)) {
      result.push({
        name,
        version,
        parsedRange: parseVersionRange(version),
        type: depType,
        isDirect: true,
        depth: 0,
      })
    }
  }

  return result
}

// ─── buildDependencyTree ─────────────────────────────────

/**
 * Build a dependency tree from package.json data, recursing into node_modules.
 * @example
 * buildDependencyTree(pkgData, 3, '/path/to/project')
 */
export function buildDependencyTree(
  pkgData: PackageJsonData,
  maxDepth: number,
  baseDir: string,
): DependencyTree {
  const root: DependencyTree = {
    name: pkgData.name,
    version: pkgData.version,
    dependencies: [],
    depth: 0,
  }

  if (maxDepth <= 0) return root

  const allDeps: Record<string, string> = {
    ...pkgData.dependencies,
    ...pkgData.devDependencies,
  }

  for (const [name, version] of Object.entries(allDeps)) {
    root.dependencies.push(buildChildTree(name, version, baseDir, maxDepth, 1))
  }

  return root
}

function buildChildTree(
  name: string,
  version: string,
  baseDir: string,
  maxDepth: number,
  currentDepth: number,
): DependencyTree {
  const node: DependencyTree = {
    name,
    version,
    dependencies: [],
    depth: currentDepth,
  }

  if (currentDepth >= maxDepth) return node

  const depPkgPath = join(baseDir, 'node_modules', name, 'package.json')

  if (existsSync(depPkgPath)) {
    try {
      const content = readFileSync(depPkgPath, 'utf8')
      const pkg = JSON.parse(content) as { dependencies?: Record<string, string> }
      const deps = pkg.dependencies ?? {}

      for (const [childName, childVersion] of Object.entries(deps)) {
        node.dependencies.push(buildChildTree(childName, childVersion, baseDir, maxDepth, currentDepth + 1))
      }
    } catch {
      // Cannot read or parse — return node as-is
    }
  }

  return node
}

// ─── calculateMaxDepth ───────────────────────────────────

/**
 * Find the maximum depth of a dependency tree.
 * @example
 * calculateMaxDepth(tree) // 3
 */
export function calculateMaxDepth(tree: DependencyTree): number {
  if (tree.dependencies.length === 0) return tree.depth

  let max = tree.depth
  for (const child of tree.dependencies) {
    const childDepth = calculateMaxDepth(child)
    if (childDepth > max) max = childDepth
  }
  return max
}

// ─── calculateHealthScore ────────────────────────────────

/**
 * Compute a health score (0-100) for the dependency configuration.
 * @example
 * calculateHealthScore(result) // 85
 */
export function calculateHealthScore(result: DependenciesResult): number {
  let score = 100

  // -5 for each peer dependency (can cause issues)
  score -= result.summary.totalPeerDeps * 5

  // Deductions based on version constraint types
  for (const dep of result.dependencies) {
    const constraint = categorizeVersionType(dep.parsedRange)
    if (constraint === 'exact') score -= 10
    if (constraint === 'any') score -= 5
  }

  // -2 for each dev dependency beyond 20
  const excessDevDeps = Math.max(0, result.summary.totalDevDeps - 20)
  score -= excessDevDeps * 2

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score))
}

// ─── buildDependenciesResult ─────────────────────────────

/**
 * Orchestrate full npm dependency analysis for a directory.
 * @example
 * buildDependenciesResult('.', { typeFilter: 'all', maxDepth: 3 })
 */
export function buildDependenciesResult(
  dir: string,
  options: { typeFilter: string; maxDepth: number },
): DependenciesResult {
  const pkgData = parsePackageJson(dir)

  if (!pkgData) {
    return {
      dependencies: [],
      tree: { name: 'unknown', version: '0.0.0', dependencies: [], depth: 0 },
      summary: {
        totalDeps: 0,
        totalDevDeps: 0,
        totalPeerDeps: 0,
        totalOptionalDeps: 0,
        maxDepth: 0,
        versionTypes: [],
        healthScore: 85, // -15 for missing package.json
      },
      byType: {
        dependencies: [],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: [],
      },
    }
  }

  const dependencies = extractDependencies(pkgData, options.typeFilter)

  const tree = buildDependencyTree(pkgData, options.maxDepth, dir)

  const byType = {
    dependencies: dependencies.filter((d) => d.type === 'dependency'),
    devDependencies: dependencies.filter((d) => d.type === 'devDependency'),
    peerDependencies: dependencies.filter((d) => d.type === 'peerDependency'),
    optionalDependencies: dependencies.filter((d) => d.type === 'optionalDependency'),
  }

  // Version type breakdown
  const versionTypeCounts = new Map<string, number>()
  for (const dep of dependencies) {
    const vType = categorizeVersionType(dep.parsedRange)
    versionTypeCounts.set(vType, (versionTypeCounts.get(vType) ?? 0) + 1)
  }
  const versionTypes = Array.from(versionTypeCounts.entries()).map(([type, count]) => ({
    type,
    count,
  }))

  const summary = {
    totalDeps: byType.dependencies.length,
    totalDevDeps: byType.devDependencies.length,
    totalPeerDeps: byType.peerDependencies.length,
    totalOptionalDeps: byType.optionalDependencies.length,
    maxDepth: calculateMaxDepth(tree),
    versionTypes,
    healthScore: 0,
  }

  const result: DependenciesResult = {
    dependencies,
    tree,
    summary,
    byType,
  }

  result.summary.healthScore = calculateHealthScore(result)

  return result
}
