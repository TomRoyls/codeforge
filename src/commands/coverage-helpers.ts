import {basename,dirname,extname} from 'node:path'

// ─── Interfaces ──────────────────────────────────────────

export interface TestMapping {
  sourceFile: string
  testFiles: string[]
  covered: boolean
  coverageType: 'direct' | 'indirect' | 'none'
}

export interface CoverageStats {
  totalSourceFiles: number
  coveredFiles: number
  uncoveredFiles: number
  coveragePercentage: number
  totalTestFiles: number
  testToSourceRatio: number
  byDirectory: Record<string, { source: number; test: number; percentage: number }>
  uncoveredModules: string[]
}

export interface CoverageSuggestion {
  file: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  estimatedEffort: number
}

export interface CoverageResult {
  mappings: TestMapping[]
  stats: CoverageStats
  suggestions: CoverageSuggestion[]
}

export interface CoverageOptions {
  ignorePatterns: string[]
  extensions?: string[]
}

export type ContentReader = (filePath: string) => Promise<string>

// ─── Test file detection ────────────────────────────────


/**
 * Check if a file path looks like a test file.
 *
 * @example
 * ```ts
 * isTestFile('app.test.ts') // true
 * isTestFile('app.ts') // false
 * ```
 */
export function isTestFile(filePath: string): boolean {
  const base = basename(filePath)
  if (base.includes('.test.') || base.includes('.spec.')) return true
  const dir = dirname(filePath)
  const parts = dir.split(/[/\\]/)
  return parts.some((p) => p === '__tests__' || p === 'test' || p === 'tests')
}

/**
 * Extract the base name of a source file for matching.
 *
 * @example
 * ```ts
 * sourceBaseName('src/commands/count-helpers.ts') // 'count'
 * sourceBaseName('src/utils.ts') // 'utils'
 * ```
 */
export function sourceBaseName(filePath: string): string {
  const base = basename(filePath, extname(filePath))
  const stripped = base.replace(/-format-helpers$/, '').replace(/-helpers$/, '')
  return stripped
}

/**
 * Find test files corresponding to a source file.
 *
 * @example
 * ```ts
 * findTestFiles('src/commands/count.ts', allFiles) // ['test/count.test.ts']
 * ```
 */
export function findTestFiles(sourcePath: string, allFiles: string[]): string[] {
  const ext = extname(sourcePath)
  const base = sourceBaseName(sourcePath)
  const matches: string[] = []

  for (const file of allFiles) {
    if (!isTestFile(file)) continue
    const fileBase = basename(file, extname(file))

    const directMatch =
      fileBase === `${base}.test` ||
      fileBase === `${base}.spec` ||
      fileBase === `${base}-helpers.test` ||
      fileBase === `${base}-helpers.spec` ||
      fileBase === `${base}-format-helpers.test` ||
      fileBase === `${base}-format-helpers.spec`

    if (directMatch) {
      matches.push(file)
      continue
    }

    const testBase = fileBase.replace(/\.test$/, '').replace(/\.spec$/, '')
    const sourceFileName = basename(sourcePath, ext)
    if (testBase === sourceFileName || testBase === base) {
      matches.push(file)
    }
  }

  return matches
}

/**
 * Determine coverage type based on test file matches.
 *
 * @example
 * ```ts
 * getCoverageType(['test/count.test.ts']) // 'direct'
 * getCoverageType([]) // 'none'
 * ```
 */
export function getCoverageType(testFiles: string[]): 'direct' | 'indirect' | 'none' {
  if (testFiles.length === 0) return 'none'

  for (const tf of testFiles) {
    const base = basename(tf)
    if (base.includes('.test.') || base.includes('.spec.')) return 'direct'
  }
  return 'indirect'
}

// ─── buildTestMapping ───────────────────────────────────

/**
 * Build test mappings for all source files.
 *
 * @example
 * ```ts
 * const mappings = buildTestMapping(sourceFiles, allFiles)
 * mappings[0].covered // true/false
 * ```
 */
export function buildTestMapping(sourceFiles: string[], allFiles: string[]): TestMapping[] {
  return sourceFiles.map((source) => {
    const testFiles = findTestFiles(source, allFiles)
    const coverageType = getCoverageType(testFiles)
    return {
      sourceFile: source,
      testFiles,
      covered: testFiles.length > 0,
      coverageType,
    }
  })
}

// ─── computeCoverageStats ───────────────────────────────

