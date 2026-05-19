import { basename, dirname, join, normalize } from 'node:path'

// ─── Types ──────────────────────────────────────────────

export type ContentReader = (filePath: string) => Promise<string>

export interface ExportInfo {
  name: string
  file: string
  line: number
  type: 'class' | 'const' | 'default' | 'enum' | 'function' | 'interface' | 'type'
  isReExport: boolean
  importers: string[]
  importCount: number
}

export interface ImportDetail {
  name: string
  source: string
  file: string
  line: number
  type: 'default' | 'dynamic' | 'named' | 'namespace'
}

export interface ExportNode {
  file: string
  exports: ExportInfo[]
  totalExports: number
  totalImports: number
  exportToImportRatio: number
}

export interface ExportEdge {
  from: string
  to: string
  symbols: string[]
  count: number
}

export interface ExportGraph {
  nodes: ExportNode[]
  edges: ExportEdge[]
  orphanExports: ExportInfo[]
  hubExports: ExportInfo[]
}

export interface ExportGraphStats {
  totalExports: number
  totalImports: number
  totalEdges: number
  orphanCount: number
  hubCount: number
  avgExportsPerFile: number
  avgImportsPerFile: number
  mostUsedExport: ExportInfo | null
  leastUsedExports: ExportInfo[]
}

export interface ExportGraphResult {
  graph: ExportGraph
  stats: ExportGraphStats
}

export interface ExportGraphOptions {
  verbose?: boolean
}

// ─── extractExports ─────────────────────────────────────

/**
 * @example
 * const exports = extractExports(content, 'src/foo.ts')
 * console.log(exports[0].name)
 */
export function extractExports(content: string, filePath: string): ExportInfo[] {
  const exports: ExportInfo[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    const defaultFunc = line.match(/^export\s+default\s+function\s+(\w+)/)
    if (defaultFunc) {
      exports.push({ name: defaultFunc[1], file: filePath, line: lineNum, type: 'function', isReExport: false, importers: [], importCount: 0 })
      continue
    }

    const defaultClass = line.match(/^export\s+default\s+class\s+(\w+)/)
    if (defaultClass) {
      exports.push({ name: defaultClass[1], file: filePath, line: lineNum, type: 'class', isReExport: false, importers: [], importCount: 0 })
      continue
    }

    const defaultExpr = line.match(/^export\s+default\s+(\w+)/)
    if (defaultExpr && !defaultFunc && !defaultClass) {
      exports.push({ name: defaultExpr[1], file: filePath, line: lineNum, type: 'default', isReExport: false, importers: [], importCount: 0 })
      continue
    }

    const reExport = line.match(/^export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
    if (reExport) {
      const names = reExport[1].split(',').map((s) => s.trim().split(/\s+as\s+/).pop()!.trim()).filter(Boolean)
      for (const name of names) {
        exports.push({ name, file: filePath, line: lineNum, type: 'const', isReExport: true, importers: [], importCount: 0 })
      }
      continue
    }

    const reExportAll = line.match(/^export\s+\*\s+from\s+['"]([^'"]+)['"]/)
    if (reExportAll) {
      exports.push({ name: `* from ${reExportAll[1]}`, file: filePath, line: lineNum, type: 'const', isReExport: true, importers: [], importCount: 0 })
      continue
    }

    const namedFunc = line.match(/^export\s+function\s+(\w+)/)
    if (namedFunc) {
      exports.push({ name: namedFunc[1], file: filePath, line: lineNum, type: 'function', isReExport: false, importers: [], importCount: 0 })
      continue
    }

    const namedClass = line.match(/^export\s+class\s+(\w+)/)
    if (namedClass) {
      exports.push({ name: namedClass[1], file: filePath, line: lineNum, type: 'class', isReExport: false, importers: [], importCount: 0 })
      continue
    }

    const namedInterface = line.match(/^export\s+interface\s+(\w+)/)
    if (namedInterface) {
      exports.push({ name: namedInterface[1], file: filePath, line: lineNum, type: 'interface', isReExport: false, importers: [], importCount: 0 })
      continue
    }

    const namedType = line.match(/^export\s+type\s+(\w+)/)
    if (namedType) {
      exports.push({ name: namedType[1], file: filePath, line: lineNum, type: 'type', isReExport: false, importers: [], importCount: 0 })
      continue
    }

    const namedEnum = line.match(/^export\s+enum\s+(\w+)/)
    if (namedEnum) {
      exports.push({ name: namedEnum[1], file: filePath, line: lineNum, type: 'enum', isReExport: false, importers: [], importCount: 0 })
      continue
    }

    const namedConst = line.match(/^export\s+const\s+(\w+)/)
    if (namedConst) {
      exports.push({ name: namedConst[1], file: filePath, line: lineNum, type: 'const', isReExport: false, importers: [], importCount: 0 })
      continue
    }

    const namedLet = line.match(/^export\s+let\s+(\w+)/)
    if (namedLet) {
      exports.push({ name: namedLet[1], file: filePath, line: lineNum, type: 'const', isReExport: false, importers: [], importCount: 0 })
      continue
    }

    const namedExportList = line.match(/^export\s+\{([^}]+)\}/)
    if (namedExportList && !reExport) {
      const names = namedExportList[1].split(',').map((s) => s.trim().split(/\s+as\s+/).pop()!.trim()).filter(Boolean)
      for (const name of names) {
        exports.push({ name, file: filePath, line: lineNum, type: 'const', isReExport: false, importers: [], importCount: 0 })
      }
      continue
    }
  }

  return exports
}

