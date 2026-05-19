// ─── Interfaces ──────────────────────────────────────────

export type ImportStyle = 'default' | 'named' | 'namespace' | 'side-effect'

export interface ImportInfo {
  module: string
  style: ImportStyle
  names: string[]
  isExternal: boolean
  isRelative: boolean
  isTypeOnly: boolean
  filePath: string
  line: number
}

export interface ModuleStats {
  module: string
  importCount: number
  styles: { style: ImportStyle; count: number }[]
  files: string[]
  isExternal: boolean
}

export interface CircularDep {
  path: string[]
  length: number
}

export interface ImportsResult {
  imports: ImportInfo[]
  moduleStats: ModuleStats[]
  totalImports: number
  externalImports: number
  internalImports: number
  typeOnlyImports: number
  byStyle: { style: string; count: number; percentage: number }[]
  topModules: ModuleStats[]
  circularDeps: CircularDep[]
  externalRatio: number
}

export interface BuildImportsResultOptions {
  top?: number
  circular?: boolean
  filePaths?: Set<string>
}

// ─── Import parsing ─────────────────────────────────────

/**
 * Extract all import statements from file content.
 *
 * @example
 * ```ts
 * const imports = parseImports(
 *   "import { foo } from './bar';\nimport baz from 'module';",
 *   'src/index.ts'
 * );
 * // imports.length === 2
 * ```
 */
export function parseImports(content: string, filePath: string): ImportInfo[] {
  const imports: ImportInfo[] = []
  const lines = content.split('\n')

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx]!
    const trimmed = line.trim()

    // Skip non-import lines quickly
    if (!trimmed.startsWith('import ')) continue

    // Skip string literals containing 'import'
    if (trimmed.startsWith("'import ") || trimmed.startsWith('"import ')) continue

    // Check for type-only import
    const isTypeOnly = /^import\s+type\s+/.test(trimmed)

    // ─── Side-effect: import 'module' or import "module" ───
    const sideEffectMatch = trimmed.match(/^import\s+['"]([^'"]+)['"]\s*;?\s*$/)
    if (sideEffectMatch) {
      const mod = sideEffectMatch[1]!
      imports.push({
        filePath,
        isExternal: !isRelativeModule(mod),
        isRelative: isRelativeModule(mod),
        isTypeOnly: false,
        line: lineIdx + 1,
        module: mod,
        names: [],
        style: 'side-effect',
      })
      continue
    }

    // ─── Namespace: import * as Name from 'module' ───
    const namespaceMatch = trimmed.match(
      /^import\s+(type\s+)?\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/,
    )
    if (namespaceMatch) {
      const name = namespaceMatch[2]!
      const mod = namespaceMatch[3]!
      imports.push({
        filePath,
        isExternal: !isRelativeModule(mod),
        isRelative: isRelativeModule(mod),
        isTypeOnly: !!namespaceMatch[1],
        line: lineIdx + 1,
        module: mod,
        names: [name],
        style: 'namespace',
      })
      continue
    }

    // ─── Combined: import Name, { a, b } from 'module' ───
    const combinedMatch = trimmed.match(
      /^import\s+(type\s+)?(\w+)\s*,\s*\{([^}]*)}\s*from\s+['"]([^'"]+)['"]\s*;?\s*$/,
    )
    if (combinedMatch) {
      const defaultName = combinedMatch[2]!
      const namedStr = combinedMatch[3]!
      const mod = combinedMatch[4]!
      const typeOnly = !!combinedMatch[1]

      // Default import entry
      imports.push({
        filePath,
        isExternal: !isRelativeModule(mod),
        isRelative: isRelativeModule(mod),
        isTypeOnly: typeOnly,
        line: lineIdx + 1,
        module: mod,
        names: [defaultName],
        style: 'default',
      })

      // Named import entry
      const names = parseNamedImports(namedStr)
      imports.push({
        filePath,
        isExternal: !isRelativeModule(mod),
        isRelative: isRelativeModule(mod),
        isTypeOnly: typeOnly,
        line: lineIdx + 1,
        module: mod,
        names,
        style: 'named',
      })
      continue
    }

    // ─── Default: import Name from 'module' ───
    const defaultMatch = trimmed.match(/^import\s+(type\s+)?(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/)
    if (defaultMatch) {
      const name = defaultMatch[2]!
      const mod = defaultMatch[3]!
      imports.push({
        filePath,
        isExternal: !isRelativeModule(mod),
        isRelative: isRelativeModule(mod),
        isTypeOnly: !!defaultMatch[1],
        line: lineIdx + 1,
        module: mod,
        names: [name],
        style: 'default',
      })
      continue
    }

    // ─── Named: import { a, b } from 'module' ───
    const namedMatch = trimmed.match(/^import\s+(type\s+)?\{([^}]*)}\s*from\s+['"]([^'"]+)['"]\s*;?\s*$/)
    if (namedMatch) {
      const namedStr = namedMatch[2]!
      const mod = namedMatch[3]!
      const names = parseNamedImports(namedStr)
      imports.push({
        filePath,
        isExternal: !isRelativeModule(mod),
        isRelative: isRelativeModule(mod),
        isTypeOnly: !!namedMatch[1],
        line: lineIdx + 1,
        module: mod,
        names,
        style: 'named',
      })
      continue
    }
  }

  return imports
}