/**
 * Compute aggregate coverage statistics from mappings.
 *
 * @example
 * ```ts
 * const stats = computeCoverageStats(mappings)
 * stats.coveragePercentage // 75.0
 * ```
 */
export function computeCoverageStats(mappings: TestMapping[], allFiles: string[]): CoverageStats {
  const totalSourceFiles = mappings.length
  const coveredFiles = mappings.filter((m) => m.covered).length
  const uncoveredFiles = totalSourceFiles - coveredFiles
  const coveragePercentage = totalSourceFiles > 0 ? Math.round((coveredFiles / totalSourceFiles) * 1000) / 10 : 0

  const testFiles = allFiles.filter((f) => isTestFile(f))
  const totalTestFiles = testFiles.length
  const testToSourceRatio = totalSourceFiles > 0 ? Math.round((totalTestFiles / totalSourceFiles) * 100) / 100 : 0

  const byDirectory: Record<string, { source: number; test: number; percentage: number }> = {}
  for (const mapping of mappings) {
    const dir = dirname(mapping.sourceFile)
    const topDir = dir.split(/[/\\]/)[0] || '.'

    if (!byDirectory[topDir]) {
      byDirectory[topDir] = { source: 0, test: 0, percentage: 0 }
    }
    byDirectory[topDir].source++
    byDirectory[topDir].test += mapping.testFiles.length
  }

  for (const dir of Object.keys(byDirectory)) {
    const d = byDirectory[dir]
    if (!d) continue
    d.percentage = d.source > 0 ? Math.round((d.test / d.source) * 1000) / 10 : 0
  }

  const uncoveredModules: string[] = []
  for (const [dir, data] of Object.entries(byDirectory)) {
    if (data.source > 0 && data.test === 0) {
      uncoveredModules.push(dir)
    }
  }

  return {
    byDirectory,
    coveredFiles,
    coveragePercentage,
    testToSourceRatio,
    totalSourceFiles,
    totalTestFiles,
    uncoveredFiles,
    uncoveredModules,
  }
}

// ─── generateCoverageSuggestions ────────────────────────

/**
 * Generate suggestions for improving test coverage.
 *
 * @example
 * ```ts
 * const suggestions = generateCoverageSuggestions(mappings, contentLengths)
 * suggestions[0].priority // 'high'
 * ```
 */
export function generateCoverageSuggestions(
  mappings: TestMapping[],
  contentLengths: Map<string, number>,
): CoverageSuggestion[] {
  const suggestions: CoverageSuggestion[] = []

  for (const mapping of mappings) {
    if (mapping.covered) continue

    const lineCount = contentLengths.get(mapping.sourceFile) ?? 0
    let estimatedEffort = 0.5
    if (lineCount > 200) estimatedEffort = 2
    else if (lineCount > 50) estimatedEffort = 1

    const priority: 'high' | 'medium' | 'low' = lineCount > 200 ? 'high' : lineCount > 50 ? 'medium' : 'low'

    suggestions.push({
      estimatedEffort,
      file: mapping.sourceFile,
      priority,
      reason: mapping.coverageType === 'none' ? 'No test file found' : 'Only indirect test coverage',
    })
  }

  suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return suggestions
}

// ─── buildCoverageResult ────────────────────────────────

/**
 * Orchestrate full coverage analysis.
 *
 * @example
 * ```ts
 * const result = await buildCoverageResult(files, reader, { ignorePatterns: [] })
 * result.stats.coveragePercentage // 75.0
 * ```
 */
export async function buildCoverageResult(
  files: string[],
  contentReader: ContentReader,
  options: CoverageOptions,
): Promise<CoverageResult> {
  const allFiles = files

  const extSet = options.extensions
    ? new Set(options.extensions)
    : new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])

  const sourceFiles = files.filter((f) => {
    const ext = extname(f)
    if (!extSet.has(ext)) return false
    return !isTestFile(f)
  })

  const mappings = buildTestMapping(sourceFiles, allFiles)
  const stats = computeCoverageStats(mappings, allFiles)

  const contentLengths = new Map<string, number>()
  for (const f of sourceFiles) {
    try {
      const content = await contentReader(f)
      contentLengths.set(f, content.split('\n').length)
    } catch {
      contentLengths.set(f, 0)
    }
  }

  const suggestions = generateCoverageSuggestions(mappings, contentLengths)

  return { mappings, stats, suggestions }
}
