import {basename,dirname,join,normalize} from 'node:path'

// ─── Types ──────────────────────────────────────────────

export type ContentReader = (filePath: string) => Promise<string>

export interface DependencyNode {
  filePath: string
  depth: number
  directDeps: string[]
  directDependents: string[]
  transitiveDependents: number
}

export interface ImpactAnalysis {
  targetFile: string
  directImpact: string[]
  indirectImpact: string[]
  totalAffected: number
  maxDepth: number
  criticalPaths: string[][]
  riskLevel: 'high' | 'low' | 'medium'
}

export interface ReverseDepsResult {
  analysis: ImpactAnalysis
  nodes: DependencyNode[]
  stats: ReverseDepsStats
}

export interface ReverseDepsStats {
  totalFiles: number
  directDependents: number
  indirectDependents: number
  maxChainLength: number
  avgChainLength: number
}

export interface ReverseDepsOptions {
  depth?: number
  verbose?: boolean
}

export interface ImportInfo {
  source: string
  resolvedPath: string
}

export interface ExportInfo {
  exported: boolean
  name: string
}

// ─── extractImports ─────────────────────────────────────

/**
 * @example
 * const imports = extractImports(content, '/src/foo.ts')
 * console.log(imports[0].source)
 */
export function extractImports(content: string, filePath: string): ImportInfo[] {
  const imports: ImportInfo[] = []
  const fileDir = dirname(filePath)

  const importRegex = /import\s+(?:type\s+)?(?:[\w{},\s*]*\s+from\s+)?['"]([^'"]+)['"]/g
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g

  const sources = new Set<string>()

  let match: RegExpExecArray | null
  while ((match = importRegex.exec(content)) !== null) {
    sources.add(match[1] ?? '')
  }
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    sources.add(match[1] ?? '')
  }
  while ((match = requireRegex.exec(content)) !== null) {
    sources.add(match[1] ?? '')
  }

  for (const source of sources) {
    const resolved = resolveImportPath(source, fileDir)
    imports.push({ resolvedPath: resolved, source })
  }

  return imports
}

function resolveImportPath(source: string, fromDir: string): string {
  if (source.startsWith('.') || source.startsWith('/')) {
    let p = source.startsWith('/') ? source : normalize(join(fromDir, source))

    const jsToTs = p.replace(/\.js$/, '.ts').replace(/\.jsx$/, '.tsx').replace(/\.mjs$/, '.mts').replace(/\.cjs$/, '.cts')
    if (jsToTs !== p) return normalize(jsToTs)

    if (!hasExtension(p)) {
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']
      for (const ext of extensions) {
        const withExt = p + ext
        if (isLikelyFile(withExt)) {
          return normalize(withExt)
        }
      }
      for (const ext of extensions) {
        const indexFile = join(p, 'index' + ext)
        if (isLikelyFile(indexFile)) {
          return normalize(indexFile)
        }
      }
    }
    return normalize(p)
  }
  return source
}

function hasExtension(p: string): boolean {
  const exts = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.node']
  return exts.some((e) => p.endsWith(e))
}

function isLikelyFile(_p: string): boolean {
  return true
}

// ─── extractExports ─────────────────────────────────────

/**
 * @example
 * const exports = extractExports(content, '/src/foo.ts')
 * console.log(exports[0].name)
 */
export function extractExports(_content: string, _filePath: string): ExportInfo[] {
  const exports: ExportInfo[] = []
  return exports
}

// ─── buildReverseDependencyMap ──────────────────────────

/**
 * @example
 * const map = buildReverseDependencyMap(files, contents)
 * console.log(map.get('src/foo.ts'))
 */
