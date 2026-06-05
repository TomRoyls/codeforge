// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single impacted node in the dependency graph.
 *
 * @example
 * const node: ImpactNode = { file: 'src/app.ts', depth: 1, isDirect: true, riskLevel: 'medium', ... }
 */
export interface ImpactNode {
  file: string
  depth: number
  imports: string[]
  totalImports: number
  isDirect: boolean
  riskLevel: 'low' | 'medium' | 'high'
  reason: string
}

/**
 * A chain of dependencies from the target outward.
 *
 * @example
 * const chain: ImpactChain = { path: ['target.ts', 'a.ts', 'b.ts'], depth: 2, files: [...] }
 */
export interface ImpactChain {
  path: string[]
  depth: number
  files: string[]
}

/**
 * Aggregate impact statistics.
 *
 * @example
 * const stats: ImpactStats = { blastRadius: 15, directCount: 3, estimatedEffort: 'medium' }
 */
export interface ImpactStats {
  blastRadius: number
  directCount: number
  indirectCount: number
  maxChainLength: number
  averageRiskScore: number
  highestRiskFile: string
  estimatedEffort: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Complete impact analysis result.
 *
 * @example
 * const result: ImpactResult = { target: 'src/core.ts', directDependents: [...], ... }
 */
export interface ImpactResult {
  target: string
  directDependents: ImpactNode[]
  indirectDependents: ImpactNode[]
  chains: ImpactChain[]
  stats: ImpactStats
  exports: string[]
  unusedExports: string[]
  recommendations: string[]
}

/**
 * Options for impact analysis.
 *
 * @example
 * const opts: ImpactOptions = { depth: 3, verbose: true }
 */
export interface ImpactOptions {
  depth?: number
  verbose?: boolean
}

// ─── Import/Export Extraction ──────────────────────────────────────────────────

/**
 * Extract all import paths from source content.
 *
 * @example
 * extractImports("import { x } from './a'\nimport y from './b'") // ['./a', './b']
 */
export function extractImports(content: string): string[] {
  const paths: string[] = []
  const regex = /import\s+.*?from\s+['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    paths.push(match[1] ?? '')
  }
  return paths
}

/**
 * Extract import specifiers for a specific source from content.
 *
 * @example
 * extractImportsFrom("import { foo, bar } from './a'", './a') // ['foo', 'bar']
 */
export function extractImportsFrom(content: string, source: string): string[] {
  const names: string[] = []
  const regex = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    if (match[2] === source) {
      const specifiers = (match[1] ?? '').split(',').map((s) => s.trim().split(/\s+as\s+/)[0]!.trim()).filter(Boolean)
      names.push(...specifiers)
    }
  }
  const defaultRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g
  while ((match = defaultRegex.exec(content)) !== null) {
    if (match[2] === source) {
      names.push(match[1] ?? '')
    }
  }
  const starRegex = /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g
  while ((match = starRegex.exec(content)) !== null) {
    if (match[2] === source) {
      names.push(`* as ${match[1] ?? ''}`)
    }
  }
  return names
}

/**
 * Extract all export names from source content.
 *
 * @example
 * extractExports("export function foo() {} export const bar = 1") // ['foo', 'bar']
 */
export function extractExports(content: string): string[] {
  const names: string[] = []

  const funcRegex = /export\s+(?:async\s+)?function\s+(\w+)/g
  let match: RegExpExecArray | null
  while ((match = funcRegex.exec(content)) !== null) names.push(match[1] ?? '')

  const constRegex = /export\s+const\s+(\w+)/g
  while ((match = constRegex.exec(content)) !== null) names.push(match[1] ?? '')

  const classRegex = /export\s+class\s+(\w+)/g
  while ((match = classRegex.exec(content)) !== null) names.push(match[1] ?? '')

  const typeRegex = /export\s+(?:type|interface)\s+(\w+)/g
  while ((match = typeRegex.exec(content)) !== null) names.push(match[1] ?? '')

  const namedRegex = /export\s+\{\s*([^}]+)\s*\}/g
  while ((match = namedRegex.exec(content)) !== null) {
    const items = (match[1] ?? '').split(',').map((s) => s.trim().split(/\s+as\s+/)[0]!.trim()).filter(Boolean)
    names.push(...items)
  }

  return names
}

