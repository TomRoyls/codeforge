import {dirname} from 'node:path'

// ─── Interfaces ──────────────────────────────────────────

export interface ModuleInfo {
  /** Directory name */
  name: string
  /** Relative path from project root */
  path: string
  /** Number of files in module */
  files: number
  /** Imports within same module */
  internalImports: number
  /** Imports from other modules */
  externalImports: number
  /** How many other modules import from this one */
  importedBy: number
  /** Module paths this module depends on */
  dependencies: string[]
  /** Module paths that depend on this module */
  dependents: string[]
  /** 0-100, lower is better */
  couplingScore: number
  /** 0-100, higher is better */
  cohesionScore: number
  /** Ce / (Ce + Ca), 0-1 (0=stable, 1=unstable) */
  instability: number
}

export interface CircularDependency {
  /** Ordered list of module paths forming the cycle */
  cycle: string[]
  /** Based on cycle length */
  severity: 'low' | 'medium' | 'high'
  /** Specific files involved */
  files: string[]
}

export interface LayerViolation {
  /** Module path (source) */
  from: string
  /** Module path (target) */
  to: string
  /** Description of violated rule */
  rule: string
  /** Severity level */
  severity: 'warning' | 'error'
}

export interface ScopeStats {
  totalModules: number
  avgCoupling: number
  avgCohesion: number
  avgInstability: number
  /** coupling > 70 */
  highlyCoupledModules: ModuleInfo[]
  /** externalImports === 0 */
  isolatedModules: ModuleInfo[]
  circularDependencies: CircularDependency[]
  layerViolations: LayerViolation[]
}

export interface ScopesResult {
  modules: ModuleInfo[]
  stats: ScopeStats
  /** from → to → count */
  dependencyMatrix: Record<string, Record<string, number>>
}

export interface ScopesOptions {
  maxDepth: number
}

// ─── Import extraction ───────────────────────────────────

/**
 * Extract all import/require paths from file content.
 *
 * @example
 * ```ts
 * extractImports("import { foo } from './bar'", 'src/index.ts')
 * // ['./bar']
 * ```
 */
export function extractImports(content: string, _filePath: string): string[] {
  const imports: string[] = []

  // ESM: import ... from '...'
  const esmFrom = /import\s+(?:type\s+)?(?:[\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = esmFrom.exec(content)) !== null) {
if (match[1] !== undefined) imports.push(match[1])
  }

  // ESM: import '...' (bare imports)
  const esmBare = /import\s+['"]([^'"]+)['"]/g
  while ((match = esmBare.exec(content)) !== null) {
if (match[1] !== undefined) imports.push(match[1])
  }

  // Dynamic imports: import('...')
  const dynamicImport = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((match = dynamicImport.exec(content)) !== null) {
if (match[1] !== undefined) imports.push(match[1])
  }

  // CommonJS: require('...')
  const requireRe = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((match = requireRe.exec(content)) !== null) {
if (match[1] !== undefined) imports.push(match[1])
  }

  return imports
}

// ─── Module path resolution ──────────────────────────────

/**
 * Resolve an import path to a module directory path.
 * Returns null for external/bare imports.
 *
 * @example
 * ```ts
 * resolveModulePath('./helpers', 'src/commands/count.ts')
 * // 'src/commands'
 * ```
 */
export function resolveModulePath(importPath: string, fromFile: string): string | null {
  if (!importPath.startsWith('.')) {
    return null
  }

  const fromDir = dirname(fromFile)
  const combined = fromDir + '/' + importPath
  const parts = combined.split('/')
  const resolvedParts: string[] = []

  for (const part of parts) {
    if (part === '' || part === '.') continue
    if (part === '..') {
      resolvedParts.pop()
    } else {
      resolvedParts.push(part)
    }
  }

  const cleanPath = resolvedParts.join('/')

  const hasExtension = /\.[a-zA-Z]+$/.test(cleanPath)
  const modulePath = hasExtension ? dirname(cleanPath) : cleanPath

  return modulePath.replace(/\\/g, '/')
}

// ─── Module map building ─────────────────────────────────

export type ContentReader = (filePath: string) => Promise<string>

interface RawModuleData {
  files: string[]
  imports: Array<{ from: string; to: string; rawImport: string }>
}

/**
 * Build a module map from discovered files.
 *
 * @example
 * ```ts
 * const map = await buildModuleMap(files, reader)
 * ```
 */