// ─── Helper: parse named import names ────────────────────

function parseNamedImports(namedStr: string): string[] {
  return namedStr
    .split(',')
    .map((s) => {
      const trimmed = s.trim()
      // Handle "original as alias" — return the alias
      if (trimmed.includes(' as ')) {
        const parts = trimmed.split(/\s+as\s+/)
        return parts[parts.length - 1]!.trim()
      }
      return trimmed
    })
    .filter((s) => s.length > 0)
}

// ─── Helper: check if module path is relative ────────────

function isRelativeModule(mod: string): boolean {
  return mod.startsWith('.')
}

// ─── Module stats aggregation ────────────────────────────

/**
 * Aggregate import info into per-module statistics.
 *
 * @example
 * ```ts
 * const stats = buildModuleStats(imports);
 * // stats sorted by importCount descending
 * ```
 */
export function buildModuleStats(imports: ImportInfo[]): ModuleStats[] {
  const map = new Map<string, ModuleStats>()

  for (const imp of imports) {
    const existing = map.get(imp.module)
    if (existing) {
      existing.importCount++
      const styleEntry = existing.styles.find((s) => s.style === imp.style)
      if (styleEntry) {
        styleEntry.count++
      } else {
        existing.styles.push({ count: 1, style: imp.style })
      }
      if (!existing.files.includes(imp.filePath)) {
        existing.files.push(imp.filePath)
      }
    } else {
      map.set(imp.module, {
        files: [imp.filePath],
        importCount: 1,
        isExternal: imp.isExternal,
        module: imp.module,
        styles: [{ count: 1, style: imp.style }],
      })
    }
  }

  const result = Array.from(map.values())
  result.sort((a, b) => b.importCount - a.importCount)
  return result
}

// ─── Circular dependency detection ───────────────────────

/**
 * Detect circular dependencies using DFS with back-edge detection.
 * Only considers relative imports resolved to files in the analyzed set.
 *
 * @example
 * ```ts
 * const cycles = detectCircularDeps(imports);
 * // cycles.length === 0 means no circular deps found
 * ```
 */