// ─── extractImports ─────────────────────────────────────

/**
 * @example
 * const imports = extractImports(content, 'src/bar.ts')
 * console.log(imports[0].name)
 */
export function extractImports(content: string, filePath: string): ImportDetail[] {
  const imports: ImportDetail[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    const namedImport = line.match(/^import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/)
    if (namedImport) {
      const names = namedImport[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean)
      for (const name of names) {
        imports.push({ name, source: namedImport[2], file: filePath, line: lineNum, type: 'named' })
      }
      continue
    }

    const defaultImport = line.match(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/)
    if (defaultImport) {
      imports.push({ name: defaultImport[1], source: defaultImport[2], file: filePath, line: lineNum, type: 'default' })
      continue
    }

    const nsImport = line.match(/^import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/)
    if (nsImport) {
      imports.push({ name: nsImport[1], source: nsImport[2], file: filePath, line: lineNum, type: 'namespace' })
      continue
    }

    const sideEffect = line.match(/^import\s+['"]([^'"]+)['"]/)
    if (sideEffect) {
      imports.push({ name: '*', source: sideEffect[1], file: filePath, line: lineNum, type: 'named' })
      continue
    }

    const dynamicImport = line.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/)
    if (dynamicImport) {
      imports.push({ name: '*', source: dynamicImport[1], file: filePath, line: lineNum, type: 'dynamic' })
      continue
    }

    const requireCall = line.match(/(?:const|let|var)\s+\{([^}]+)\}\s*=\s*require\s*\(\s*['"]([^'"]+)['"]?\s*\)/)
    if (requireCall) {
      const names = requireCall[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean)
      for (const name of names) {
        imports.push({ name, source: requireCall[2], file: filePath, line: lineNum, type: 'named' })
      }
    }
  }

  return imports
}

// ─── resolveSource ──────────────────────────────────────

function resolveSource(source: string, fromFile: string, allFiles: string[]): string | null {
  if (!source.startsWith('.')) return null
  const dir = dirname(fromFile)
  let resolved = normalize(join(dir, source))

  resolved = resolved.replace(/\.js$/, '.ts').replace(/\.jsx$/, '.tsx').replace(/\.mjs$/, '.mts')

  const match = allFiles.find((f) => normalize(f) === resolved)
  if (match) return match

  const withExt = allFiles.find((f) => normalize(f) === resolved + '.ts' || normalize(f) === resolved + '.tsx')
  if (withExt) return withExt

  const indexMatch = allFiles.find((f) => normalize(f) === join(resolved, 'index.ts') || normalize(f) === join(resolved, 'index.tsx'))
  if (indexMatch) return indexMatch

  return null
}

// ─── buildExportGraph ───────────────────────────────────

/**
 * @example
 * const graph = buildExportGraph(files, contents)
 * console.log(graph.nodes.length)
 */
