// ─── Interfaces ──────────────────────────────────────────

export interface FileBundleInfo {
  file: string
  rawSize: number
  estimatedMinified: number
  estimatedGzipped: number
  lines: number
  imports: string[]
  importCost: number
}

export interface HeavyImport {
  importPath: string
  occurrenceCount: number
  estimatedSize: number
  files: string[]
}

export interface BundleAnalysis {
  files: FileBundleInfo[]
  totalRaw: number
  totalMinified: number
  totalGzipped: number
  largestFiles: FileBundleInfo[]
  heavyImports: HeavyImport[]
}

export interface BundleSuggestion {
  type: 'tree-shaking' | 'code-splitting' | 'alternative' | 'removal'
  description: string
  estimatedSaving: number
  effort: 'low' | 'medium' | 'high'
}

export interface BundleSizeResult {
  analysis: BundleAnalysis
  suggestions: BundleSuggestion[]
}

export interface BundleSizeOptions {
  extensions: string[] | null
  ignorePatterns: string[]
  threshold: number
}

export type ContentReader = (filePath: string) => Promise<string>

// ─── Size estimation ────────────────────────────────────

/**
 * Estimate minified size as ~50% of raw (midpoint of 40-60% range).
 *
 * @example
 * ```ts
 * const minified = estimateMinifiedSize(1000)
 * // minified === 500
 * ```
 */
export function estimateMinifiedSize(rawSize: number): number {
  return Math.round(rawSize * 0.5)
}

/**
 * Estimate gzipped size as ~35% of minified (midpoint of 30-40% range).
 *
 * @example
 * ```ts
 * const gzipped = estimateGzippedSize(500)
 * // gzipped === 175
 * ```
 */
export function estimateGzippedSize(minifiedSize: number): number {
  return Math.round(minifiedSize * 0.35)
}

// ─── Import cost estimation ─────────────────────────────

const KNOWN_PACKAGE_SIZES: Record<string, number> = {
  'd3': 250000,
  'lodash': 72000,
  'lodash-es': 72000,
  'moment': 70000,
  'rxjs': 50000,
  'three': 600000,
  'underscore': 18000,
}

/**
 * Estimate the cost of importing a package.
 *
 * @example
 * ```ts
 * const cost = computeImportCost('lodash')
 * // cost === 72000
 * ```
 */