// ─── Path Resolution ──────────────────────────────────────────────────────────

/**
 * Resolve a relative import path against the importing file.
 *
 * @example
 * resolveImportPath('./foo', 'src/mod/a.ts') // 'src/mod/foo.ts'
 */
export function resolveImportPath(importPath: string, fromFile: string): string {
  if (!importPath.startsWith('.')) return importPath

  const dir = fromFile.includes('/') ? fromFile.substring(0, fromFile.lastIndexOf('/')) : ''
  const segments = [...dir.split('/').filter(Boolean), ...importPath.split('/')]

  const stack: string[] = []
  for (const seg of segments) {
    if (seg === '.') continue
    if (seg === '..') { stack.pop(); continue }
    stack.push(seg)
  }

  return stack.join('/')
}

/**
 * Try to match a resolved path against known files.
 *
 * @example
 * matchFile('src/mod/foo', ['src/mod/foo.ts', 'src/bar.ts']) // 'src/mod/foo.ts'
 */
export function matchFile(resolved: string, knownFiles: string[]): string | null {
  for (const ext of ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js']) {
    const candidate = resolved + ext
    if (knownFiles.includes(candidate)) return candidate
  }
  return null
}

// ─── Reverse Dependency Map ───────────────────────────────────────────────────

/**
 * Build a map of file → list of files that import it, with what they import.
 *
 * @example
 * buildReverseDependencyMap(['a.ts', 'b.ts'], ["import { x } from './a'", ""]) // Map { 'a.ts' => [{ file: 'b.ts', imports: ['x'] }] }
 */
export function buildReverseDependencyMap(
  files: string[],
  contents: string[],
): Map<string, { file: string; imports: string[] }[]> {
  const reverseMap = new Map<string, { file: string; imports: string[] }[]>()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const imports = extractImports(content)

    for (const imp of imports) {
      if (!imp.startsWith('.')) continue
      const resolved = resolveImportPath(imp, file)
      const matched = matchFile(resolved, files)
      if (!matched) continue

      const specifiers = extractImportsFrom(content, imp)
      const entry = { file, imports: specifiers }

      const existing = reverseMap.get(matched)
      if (existing) {
        existing.push(entry)
      } else {
        reverseMap.set(matched, [entry])
      }
    }
  }

  return reverseMap
}

// ─── Direct Dependents ────────────────────────────────────────────────────────

/**
 * Compute direct dependents of the target file.
 *
 * @example
 * computeDirectDependents('src/core.ts', reverseMap) // [{ file: 'src/app.ts', depth: 1, ... }]
 */
export function computeDirectDependents(
  target: string,
  reverseMap: Map<string, { file: string; imports: string[] }[]>,
  targetExports: string[],
): ImpactNode[] {
  const deps = reverseMap.get(target) ?? []

  return deps.map((dep) => {
    const importedCount = dep.imports.length
    const exportCount = targetExports.length || 1
    const ratio = importedCount / exportCount

    return {
      file: dep.file,
      depth: 1,
      imports: dep.imports,
      totalImports: importedCount,
      isDirect: true,
      riskLevel: ratio > 0.5 ? 'high' : ratio > 0.2 ? 'medium' : 'low',
      reason: `Imports ${importedCount} export(s) from ${target}`,
    }
  })
}

// ─── Indirect Dependents ──────────────────────────────────────────────────────

/**
 * Compute indirect dependents up to a given depth.
 *
 * @example
 * computeIndirectDependents(directDeps, reverseMap, 3) // [{ file: 'src/deep.ts', depth: 2, ... }]
 */
