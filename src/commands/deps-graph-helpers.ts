// ─── Interfaces ──────────────────────────────────────────

export interface ImportInfo {
  source: string
  line: number
  isTypeOnly: boolean
  isExternal: boolean
}

export interface FileNode {
  filePath: string
  imports: ImportInfo[]
  importedBy: string[]
  depth: number
}

export interface GraphStats {
  totalFiles: number
  totalImports: number
  totalEdges: number
  avgImportsPerFile: number
  maxDepth: number
  externalImports: number
}

export interface DepGraph {
  nodes: Map<string, FileNode>
  edges: Array<{ from: string; to: string }>
  stats: GraphStats
}

export interface HubFile {
  filePath: string
  importCount: number
  importedByCount: number
  score: number
}

export interface BuildGraphOptions {
  includeExternal: boolean
  maxDepth: number
}

// ─── Import extraction ──────────────────────────────────

const IMPORT_FROM_RE = /^\s*import\s+(?:type\s+)?(?:.*?)\s+from\s+['"]([^'"]+)['"]\s*;?/m
const IMPORT_SIDE_EFFECT_RE = /^\s*import\s+['"]([^'"]+)['"]\s*;?/m
const REQUIRE_RE = /(?:const|let|var)\s+\w+\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
const TYPE_ONLY_IMPORT_RE = /^\s*import\s+type\s+/m

export function extractImports(content: string, filePath: string): ImportInfo[] {
  const imports: ImportInfo[] = []
  const lines = content.split('\n')
  const seen = new Set<string>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // ─── import ... from '...' ────────────────────────────
    const fromMatch = line.match(/import\s+(type\s+)?(?:[\w{},\s*]+\s+from\s+)?['"]([^'"]+)['"]/)

    if (fromMatch) {
      const isTypeOnly = fromMatch[1] !== undefined
      const source = fromMatch[2]

      if (source && !seen.has(`${i}:${source}`)) {
        seen.add(`${i}:${source}`)
        imports.push({
          isExternal: isExternalImport(source),
          isTypeOnly,
          line: i + 1,
          source,
        })
      }
      continue
    }

    // ─── import '...' (side-effect) ──────────────────────
    const sideEffectMatch = line.match(/^\s*import\s+['"]([^'"]+)['"]\s*;?\s*$/)
    if (sideEffectMatch) {
      const source = sideEffectMatch[1]
      if (!seen.has(`${i}:${source}`)) {
        seen.add(`${i}:${source}`)
        imports.push({
          isExternal: isExternalImport(source),
          isTypeOnly: false,
          line: i + 1,
          source,
        })
      }
      continue
    }

    // ─── require('...') ──────────────────────────────────
    const requireMatches = line.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g)
    for (const match of requireMatches) {
      const source = match[1]
      if (source && !seen.has(`${i}:${source}`)) {
        seen.add(`${i}:${source}`)
        imports.push({
          isExternal: isExternalImport(source),
          isTypeOnly: false,
          line: i + 1,
          source,
        })
      }
    }
  }

  void filePath
  void IMPORT_FROM_RE
  void IMPORT_SIDE_EFFECT_RE
  void REQUIRE_RE
  void TYPE_ONLY_IMPORT_RE

  return imports
}

// ─── External import detection ──────────────────────────

export function isExternalImport(source: string): boolean {
  if (source.startsWith('.') || source.startsWith('/')) {
    return false
  }
  return true
}

// ─── Import path resolution ─────────────────────────────

export function resolveImportPath(source: string, fromFile: string): string {
  if (isExternalImport(source)) {
    return source
  }

  // Normalize relative path
  const dir = fromFile.substring(0, fromFile.lastIndexOf('/'))
  const parts = dir.split('/')
  const sourceParts = source.split('/')

  for (const part of sourceParts) {
    if (part === '..') {
      parts.pop()
    } else if (part !== '.') {
      parts.push(part)
    }
  }

  let resolved = parts.join('/')

  // Add extensions if missing
  if (!resolved.endsWith('.ts') && !resolved.endsWith('.tsx') && !resolved.endsWith('.js') && !resolved.endsWith('.jsx')) {
    resolved = resolved + '.ts'
  }

  return resolved
}

// ─── Graph building ─────────────────────────────────────