export function detectCircularDeps(imports: ImportInfo[], filePaths?: Set<string>): CircularDep[] {
  // Build adjacency list from relative imports only
  const adjacency = new Map<string, Set<string>>()
  const allFiles = new Set<string>()

  for (const imp of imports) {
    allFiles.add(imp.filePath)
    if (!adjacency.has(imp.filePath)) {
      adjacency.set(imp.filePath, new Set())
    }

    // Only resolve relative imports
    if (imp.isRelative) {
      const resolved = resolveRelativeImport(imp.filePath, imp.module, filePaths)
      if (resolved) {
        adjacency.get(imp.filePath)!.add(resolved)
      }
    }
  }

  const cycles: CircularDep[] = []
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const path: string[] = []

  function dfs(node: string): void {
    if (recursionStack.has(node)) {
      // Found a cycle — extract the cycle path
      const cycleStart = path.indexOf(node)
      if (cycleStart !== -1) {
        const cyclePath = path.slice(cycleStart)
        cyclePath.push(node)
        cycles.push({
          length: cyclePath.length - 1,
          path: cyclePath,
        })
      }
      return
    }

    if (visited.has(node)) return

    visited.add(node)
    recursionStack.add(node)
    path.push(node)

    const neighbors = adjacency.get(node)
    if (neighbors) {
      for (const neighbor of neighbors) {
        dfs(neighbor)
      }
    }

    path.pop()
    recursionStack.delete(node)
  }

  for (const file of allFiles) {
    if (!visited.has(file)) {
      dfs(file)
    }
  }

  return cycles
}

/**
 * Resolve a relative import path to an actual file path.
 * Tries appending .ts, .tsx, .js, .jsx extensions and /index.ts etc.
 */
function resolveRelativeImport(
  fromFile: string,
  relativePath: string,
  filePaths?: Set<string>,
): string | null {
  // Normalize the from file to get the directory
  const lastSlash = fromFile.lastIndexOf('/')
  const dir = lastSlash !== -1 ? fromFile.slice(0, lastSlash) : ''
  const extensions = ['.ts', '.tsx', '.js', '.jsx']

  // Resolve the relative path segments
  const parts = dir ? dir.split('/') : []
  const relParts = relativePath.split('/')

  for (const part of relParts) {
    if (part === '..') {
      parts.pop()
    } else if (part !== '.') {
      parts.push(part)
    }
  }

  const baseCandidate = parts.join('/')

  // Try exact path with extensions
  for (const ext of extensions) {
    const candidate = baseCandidate + ext
    if (!filePaths || filePaths.has(candidate)) {
      return candidate
    }
  }

  // Try index file
  for (const ext of extensions) {
    const candidate = baseCandidate + '/index' + ext
    if (!filePaths || filePaths.has(candidate)) {
      return candidate
    }
  }

  return null
}

// ─── Build full result ───────────────────────────────────

/**
 * Build a comprehensive imports analysis result.
 *
 * @example
 * ```ts
 * const result = buildImportsResult(allImports, { top: 10, circular: true });
 * console.log(result.externalRatio);
 * ```
 */
export function buildImportsResult(
  imports: ImportInfo[],
  options: BuildImportsResultOptions = {},
): ImportsResult {
  const totalImports = imports.length
  const externalImports = imports.filter((i) => i.isExternal).length
  const internalImports = imports.filter((i) => i.isRelative).length
  const typeOnlyImports = imports.filter((i) => i.isTypeOnly).length

  // Style breakdown
  const styleMap = new Map<ImportStyle, number>()
  for (const imp of imports) {
    const count = styleMap.get(imp.style) ?? 0
    styleMap.set(imp.style, count + 1)
  }

  const byStyle: { style: string; count: number; percentage: number }[] = []
  for (const [style, count] of styleMap) {
    byStyle.push({
      count,
      percentage: totalImports > 0 ? Math.round((count / totalImports) * 10000) / 100 : 0,
      style,
    })
  }
  byStyle.sort((a, b) => b.count - a.count)

  // Module stats
  const moduleStats = buildModuleStats(imports)
  const topLimit = options.top ?? 20
  const topModules = moduleStats.slice(0, topLimit)

  // Circular deps
  const circularDeps = options.circular
    ? detectCircularDeps(imports, options.filePaths)
    : []

  // External ratio
  const externalRatio = totalImports > 0 ? Math.round((externalImports / totalImports) * 10000) / 100 : 0

  return {
    byStyle,
    circularDeps,
    externalImports,
    externalRatio,
    imports,
    internalImports,
    moduleStats,
    topModules,
    totalImports,
    typeOnlyImports,
  }
}