export function computeIndirectDependents(
  directDependents: ImpactNode[],
  reverseMap: Map<string, { file: string; imports: string[] }[]>,
  maxDepth: number,
): ImpactNode[] {
  const visited = new Set<string>(directDependents.map((d) => d.file))
  const result: ImpactNode[] = []
  const queue: { file: string; depth: number }[] = directDependents.map((d) => ({ file: d.file, depth: 1 }))

  let _qi = 0
  while (_qi < queue.length) {
    const current = queue[_qi]!
    _qi++
    const nextDepth = current.depth + 1
    if (nextDepth > maxDepth) continue

    const deps = reverseMap.get(current.file) ?? []
    for (const dep of deps) {
      if (visited.has(dep.file)) continue
      visited.add(dep.file)

      const node: ImpactNode = {
        file: dep.file,
        depth: nextDepth,
        imports: dep.imports,
        totalImports: dep.imports.length,
        isDirect: false,
        riskLevel: nextDepth >= 3 ? 'low' : 'medium',
        reason: `Indirect dependency via ${current.file} (depth ${nextDepth})`,
      }
      result.push(node)
      queue.push({ file: dep.file, depth: nextDepth })
    }
  }

  return result
}

// ─── Impact Chains ────────────────────────────────────────────────────────────

/**
 * Trace all impact chains from the target outward.
 *
 * @example
 * computeImpactChains('src/core.ts', reverseMap, 3) // [{ path: ['core.ts', 'a.ts', 'b.ts'], depth: 2 }]
 */
export function computeImpactChains(
  target: string,
  reverseMap: Map<string, { file: string; imports: string[] }[]>,
  maxDepth: number,
): ImpactChain[] {
  const chains: ImpactChain[] = []

  function dfs(currentPath: string[], depth: number) {
    if (depth > maxDepth) return
    const current = currentPath[currentPath.length - 1]!
    const deps = reverseMap.get(current) ?? []

    if (deps.length === 0 && currentPath.length > 1) {
      chains.push({ path: [...currentPath], depth: currentPath.length - 1, files: [...currentPath] })
      return
    }

    for (const dep of deps) {
      if (currentPath.includes(dep.file)) continue
      currentPath.push(dep.file)
      dfs(currentPath, depth + 1)
      currentPath.pop()
    }

    if (deps.length > 0 && depth === maxDepth) {
      chains.push({ path: [...currentPath], depth: currentPath.length - 1, files: [...currentPath] })
    }
  }

  dfs([target], 0)
  return chains
}

// ─── Risk & Effort ────────────────────────────────────────────────────────────

/**
 * Compute risk level for an impact node.
 *
 * @example
 * computeRiskLevel(5, 10) // 'medium'
 */
export function computeRiskLevel(importCount: number, exportCount: number): 'low' | 'medium' | 'high' {
  if (exportCount === 0) return 'low'
  const ratio = importCount / exportCount
  if (ratio > 0.5) return 'high'
  if (ratio > 0.2) return 'medium'
  return 'low'
}

/**
 * Estimate effort based on blast radius and chain length.
 *
 * @example
 * estimateEffort(5, 3) // 'medium'
 * estimateEffort(20, 5) // 'critical'
 */
export function estimateEffort(blastRadius: number, maxChainLength: number): 'low' | 'medium' | 'high' | 'critical' {
  if (blastRadius > 15 || maxChainLength > 4) return 'critical'
  if (blastRadius > 10 || maxChainLength > 3) return 'high'
  if (blastRadius > 3 || maxChainLength > 2) return 'medium'
  return 'low'
}

// ─── Unused Exports ───────────────────────────────────────────────────────────

/**
 * Find exports of the target that no one imports.
 *
 * @example
 * findUnusedExports(['foo', 'bar', 'baz'], [{ imports: ['foo'] }]) // ['bar', 'baz']
 */
export function findUnusedExports(
  targetExports: string[],
  directDependents: ImpactNode[],
): string[] {
  const usedExports = new Set<string>()
  for (const dep of directDependents) {
    for (const imp of dep.imports) {
      usedExports.add(imp)
    }
  }

  return targetExports.filter((exp) => !usedExports.has(exp))
}

// ─── Statistics ────────────────────────────────────────────────────────────────