export function buildReverseDependencyMap(
  files: string[],
  contents: Map<string, string>,
): Map<string, string[]> {
  const reverseMap = new Map<string, string[]>()

  const normalizedFiles = new Set(files.map((f) => normalize(f)))

  for (const file of files) {
    const content = contents.get(file) ?? ''
    const imports = extractImports(content, file)

    for (const imp of imports) {
      let resolvedTarget = imp.resolvedPath
      if (!normalizedFiles.has(resolvedTarget)) {
        const candidates = files.filter(
          (f) => f.endsWith(resolvedTarget) || normalize(f) === resolvedTarget,
        )
        if (candidates.length > 0) {
          resolvedTarget = candidates[0] ?? ''
        } else {
          continue
        }
      }

      if (!reverseMap.has(resolvedTarget)) {
        reverseMap.set(resolvedTarget, [])
      }
      const dependents = reverseMap.get(resolvedTarget)!
      if (!dependents.includes(file)) {
        dependents.push(file)
      }
    }
  }

  return reverseMap
}

// ─── findDirectDependents ───────────────────────────────

/**
 * @example
 * const deps = findDirectDependents('src/foo.ts', reverseMap)
 * console.log(deps)
 */
export function findDirectDependents(
  targetFile: string,
  reverseMap: Map<string, string[]>,
): string[] {
  return reverseMap.get(normalize(targetFile)) ?? []
}

// ─── findTransitiveDependents ───────────────────────────

/**
 * @example
 * const deps = findTransitiveDependents('src/foo.ts', reverseMap, 5)
 * console.log(deps.length)
 */
export function findTransitiveDependents(
  targetFile: string,
  reverseMap: Map<string, string[]>,
  maxDepth: number,
): string[] {
  const visited = new Set<string>()
  const queue: Array<{ depth: number; file: string }> = [
    { depth: 0, file: normalize(targetFile) },
  ]

  const result: string[] = []

  let _qi = 0
  while (_qi < queue.length) {
    const { file, depth } = queue[_qi]!
    _qi++
    if (visited.has(file)) continue
    if (depth > maxDepth) continue
    visited.add(file)

    const dependents = reverseMap.get(file) ?? []
    for (const dep of dependents) {
      const normDep = normalize(dep)
      if (!visited.has(normDep)) {
        result.push(normDep)
        queue.push({ depth: depth + 1, file: normDep })
      }
    }
  }

  return result
}

// ─── findCriticalPaths ──────────────────────────────────

/**
 * @example
 * const paths = findCriticalPaths('src/foo.ts', reverseMap, 5)
 * console.log(paths[0])
 */
export function findCriticalPaths(
  targetFile: string,
  reverseMap: Map<string, string[]>,
  maxDepth: number,
): string[][] {
  const norm = normalize(targetFile)
  const allPaths: string[][] = []

  function dfs(current: string, path: string[], depth: number): void {
    if (depth > maxDepth) return

    const dependents = reverseMap.get(current) ?? []
    if (dependents.length === 0) {
      allPaths.push([...path])
      return
    }

    for (const dep of dependents) {
      const normDep = normalize(dep)
      if (path.includes(normDep)) continue
      path.push(normDep)
      dfs(normDep, path, depth + 1)
      path.pop()
    }
  }

  dfs(norm, [norm], 0)

  if (allPaths.length === 0) {
    allPaths.push([norm])
  }

  allPaths.sort((a, b) => b.length - a.length)

  return allPaths.slice(0, 10)
}

// ─── computeRiskLevel ───────────────────────────────────

/**
 * @example
 * const level = computeRiskLevel(20)
 * console.log(level) // 'high'
 */
export function computeRiskLevel(totalAffected: number): 'high' | 'low' | 'medium' {
  if (totalAffected > 15) return 'high'
  if (totalAffected >= 5) return 'medium'
  return 'low'
}

// ─── buildNodes ─────────────────────────────────────────