export async function buildGraph(
  files: Array<{ absolutePath: string; path: string }>,
  readFile: (path: string) => Promise<string>,
  options: BuildGraphOptions,
): Promise<DepGraph> {
  const nodes = new Map<string, FileNode>()
  const edges: Array<{ from: string; to: string }> = []

  // Initialize all file nodes
  for (const file of files) {
    nodes.set(file.path, {
      depth: 0,
      filePath: file.path,
      importedBy: [],
      imports: [],
    })
  }

  // Read files and extract imports
  for (const file of files) {
    try {
      const content = await readFile(file.absolutePath)
      const imports = extractImports(content, file.path)

      const node = nodes.get(file.path)
      if (node) {
        node.imports = options.includeExternal
          ? imports
          : imports.filter((imp) => !imp.isExternal)
      }

      // Build edges for internal imports
      for (const imp of imports) {
        if (isExternalImport(imp.source)) {
          if (options.includeExternal) {
            edges.push({ from: file.path, to: imp.source })
          }
          continue
        }

        const resolvedTarget = resolveImportPath(imp.source, file.path)

        // Check if resolved target exists in our file set
        const targetExists = Array.from(nodes.keys()).some(
          (key) => key === resolvedTarget || key === resolvedTarget.replace(/\.ts$/, '.tsx') || key === resolvedTarget.replace(/\.ts$/, '.js') || key === resolvedTarget.replace(/\.ts$/, '.jsx'),
        )

        if (targetExists) {
          edges.push({ from: file.path, to: resolvedTarget })

          // Add importedBy reference
          const targetNode = nodes.get(resolvedTarget)
          if (targetNode && !targetNode.importedBy.includes(file.path)) {
            targetNode.importedBy.push(file.path)
          }
        }
      }
    } catch {
      // Skip files that can't be read
    }
  }

  // Calculate depth for each node (longest chain from leaf)
  const depthCache = new Map<string, number>()

  function calculateDepth(filePath: string, visited: Set<string>): number {
    if (depthCache.has(filePath)) {
      return depthCache.get(filePath)!
    }

    const node = nodes.get(filePath)
    if (!node || node.imports.length === 0) {
      depthCache.set(filePath, 0)
      return 0
    }

    if (visited.has(filePath)) {
      return 0 // Circular dependency
    }

    visited.add(filePath)

    let maxChildDepth = 0
    for (const imp of node.imports) {
      if (!isExternalImport(imp.source)) {
        const resolvedTarget = resolveImportPath(imp.source, filePath)
        if (nodes.has(resolvedTarget)) {
          const childDepth = calculateDepth(resolvedTarget, new Set(visited))
          maxChildDepth = Math.max(maxChildDepth, childDepth)
        }
      }
    }

    const depth = maxChildDepth + 1
    depthCache.set(filePath, depth)
    node.depth = depth
    return depth
  }

  for (const filePath of Array.from(nodes.keys())) {
    calculateDepth(filePath, new Set())
  }

  // Calculate statistics
  let totalImports = 0
  let externalImports = 0
  for (const node of Array.from(nodes.values())) {
    totalImports += node.imports.length
    externalImports += node.imports.filter((imp) => imp.isExternal).length
  }

  const stats: GraphStats = {
    avgImportsPerFile: nodes.size > 0 ? Math.round((totalImports / nodes.size) * 100) / 100 : 0,
    externalImports,
    maxDepth: Math.max(0, ...Array.from(nodes.values()).map((n) => n.depth)),
    totalEdges: edges.length,
    totalFiles: nodes.size,
    totalImports,
  }

  return { edges, nodes, stats }
}

// ─── Hub detection ──────────────────────────────────────

export function findHubs(graph: DepGraph, count: number): HubFile[] {
  const hubs: HubFile[] = []

  for (const node of Array.from(graph.nodes.values())) {
    const importedByCount = node.importedBy.length
    const importCount = node.imports.filter((imp) => !imp.isExternal).length
    const score = importedByCount * 2 + importCount

    hubs.push({
      filePath: node.filePath,
      importCount,
      importedByCount,
      score,
    })
  }

  hubs.sort((a, b) => b.score - a.score)
  return hubs.slice(0, count)
}

// ─── Chain detection ────────────────────────────────────

export function findChains(graph: DepGraph, maxDepth: number): string[][] {
  const chains: Array<{ chain: string[]; length: number }> = []

  function dfs(filePath: string, path: string[], visited: Set<string>): void {
    if (path.length > maxDepth) return

    const node = graph.nodes.get(filePath)
    if (!node) return

    const internalImports = node.imports.filter((imp) => !imp.isExternal)

    if (internalImports.length === 0) {
      if (path.length > 1) {
        chains.push({ chain: [...path], length: path.length })
      }
      return
    }

    for (const imp of internalImports) {
      const resolvedTarget = resolveImportPath(imp.source, filePath)
      if (visited.has(resolvedTarget)) continue
      if (!graph.nodes.has(resolvedTarget)) continue

      visited.add(resolvedTarget)
      path.push(resolvedTarget)
      dfs(resolvedTarget, path, visited)
      path.pop()
      visited.delete(resolvedTarget)
    }
  }

  for (const filePath of Array.from(graph.nodes.keys())) {
    dfs(filePath, [filePath], new Set([filePath]))
  }

  // Sort by length descending, take top 5
  chains.sort((a, b) => b.length - a.length)

  // Deduplicate chains by their stringified version
  const seen = new Set<string>()
  const unique: string[][] = []
  for (const { chain } of chains) {
    const key = chain.join('→')
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(chain)
    }
    if (unique.length >= 5) break
  }

  return unique
}