/**
 * Compute average risk score (0-100) from nodes.
 *
 * @example
 * computeAverageRiskScore([{ riskLevel: 'high' }, { riskLevel: 'low' }]) // 58.3
 */
export function computeAverageRiskScore(nodes: ImpactNode[]): number {
  if (nodes.length === 0) return 0
  const scoreMap = { low: 25, medium: 58, high: 90 }
  const total = nodes.reduce((s, n) => s + scoreMap[n.riskLevel], 0)
  return Math.round((total / nodes.length) * 10) / 10
}

/**
 * Find the file with the highest risk.
 *
 * @example
 * findHighestRiskFile([{ file: 'a.ts', riskLevel: 'high' }]) // 'a.ts'
 */
export function findHighestRiskFile(nodes: ImpactNode[]): string {
  if (nodes.length === 0) return ''
  const sorted = [...nodes].sort((a, b) => {
    const score = { low: 0, medium: 1, high: 2 }
    return score[b.riskLevel] - score[a.riskLevel]
  })
  return sorted[0]!.file
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate impact-related recommendations.
 *
 * @example
 * generateImpactRecommendations(result) // ['Consider interface-based decoupling...']
 */
export function generateImpactRecommendations(result: ImpactResult): string[] {
  const recs: string[] = []

  if (result.stats.blastRadius > 10) {
    recs.push(`Blast radius is ${result.stats.blastRadius} files. Consider interface-based decoupling to reduce ripple effects.`)
  }

  if (result.unusedExports.length > 0) {
    recs.push(`${result.unusedExports.length} unused export(s): ${result.unusedExports.slice(0, 5).join(', ')}. Consider removing dead exports.`)
  }

  if (result.stats.maxChainLength > 3) {
    recs.push(`Max dependency chain is ${result.stats.maxChainLength}. Reduce coupling in deep dependency paths.`)
  }

  const highRisk = [...result.directDependents, ...result.indirectDependents].filter((n) => n.riskLevel === 'high')
  if (highRisk.length > 0) {
    recs.push(`${highRisk.length} high-risk file(s) need careful testing after changes: ${highRisk.slice(0, 3).map((n) => n.file).join(', ')}.`)
  }

  if (result.stats.estimatedEffort === 'critical') {
    recs.push('Effort is critical. Consider breaking changes into smaller, incremental refactors.')
  }

  if (recs.length === 0) {
    recs.push('Impact is contained. Low risk for changes to this file.')
  }

  return recs
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Build complete impact analysis result.
 *
 * @example
 * const result = buildImpactResult('src/core.ts', files, contents, { depth: 3 })
 */
export function buildImpactResult(
  target: string,
  files: string[],
  contents: string[],
  options: ImpactOptions = {},
): ImpactResult {
  const depth = options.depth ?? 3

  const reverseMap = buildReverseDependencyMap(files, contents)

  const targetIndex = files.indexOf(target)
  const targetContent = targetIndex >= 0 ? contents[targetIndex]! : ''
  const targetExports = extractExports(targetContent)

  const directDependents = computeDirectDependents(target, reverseMap, targetExports)
  const indirectDependents = computeIndirectDependents(directDependents, reverseMap, depth)
  const chains = computeImpactChains(target, reverseMap, depth)
  const unusedExports = findUnusedExports(targetExports, directDependents)

  const allNodes = [...directDependents, ...indirectDependents]
  const blastRadius = allNodes.length
  const maxChainLength = chains.length > 0 ? Math.max(...chains.map((c) => c.depth)) : 0

  const stats: ImpactStats = {
    blastRadius,
    directCount: directDependents.length,
    indirectCount: indirectDependents.length,
    maxChainLength,
    averageRiskScore: computeAverageRiskScore(allNodes),
    highestRiskFile: findHighestRiskFile(allNodes),
    estimatedEffort: estimateEffort(blastRadius, maxChainLength),
  }

  const result: ImpactResult = {
    target,
    directDependents,
    indirectDependents,
    chains,
    stats,
    exports: targetExports,
    unusedExports,
    recommendations: [],
  }

  result.recommendations = generateImpactRecommendations(result)

  return result
}