export async function buildModuleMap(
  files: Array<{ path: string }>,
  contentReader: ContentReader,
): Promise<Map<string, ModuleInfo>> {
  // Group files by their directory (module)
  const moduleDataMap = new Map<string, RawModuleData>()

  for (const file of files) {
    const modulePath = dirname(file.path).replace(/\\/g, '/')
    const existing = moduleDataMap.get(modulePath)
    if (existing) {
      existing.files.push(file.path)
    } else {
      moduleDataMap.set(modulePath, { files: [file.path], imports: [] })
    }
  }

  // For each file, extract imports and categorize them
  for (const file of files) {
    const fileModule = dirname(file.path).replace(/\\/g, '/')
    let content: string
    try {
      content = await contentReader(file.path)
    } catch {
      continue
    }

    const importPaths = extractImports(content, file.path)

    const data = moduleDataMap.get(fileModule)!

    for (const rawImport of importPaths) {
      const resolvedModule = resolveModulePath(rawImport, file.path)
      if (resolvedModule === null) continue
      // Skip self-imports at module level (will be counted differently)
      data.imports.push({ from: fileModule, to: resolvedModule, rawImport })
    }
  }

  // Build ModuleInfo for each module
  const result = new Map<string, ModuleInfo>()

  const isInternal = (from: string, to: string): boolean => {
    if (to === from) return true
    return to.startsWith(from + '/')
  }

  for (const [modulePath, data] of moduleDataMap) {
    const internalImports = data.imports.filter((imp) => isInternal(modulePath, imp.to)).length
    const externalImports = data.imports.filter((imp) => !isInternal(modulePath, imp.to)).length

    const dependencies = [...new Set(data.imports.filter((imp) => !isInternal(modulePath, imp.to)).map((imp) => imp.to))]

    const moduleName = modulePath.split('/').pop() ?? modulePath

    result.set(modulePath, {
      name: moduleName,
      path: modulePath,
      files: data.files.length,
      internalImports,
      externalImports,
      importedBy: 0, // Will be filled in second pass
      dependencies,
      dependents: [], // Will be filled in second pass
      couplingScore: 0,
      cohesionScore: 0,
      instability: 0,
    })
  }

  // Second pass: compute dependents and importedBy
  for (const [modulePath, info] of result) {
    for (const depPath of info.dependencies) {
      const dep = result.get(depPath)
      if (dep) {
        dep.dependents.push(modulePath)
        dep.importedBy++
      }
    }
  }

  // Compute scores
  for (const info of result.values()) {
    info.couplingScore = computeCouplingScore(info)
    info.cohesionScore = computeCohesionScore(info)
    info.instability = computeInstability(info)
  }

  return result
}

// ─── Scoring functions ───────────────────────────────────

/**
 * Compute coupling score for a module.
 * Formula: min(100, (externalImports + importedBy) * 5)
 * Lower is better.
 *
 * @example
 * ```ts
 * computeCouplingScore({ externalImports: 2, importedBy: 3 })
 * // 25
 * ```
 */
export function computeCouplingScore(module: { externalImports: number; importedBy: number }): number {
  return Math.min(100, (module.externalImports + module.importedBy) * 5)
}

/**
 * Compute cohesion score for a module.
 * Ratio of internal imports to total imports.
 * Higher is better.
 *
 * @example
 * ```ts
 * computeCohesionScore({ internalImports: 8, externalImports: 2 })
 * // 80
 * ```
 */
export function computeCohesionScore(module: {
  internalImports: number
  externalImports: number
}): number {
  const total = module.internalImports + module.externalImports
  if (total === 0) return 100
  return Math.round((module.internalImports / total) * 100)
}

/**
 * Compute Martin's instability metric.
 * I = Ce / (Ce + Ca) where Ce = efferent (outgoing), Ca = afferent (incoming).
 * 0 = stable (many dependents, few deps), 1 = unstable.
 *
 * @example
 * ```ts
 * computeInstability({ externalImports: 5, importedBy: 5 })
 * // 0.5
 * ```
 */
export function computeInstability(module: { externalImports: number; importedBy: number }): number {
  const ce = module.externalImports
  const ca = module.importedBy
  if (ce + ca === 0) return 0.5
  return Number((ce / (ce + ca)).toFixed(2))
}

// ─── Circular dependency detection ──────────────────────

/**
 * Detect circular dependencies using DFS cycle detection.
 *
 * @example
 * ```ts
 * detectCircularDependencies(moduleMap)
 * ```
 */
export function detectCircularDependencies(
  modules: Map<string, ModuleInfo>,
): CircularDependency[] {
  const cycles: CircularDependency[] = []
  const visited = new Set<string>()
  const recStack = new Set<string>()
  const path: string[] = []

  function dfs(modulePath: string): void {
    if (recStack.has(modulePath)) {
      // Found a cycle
      const cycleStart = path.indexOf(modulePath)
      if (cycleStart !== -1) {
        const cyclePath = [...path.slice(cycleStart), modulePath]
        const cycleLength = cyclePath.length - 1

        // Only record unique cycles (avoid recording same cycle from different starting points)
        const normalizedCycle = cyclePath.slice(0, -1)

        // Check if we've seen this cycle before
        const existingKey = cycles.find((c) => {
          const ck = [...c.cycle, c.cycle[0]].slice(0, -1).sort().join('→')
          return ck === normalizedCycle.sort().join('→')
        })

        if (!existingKey) {
          const severity = cycleLength <= 2 ? 'high' : cycleLength <= 3 ? 'medium' : 'low'

          // Find files involved
          const involvedFiles: string[] = []
          for (const mp of cyclePath.slice(0, -1)) {
            const mod = modules.get(mp)
            if (mod) {
              involvedFiles.push(...mod.files > 0 ? [mp] : [])
            }
          }

          cycles.push({
            cycle: cyclePath.slice(0, -1),
            severity,
            files: involvedFiles,
          })
        }
      }
      return
    }

    if (visited.has(modulePath)) return

    visited.add(modulePath)
    recStack.add(modulePath)
    path.push(modulePath)

    const mod = modules.get(modulePath)
    if (mod) {
      for (const dep of mod.dependencies) {
        dfs(dep)
      }
    }

    path.pop()
    recStack.delete(modulePath)
  }

  for (const modulePath of modules.keys()) {
    if (!visited.has(modulePath)) {
      dfs(modulePath)
    }
  }

  return cycles
}