function buildNodes(
  targetFile: string,
  reverseMap: Map<string, string[]>,
  allAffected: string[],
  forwardMap: Map<string, string[]>,
  maxDepth: number,
): DependencyNode[] {
  const norm = normalize(targetFile)
  const nodes: DependencyNode[] = []

  const targetDependents = reverseMap.get(norm) ?? []
  nodes.push({
    depth: 0,
    directDeps: forwardMap.get(norm) ?? [],
    directDependents: targetDependents,
    filePath: norm,
    transitiveDependents: allAffected.length,
  })

  const visited = new Set<string>([norm])
  const queue: Array<{ depth: number; file: string }> = targetDependents.map((d) => ({
    depth: 1, file: normalize(d),
  }))

  let _qi = 0
  while (_qi < queue.length) {
    const { file, depth } = queue[_qi]!
    _qi++
    if (visited.has(file) || depth > maxDepth) continue
    visited.add(file)

    const dependents = reverseMap.get(file) ?? []
    nodes.push({
      depth,
      directDeps: forwardMap.get(file) ?? [],
      directDependents: dependents,
      filePath: file,
      transitiveDependents: dependents.length,
    })

    for (const dep of dependents) {
      const normDep = normalize(dep)
      if (!visited.has(normDep)) {
        queue.push({ depth: depth + 1, file: normDep })
      }
    }
  }

  return nodes
}

// ─── buildReverseDepsResult ─────────────────────────────

/**
 * @example
 * const result = await buildReverseDepsResult('src/foo.ts', files, reader, { depth: 5 })
 * console.log(result.analysis.riskLevel)
 */
export async function buildReverseDepsResult(
  targetFile: string,
  files: string[],
  contentReader: ContentReader,
  options?: ReverseDepsOptions,
): Promise<ReverseDepsResult> {
  const maxDepth = options?.depth ?? 5
  const norm = normalize(targetFile)

  const contents = new Map<string, string>()
  const forwardMap = new Map<string, string[]>()

  for (const file of files) {
    try {
      const content = await contentReader(file)
      contents.set(file, content)
      const imports = extractImports(content, file)
      const depPaths: string[] = []
      for (const imp of imports) {
        const candidates = files.filter(
          (f) => normalize(f) === imp.resolvedPath || f.endsWith(imp.resolvedPath),
        )
        if (candidates.length > 0) depPaths.push(candidates[0] ?? '')
      }
      forwardMap.set(file, depPaths)
    } catch {
      continue
    }
  }

  const reverseMap = buildReverseDependencyMap(files, contents)

  const direct = findDirectDependents(norm, reverseMap)
  const transitive = findTransitiveDependents(norm, reverseMap, maxDepth)
  const indirect = transitive.filter((f) => !direct.includes(f))

  const criticalPaths = findCriticalPaths(norm, reverseMap, maxDepth)
  const totalAffected = direct.length + indirect.length
  const riskLevel = computeRiskLevel(totalAffected)

  const analysis: ImpactAnalysis = {
    criticalPaths,
    directImpact: direct,
    indirectImpact: indirect,
    maxDepth: criticalPaths.length > 0 ? ((criticalPaths[0] ?? [])?.length ?? 0) - 1 : 0,
    riskLevel,
    targetFile: norm,
    totalAffected,
  }

  const nodes = buildNodes(norm, reverseMap, transitive, forwardMap, maxDepth)

  const chainLengths = criticalPaths.map((p) => p.length - 1).filter((l) => l > 0)
  const stats: ReverseDepsStats = {
    avgChainLength: chainLengths.length > 0
      ? Math.round(chainLengths.reduce((a, b) => a + b, 0) / chainLengths.length)
      : 0,
    directDependents: direct.length,
    indirectDependents: indirect.length,
    maxChainLength: chainLengths.length > 0 ? Math.max(...chainLengths) : 0,
    totalFiles: files.length,
  }

  return { analysis, nodes, stats }
}

// ─── sourceBaseName ─────────────────────────────────────

/**
 * @example
 * const base = sourceBaseName('src/reverse-deps-helpers.ts')
 * console.log(base)
 */
export function sourceBaseName(filePath: string): string {
  const base = basename(filePath)
  return base.replace(/\.ts$/, '')
}