export function buildExportGraph(
  files: string[],
  contents: Map<string, string>,
): ExportGraph {
  const nodes: ExportNode[] = []
  const edges: ExportEdge[] = []
  const allExports: ExportInfo[] = []
  const allImports: ImportDetail[] = []

  for (const file of files) {
    const content = contents.get(file) ?? ''
    const exports = extractExports(content, file)
    const imports = extractImports(content, file)

    allExports.push(...exports)
    allImports.push(...imports)

    const totalImports = imports.filter((imp) => imp.source.startsWith('.')).length

    nodes.push({
      exports,
      exportToImportRatio: totalImports > 0 ? Math.round((exports.length / totalImports) * 100) / 100 : exports.length > 0 ? Infinity : 0,
      file,
      totalExports: exports.length,
      totalImports,
    })
  }

  for (const imp of allImports) {
    const resolvedSource = resolveSource(imp.source, imp.file, files)
    if (!resolvedSource) continue

    const existingEdge = edges.find(
      (e) => e.from === resolvedSource && e.to === imp.file,
    )

    if (existingEdge) {
      if (imp.name !== '*' && !existingEdge.symbols.includes(imp.name)) {
        existingEdge.symbols.push(imp.name)
      }
      existingEdge.count = existingEdge.symbols.length
    } else {
      edges.push({
        count: imp.name === '*' ? 1 : 1,
        from: resolvedSource,
        symbols: imp.name === '*' ? [] : [imp.name],
        to: imp.file,
      })
    }

    const targetExport = allExports.find(
      (e) => e.file === resolvedSource && (e.name === imp.name || imp.name === '*'),
    )
    if (targetExport && !targetExport.importers.includes(imp.file)) {
      targetExport.importers.push(imp.file)
      targetExport.importCount = targetExport.importers.length
    }
  }

  const orphanExports = findOrphanExports(allExports)
  const hubExports = findHubExports(allExports)

  return { edges, hubExports, nodes, orphanExports }
}

// ─── findOrphanExports ──────────────────────────────────

/**
 * @example
 * const orphans = findOrphanExports(exports)
 * console.log(orphans.length)
 */
export function findOrphanExports(exports: ExportInfo[]): ExportInfo[] {
  return exports.filter((e) => e.importCount === 0 && !e.isReExport)
}

// ─── findHubExports ─────────────────────────────────────

/**
 * @example
 * const hubs = findHubExports(exports)
 * console.log(hubs.length)
 */
export function findHubExports(exports: ExportInfo[]): ExportInfo[] {
  return exports.filter((e) => e.importCount > 5)
}

// ─── computeExportGraphStats ────────────────────────────

/**
 * @example
 * const stats = computeExportGraphStats(graph)
 * console.log(stats.totalExports)
 */
export function computeExportGraphStats(graph: ExportGraph): ExportGraphStats {
  const totalExports = graph.nodes.reduce((s, n) => s + n.totalExports, 0)
  const totalImports = graph.nodes.reduce((s, n) => s + n.totalImports, 0)

  const sorted = [...graph.nodes.flatMap((n) => n.exports)]
    .sort((a, b) => b.importCount - a.importCount)

  const mostUsedExport = sorted.length > 0 && sorted[0].importCount > 0 ? sorted[0] : null
  const leastUsedExports = sorted.filter((e) => e.importCount === 0 && !e.isReExport).slice(0, 5)

  return {
    avgExportsPerFile: graph.nodes.length > 0 ? Math.round(totalExports / graph.nodes.length * 10) / 10 : 0,
    avgImportsPerFile: graph.nodes.length > 0 ? Math.round(totalImports / graph.nodes.length * 10) / 10 : 0,
    hubCount: graph.hubExports.length,
    leastUsedExports,
    mostUsedExport,
    orphanCount: graph.orphanExports.length,
    totalEdges: graph.edges.length,
    totalExports,
    totalImports,
  }
}

// ─── buildExportGraphResult ─────────────────────────────

/**
 * @example
 * const result = await buildExportGraphResult(files, reader)
 * console.log(result.stats.totalExports)
 */
export async function buildExportGraphResult(
  files: string[],
  contentReader: ContentReader,
  options?: ExportGraphOptions,
): Promise<ExportGraphResult> {
  const contents = new Map<string, string>()

  for (const file of files) {
    try {
      contents.set(file, await contentReader(file))
    } catch {
      continue
    }
  }

  const graph = buildExportGraph(files, contents)
  const stats = computeExportGraphStats(graph)

  void options

  return { graph, stats }
}

// ─── sourceBaseName ─────────────────────────────────────

/**
 * @example
 * const base = sourceBaseName('src/export-graph-helpers.ts')
 * console.log(base)
 */
export function sourceBaseName(filePath: string): string {
  return basename(filePath).replace(/\.ts$/, '')
}