// ─── Layer violation detection ───────────────────────────

/**
 * Detect common layer violations in module dependencies.
 *
 * @example
 * ```ts
 * detectLayerViolations(moduleMap)
 * ```
 */
export function detectLayerViolations(modules: Map<string, ModuleInfo>): LayerViolation[] {
  const violations: LayerViolation[] = []

  for (const [modulePath, info] of modules) {
    for (const dep of info.dependencies) {
      // Commands importing from other commands (should use shared helpers)
      if (isCommandsDir(modulePath) && isCommandsDir(dep) && modulePath !== dep) {
        violations.push({
          from: modulePath,
          to: dep,
          rule: 'Commands should not import from other commands; use shared helpers instead',
          severity: 'warning',
        })
      }

      // Utils importing from commands (should be one-way: commands → utils)
      if (isUtilsDir(modulePath) && isCommandsDir(dep)) {
        violations.push({
          from: modulePath,
          to: dep,
          rule: 'Utils should not import from commands; dependency should be one-way (commands → utils)',
          severity: 'error',
        })
      }

      // Core importing from commands (should be one-way: commands → core)
      if (isCoreDir(modulePath) && isCommandsDir(dep)) {
        violations.push({
          from: modulePath,
          to: dep,
          rule: 'Core should not import from commands; dependency should be one-way (commands → core)',
          severity: 'error',
        })
      }
    }
  }

  return violations
}

function isCommandsDir(path: string): boolean {
  const parts = path.split('/')
  return parts.includes('commands')
}

function isUtilsDir(path: string): boolean {
  const parts = path.split('/')
  return parts.includes('utils') || parts.includes('util')
}

function isCoreDir(path: string): boolean {
  const parts = path.split('/')
  return parts.includes('core')
}

// ─── Dependency matrix ───────────────────────────────────

/**
 * Build a from→to count matrix of module dependencies.
 *
 * @example
 * ```ts
 * buildDependencyMatrix(moduleMap)
 * // { 'src/commands': { 'src/core': 3 }, 'src/core': {} }
 * ```
 */
export function buildDependencyMatrix(
  modules: Map<string, ModuleInfo>,
): Record<string, Record<string, number>> {
  const matrix: Record<string, Record<string, number>> = {}

  for (const [modulePath, info] of modules) {
    matrix[modulePath] = {}
    for (const dep of info.dependencies) {
      if (modules.has(dep)) {
        matrix[modulePath]![dep] = (matrix[modulePath]![dep] ?? 0) + 1
      }
    }
  }

  return matrix
}

// ─── Orchestration ───────────────────────────────────────

/**
 * Build the complete scopes analysis result.
 *
 * @example
 * ```ts
 * const result = await buildScopesResult(files, reader, { maxDepth: 5 })
 * ```
 */
export async function buildScopesResult(
  files: Array<{ path: string }>,
  contentReader: ContentReader,
  _options: ScopesOptions,
): Promise<ScopesResult> {
  const moduleMap = await buildModuleMap(files, contentReader)
  const modules = Array.from(moduleMap.values())

  const circularDependencies = detectCircularDependencies(moduleMap)
  const layerViolations = detectLayerViolations(moduleMap)
  const dependencyMatrix = buildDependencyMatrix(moduleMap)

  // Compute averages
  const totalModules = modules.length
  const avgCoupling = totalModules > 0
    ? Number((modules.reduce((sum, m) => sum + m.couplingScore, 0) / totalModules).toFixed(1))
    : 0
  const avgCohesion = totalModules > 0
    ? Number((modules.reduce((sum, m) => sum + m.cohesionScore, 0) / totalModules).toFixed(1))
    : 0
  const avgInstability = totalModules > 0
    ? Number((modules.reduce((sum, m) => sum + m.instability, 0) / totalModules).toFixed(2))
    : 0

  const highlyCoupledModules = modules.filter((m) => m.couplingScore > 70)
  const isolatedModules = modules.filter((m) => m.externalImports === 0)

  const stats: ScopeStats = {
    totalModules,
    avgCoupling,
    avgCohesion,
    avgInstability,
    highlyCoupledModules,
    isolatedModules,
    circularDependencies,
    layerViolations,
  }

  return {
    modules,
    stats,
    dependencyMatrix,
  }
}