export function computeImportCost(importPath: string): number {
  const bare = importPath.replace(/^@[^/]+\//, '').split('/')[0] ?? ''
  return KNOWN_PACKAGE_SIZES[bare] ?? 5000
}

// ─── File analysis ──────────────────────────────────────

const IMPORT_LINE_REGEX = /^\s*import\s+.*?\s+from\s+['"]([^'"]+)['"]/

/**
 * Analyze a single file for bundle size metrics.
 *
 * @example
 * ```ts
 * const info = analyzeFileBundle('import lodash from "lodash"\nconst x = 1\n', 'app.ts')
 * info.imports // ['lodash']
 * ```
 */
export function analyzeFileBundle(content: string, filePath: string): FileBundleInfo {
  const rawSize = Buffer.byteLength(content, 'utf8')
  const estimatedMinified = estimateMinifiedSize(rawSize)
  const estimatedGzipped = estimateGzippedSize(estimatedMinified)
  const lines = content.split('\n').length

  const imports: string[] = []
  let importCost = 0

  for (const line of content.split('\n')) {
    const match = IMPORT_LINE_REGEX.exec(line)
    if (match) {
      const importPath = match[1] ?? ''
      imports.push(importPath)
      importCost += computeImportCost(importPath)
    }
  }

  return {
    estimatedGzipped,
    estimatedMinified,
    file: filePath,
    importCost,
    imports,
    lines,
    rawSize,
  }
}

// ─── Heavy import detection ─────────────────────────────

/**
 * Find imports that appear across multiple files and estimate their total cost.
 *
 * @example
 * ```ts
 * const heavy = detectHeavyImports(files)
 * heavy[0]?.importPath // 'lodash'
 * ```
 */
export function detectHeavyImports(files: FileBundleInfo[]): HeavyImport[] {
  const importMap = new Map<string, { count: number; fileList: string[] }>()

  for (const file of files) {
    const seen = new Set<string>()
    for (const imp of file.imports) {
      if (seen.has(imp)) continue
      seen.add(imp)
      const existing = importMap.get(imp)
      if (existing) {
        existing.count++
        existing.fileList.push(file.file)
      } else {
        importMap.set(imp, { count: 1, fileList: [file.file] })
      }
    }
  }

  const heavy: HeavyImport[] = []
  for (const [importPath, data] of importMap) {
    heavy.push({
      estimatedSize: computeImportCost(importPath),
      files: data.fileList,
      importPath,
      occurrenceCount: data.count,
    })
  }

  heavy.sort((a, b) => b.estimatedSize * b.occurrenceCount - a.estimatedSize * a.occurrenceCount)
  return heavy
}

// ─── Suggestions ────────────────────────────────────────

/**
 * Generate bundle optimization suggestions based on analysis results.
 *
 * @example
 * ```ts
 * const suggestions = generateSizeSuggestions(analysis)
 * suggestions[0]?.type // 'tree-shaking'
 * ```
 */
export function generateSizeSuggestions(analysis: BundleAnalysis): BundleSuggestion[] {
  const suggestions: BundleSuggestion[] = []

  const lodashFiles = analysis.heavyImports.filter((h) =>
    h.importPath === 'lodash' || h.importPath === 'lodash-es',
  )
  for (const heavy of lodashFiles) {
    suggestions.push({
      description: `Replace 'lodash' with 'lodash-es' or per-function imports in ${heavy.files.length} file(s)`,
      effort: 'low',
      estimatedSaving: heavy.estimatedSize * 0.7,
      type: 'tree-shaking',
    })
  }

  const momentFiles = analysis.heavyImports.filter((h) => h.importPath === 'moment')
  for (const heavy of momentFiles) {
    suggestions.push({
      description: `Replace 'moment' with 'date-fns' or 'dayjs' (~90% smaller) in ${heavy.files.length} file(s)`,
      effort: 'medium',
      estimatedSaving: heavy.estimatedSize * 0.9,
      type: 'alternative',
    })
  }

  for (const file of analysis.largestFiles) {
    if (file.estimatedGzipped > 20000) {
      suggestions.push({
        description: `Consider code-splitting ${file.file} (${formatBytes(file.estimatedGzipped)} gzipped)`,
        effort: 'medium',
        estimatedSaving: file.estimatedGzipped * 0.5,
        type: 'code-splitting',
      })
    }
  }

  for (const file of analysis.files) {
    if (file.importCost > 100000) {
      suggestions.push({
        description: `${file.file} has high import cost (${formatBytes(file.importCost)}) — review dependencies`,
        effort: 'medium',
        estimatedSaving: file.importCost * 0.3,
        type: 'removal',
      })
    }
  }

  return suggestions
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

// ─── Build result ───────────────────────────────────────

/**
 * Orchestrate full bundle size analysis across all files.
 *
 * @example
 * ```ts
 * const result = await buildBundleSizeResult(['a.ts'], reader, { extensions: null, ignorePatterns: [], threshold: 0 })
 * result.analysis.totalRaw // number
 * ```
 */
export async function buildBundleSizeResult(
  filePaths: string[],
  contentReader: ContentReader,
  options: BundleSizeOptions,
): Promise<BundleSizeResult> {
  const files: FileBundleInfo[] = []

  for (const filePath of filePaths) {
    if (options.extensions) {
      const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase()
      if (!options.extensions.includes(ext)) continue
    }

    try {
      const content = await contentReader(filePath)
      files.push(analyzeFileBundle(content, filePath))
    } catch {
      // skip unreadable files
    }
  }

  files.sort((a, b) => b.estimatedGzipped - a.estimatedGzipped)

  const totalRaw = sumField(files, 'rawSize')
  const totalMinified = sumField(files, 'estimatedMinified')
  const totalGzipped = sumField(files, 'estimatedGzipped')

  const largestFiles = files.slice(0, 10)
  const heavyImports = detectHeavyImports(files)

  const analysis: BundleAnalysis = {
    files,
    heavyImports,
    largestFiles,
    totalGzipped,
    totalMinified,
    totalRaw,
  }

  const suggestions = generateSizeSuggestions(analysis)

  return { analysis, suggestions }
}

function sumField(arr: FileBundleInfo[], field: keyof FileBundleInfo): number {
  let total = 0
  for (const item of arr) {
    const val = item[field]
    if (typeof val === 'number') total += val
  }
  return total
}
