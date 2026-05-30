// ─── Interfaces ──────────────────────────────────────────

export interface DependencyNode {
  filePath: string
  relativePath: string
  imports: string[]
  importedBy: string[]
  depth: number
}

export interface DependencyEdge {
  from: string
  to: string
  type: 'import' | 're-export' | 'dynamic-import'
}

export interface GraphResult {
  nodes: Map<string, DependencyNode>
  edges: DependencyEdge[]
  root: string
  maxDepth: number
  totalNodes: number
  totalEdges: number
}

// ─── Import extraction ──────────────────────────────────

/**
 * Extract import/require dependencies from file content.
 *
 * @example
 * ```ts
 * const result = extractDependencies(
 *   `import { foo } from './bar'\nconst baz = require('./qux')`,
 *   '/project/src/index.ts'
 * )
 * // result.imports contains resolved paths
 * // result.edges contains typed DependencyEdge entries
 * ```
 *
 * @param content - File source content
 * @param filePath - Absolute path of the file being analyzed
 * @returns Object with resolved imports and typed edges
 */
export function extractDependencies(
  content: string,
  filePath: string,
): { imports: string[]; edges: DependencyEdge[] } {
  const imports: string[] = []
  const edges: DependencyEdge[] = []
  const seen = new Set<string>()

  const lastSlash = filePath.lastIndexOf('/')
  const dir = lastSlash > 0 ? filePath.substring(0, lastSlash) : lastSlash === 0 ? '/' : '.'

  // ── ESM: import ... from '...' ──
  const esmFromRegex = /import\s+(?:type\s+)?(?:[\w{},\s*]+\s+from\s+)?['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = esmFromRegex.exec(content)) !== null) {
    const specifier = match[1] ?? ''
    if (specifier.startsWith('.')) {
      const resolved = resolveImportPath(dir, specifier)
      if (resolved && !seen.has(resolved)) {
        seen.add(resolved)
        imports.push(resolved)
        edges.push({ from: filePath, to: resolved, type: 'import' })
      }
    }
  }

  // ── ESM: import '...' (side-effect) ──
  const esmSideEffectRegex = /import\s+['"]([^'"]+)['"]/g
  while ((match = esmSideEffectRegex.exec(content)) !== null) {
    const specifier = match[1] ?? ''
    if (specifier.startsWith('.')) {
      const resolved = resolveImportPath(dir, specifier)
      if (resolved && !seen.has(resolved)) {
        seen.add(resolved)
        imports.push(resolved)
        edges.push({ from: filePath, to: resolved, type: 'import' })
      }
    }
  }

  // ── CJS: require('...') ──
  const cjsRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((match = cjsRegex.exec(content)) !== null) {
    const specifier = match[1] ?? ''
    if (specifier.startsWith('.')) {
      const resolved = resolveImportPath(dir, specifier)
      if (resolved && !seen.has(resolved)) {
        seen.add(resolved)
        imports.push(resolved)
        edges.push({ from: filePath, to: resolved, type: 'import' })
      }
    }
  }

  // ── Dynamic import: import('...') ──
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    const specifier = match[1] ?? ''
    if (specifier.startsWith('.')) {
      const resolved = resolveImportPath(dir, specifier)
      if (resolved && !seen.has(resolved)) {
        seen.add(resolved)
        imports.push(resolved)
        edges.push({ from: filePath, to: resolved, type: 'dynamic-import' })
      }
    }
  }

  // ── Re-export: export ... from '...' ──
  const reExportRegex = /export\s+(?:type\s+)?(?:[\w{},\s*]+\s+)?from\s+['"]([^'"]+)['"]/g
  while ((match = reExportRegex.exec(content)) !== null) {
    const specifier = match[1] ?? ''
    if (specifier.startsWith('.')) {
      const resolved = resolveImportPath(dir, specifier)
      if (resolved && !seen.has(resolved)) {
        seen.add(resolved)
        imports.push(resolved)
        edges.push({ from: filePath, to: resolved, type: 're-export' })
      }
    }
  }

  return { imports, edges }
}

/**
 * Resolve a relative import specifier to an absolute path.
 *
 * @example
 * ```ts
 * resolveImportPath('/project/src/commands', './helpers')
 * // returns '/project/src/commands/helpers.ts' (or .js, .tsx, .jsx)
 * ```
 */
export function resolveImportPath(dir: string, specifier: string): string | null {
  const cleanSpec = specifier.replace(/^\.\//, '')
  const joined = dir === '/' ? '/' + cleanSpec : dir + '/' + cleanSpec
  const normalized = joined.replace(/\/+$/, '')
  return normalized || null
}

// ─── Dependency graph builder ────────────────────────────

/**
 * Build a dependency graph using BFS from a root file.
 *
 * @example
 * ```ts
 * const result = buildDependencyGraph(
 *   '/project/src/index.ts',
 *   allFiles,
 *   (path) => fs.readFile(path, 'utf8'),
 *   3,
 *   'imports'
 * )
 * ```
 *
 * @param rootPath - Absolute path of the root file
 * @param files - Map of absolute path to relative path
 * @param contentReader - Function to read file content
 * @param maxDepth - Maximum traversal depth
 * @param direction - 'imports' to follow imports, 'imported-by' to follow reverse
 */
export async function buildDependencyGraph(
  rootPath: string,
  files: Map<string, string>,
  contentReader: (path: string) => Promise<string>,
  maxDepth: number,
  direction: 'imports' | 'imported-by',
): Promise<GraphResult> {
  const nodes = new Map<string, DependencyNode>()
  const edges: DependencyEdge[] = []

  // First pass: build importedBy from all files
  const allImports = new Map<string, string[]>()
  for (const [absPath] of files) {
    try {
      const content = await contentReader(absPath)
      const deps = extractDependencies(content, absPath)
      allImports.set(absPath, deps.imports)
      for (const edge of deps.edges) {
        edges.push(edge)
      }
    } catch {
      allImports.set(absPath, [])
    }
  }

  // Build importedBy mapping
  const importedBy = new Map<string, string[]>()
  for (const [file, imports] of allImports) {
    for (const imp of imports) {
      const existing = importedBy.get(imp)
      if (existing) {
        existing.push(file)
      } else {
        importedBy.set(imp, [file])
      }
    }
  }

  function resolveToKnownFile(importPath: string): string | undefined {
    if (files.has(importPath)) return importPath
    const extensions = ['.ts', '.tsx', '.js', '.jsx']
    for (const ext of extensions) {
      const withExt = importPath + ext
      if (files.has(withExt)) return withExt
    }
    for (const ext of extensions) {
      const indexPath = importPath + '/index' + ext
      if (files.has(indexPath)) return indexPath
    }
    return undefined
  }

  const resolvedImports = new Map<string, string[]>()
  for (const [file, imports] of allImports) {
    const resolved: string[] = []
    for (const imp of imports) {
      const resolvedPath = resolveToKnownFile(imp)
      if (resolvedPath) resolved.push(resolvedPath)
    }
    resolvedImports.set(file, resolved)
  }

  const resolvedImportedBy = new Map<string, string[]>()
  for (const [file, imports] of resolvedImports) {
    for (const imp of imports) {
      const existing = resolvedImportedBy.get(imp)
      if (existing) {
        existing.push(file)
      } else {
        resolvedImportedBy.set(imp, [file])
      }
    }
  }

  const visited = new Set<string>()
  const queue: Array<{ path: string; depth: number }> = [{ depth: 0, path: rootPath }]
  visited.add(rootPath)

  let _qi = 0
  while (_qi < queue.length) {
    const item = queue[_qi]!
    _qi++
    const { depth, path: currentPath } = item

    const relativePath = files.get(currentPath) ?? currentPath
    const currentImports = resolvedImports.get(currentPath) ?? []
    const currentImportedBy = resolvedImportedBy.get(currentPath) ?? []

    nodes.set(currentPath, {
      depth,
      filePath: currentPath,
      importedBy: currentImportedBy,
      imports: currentImports,
      relativePath,
    })

    if (depth < maxDepth) {
      const nextFiles = direction === 'imports' ? currentImports : currentImportedBy
      for (const next of nextFiles) {
        if (files.has(next) && !visited.has(next)) {
          visited.add(next)
          queue.push({ depth: depth + 1, path: next })
        }
      }
    }
  }

  const filteredEdges: DependencyEdge[] = []
  for (const edge of edges) {
    const resolvedFrom = files.has(edge.from) ? edge.from : resolveToKnownFile(edge.from)
    const resolvedTo = files.has(edge.to) ? edge.to : resolveToKnownFile(edge.to)
    if (resolvedFrom && resolvedTo && nodes.has(resolvedFrom) && nodes.has(resolvedTo)) {
      filteredEdges.push({
        from: resolvedFrom,
        to: resolvedTo,
        type: edge.type,
      })
    }
  }

  return {
    edges: filteredEdges,
    maxDepth,
    nodes,
    root: rootPath,
    totalEdges: filteredEdges.length,
    totalNodes: nodes.size,
  }
}

// ─── Depth computation ──────────────────────────────────

/**
 * Compute depth for each node using BFS from root.
 *
 * @example
 * ```ts
 * const updated = computeNodeDepths(nodes, '/project/src/index.ts')
 * ```
 */
export function computeNodeDepths(
  nodes: Map<string, DependencyNode>,
  root: string,
): Map<string, DependencyNode> {
  const updated = new Map<string, DependencyNode>()
  for (const [key, node] of nodes) {
    updated.set(key, { ...node })
  }

  const visited = new Set<string>()
  const queue: Array<{ depth: number; path: string }> = [{ depth: 0, path: root }]
  visited.add(root)

  const rootNode = updated.get(root)
  if (rootNode) {
    rootNode.depth = 0
  }

  let _qi = 0
  while (_qi < queue.length) {
    const item = queue[_qi]!
    _qi++
    const { depth, path: currentPath } = item
    const node = updated.get(currentPath)
    if (!node) continue

    const neighbors = [...node.imports, ...node.importedBy]
    for (const neighbor of neighbors) {
      if (updated.has(neighbor) && !visited.has(neighbor)) {
        visited.add(neighbor)
        const neighborNode = updated.get(neighbor)!
        neighborNode.depth = depth + 1
        queue.push({ depth: depth + 1, path: neighbor })
      }
    }
  }

  return updated
}

// ─── Cycle detection ────────────────────────────────────

/**
 * Detect circular dependencies using DFS.
 *
 * @example
 * ```ts
 * const cycles = findCycles(nodes)
 * if (cycles.length > 0) {
 *   console.log('Circular dependencies found:', cycles)
 * }
 * ```
 *
 * @param nodes - Map of dependency nodes
 * @returns Array of cycles, each cycle is an array of file paths
 */
export function findCycles(nodes: Map<string, DependencyNode>): string[][] {
  const cycles: string[][] = []
  const visited = new Set<string>()
  const recStack = new Set<string>()

  function dfs(path: string, currentPath: string[]): void {
    visited.add(path)
    recStack.add(path)

    const node = nodes.get(path)
    if (node) {
      for (const neighbor of node.imports) {
        if (!nodes.has(neighbor)) continue

        if (!visited.has(neighbor)) {
          dfs(neighbor, [...currentPath, neighbor])
        } else         if (recStack.has(neighbor)) {
          const cycleStart = currentPath.indexOf(neighbor)
          if (cycleStart !== -1) {
            const cycle = currentPath.slice(cycleStart)
            cycles.push(cycle)
          }
        }
      }
    }

    recStack.delete(path)
  }

  for (const [path] of nodes) {
    if (!visited.has(path)) {
      dfs(path, [path])
    }
  }

  return cycles
}
