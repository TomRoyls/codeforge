// ─── Types ────────────────────────────────────────────────────────────────────

export type DustType =
  | 'commented-code'
  | 'unused-import'
  | 'dead-export'
  | 'stale-todo'
  | 'deprecated-pattern'
  | 'leftover-debug'
  | 'placeholder'
  | 'stale-config'
  | 'orphan-file'

export type DustSeverity = 'info' | 'warning' | 'cleanup'

export type CleanlinessGrade = 'spotless' | 'clean' | 'dusty' | 'dirty' | 'cluttered'

export interface DustItem {
  type: DustType
  file: string
  line: number
  content: string
  severity: DustSeverity
  description: string
  suggestion: string
  estimatedAge: string
}

export interface DustCategory {
  type: string
  count: number
  items: DustItem[]
  severity: DustSeverity
  description: string
}

export interface DustReport {
  file: string
  dustCount: number
  dustItems: DustItem[]
  cleanliness: number
  grade: CleanlinessGrade
}

export interface DustStats {
  totalDust: number
  dustyFiles: number
  cleanFiles: number
  averageCleanliness: number
  mostCommonDust: string
  dustiestFile: string
  overallCleanliness: number
}

export interface DustResult {
  files: DustReport[]
  categories: DustCategory[]
  allDust: DustItem[]
  stats: DustStats
  recommendations: string[]
}

export interface DustOptions {
  verbose?: boolean
}

// ─── detectCommentedCode ──────────────────────────────────────────────────────

const CODE_INDICATORS = [
  /\bconst\s+\w+\s*=/,
  /\blet\s+\w+\s*=/,
  /\bvar\s+\w+\s*=/,
  /\bfunction\s+\w+/,
  /\breturn\s+/,
  /\bif\s*\(/,
  /\bfor\s*\(/,
  /\bwhile\s*\(/,
  /\bclass\s+\w+/,
  /\bimport\s+/,
  /\bexport\s+/,
  /\w+\s*\.\s*\w+\s*\(/,
  /\w+\s*\(\s*\)/,
  /\{\s*\}/,
  /\w+\s*=\s*\[/,
  /\w+\s*=>\s*\{/,
]

/**
 * Detect lines that are commented-out code.
 *
 * @example
 * detectCommentedCode('// const x = 5', 'a.ts')
 * // => [{ type: 'commented-code', ... }]
 */
export function detectCommentedCode(content: string, filePath: string): DustItem[] {
  const items: DustItem[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const trimmed = (lines[i] ?? '').trim()
    if (!trimmed.startsWith('//')) continue
    if (trimmed.startsWith('///')) continue
    if (trimmed.startsWith('// ───')) continue

    const codePart = trimmed.replace(/^\/\/\s*/, '')
    if (CODE_INDICATORS.some((p) => p.test(codePart))) {
      items.push({
        type: 'commented-code',
        file: filePath,
        line: i + 1,
        content: trimmed,
        severity: 'cleanup',
        description: 'Commented-out code',
        suggestion: 'Remove or extract into a branch',
        estimatedAge: 'unknown',
      })
    }
  }

  return items
}

// ─── detectUnusedImports ──────────────────────────────────────────────────────

/**
 * Detect import statements whose imported names are never used.
 *
 * @example
 * detectUnusedImports("import { foo } from 'a'; const x = 1", 'a.ts')
 * // => [{ type: 'unused-import', ... }]
 */
export function detectUnusedImports(content: string, filePath: string): DustItem[] {
  const items: DustItem[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim()
    const namedMatch = line.match(/^import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"]/)
    if (!namedMatch) continue

    const names = namedMatch[1]?.split(',').map((n) => {
      const trimmed = n.trim()
      return trimmed.includes(' as ') ? trimmed.split(' as ').at(-1) ?? ''.trim() : trimmed
    }) ?? []

    for (const name of names) {
      if (!name) continue
      const restOfFile = lines.slice(i + 1).join('\n')
      const regex = new RegExp(`\\b${escapeRegex(name)}\\b`)
      if (!regex.test(restOfFile)) {
        items.push({
          type: 'unused-import',
          file: filePath,
          line: i + 1,
          content: line,
          severity: 'warning',
          description: `Unused import: ${name}`,
          suggestion: `Remove import '${name}'`,
          estimatedAge: 'unknown',
        })
      }
    }
  }

  return items
}

// ─── detectDeadExports ────────────────────────────────────────────────────────

/**
 * Detect exports that are never imported by any other file.
 *
 * @example
 * detectDeadExports('export function foo() {}', 'a.ts', ['a.ts', 'b.ts'], ['', ''])
 */
export function detectDeadExports(
  content: string,
  filePath: string,
  allFiles: string[],
  allContents: string[],
): DustItem[] {
  const items: DustItem[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim()
    const funcMatch = line.match(/^export\s+(?:async\s+)?function\s+(\w+)/)
    const classMatch = line.match(/^export\s+class\s+(\w+)/)
    const constMatch = line.match(/^export\s+const\s+(\w+)/)
    const typeMatch = line.match(/^export\s+type\s+(\w+)/)
    const ifaceMatch = line.match(/^export\s+interface\s+(\w+)/)

    const name = funcMatch?.[1] ?? classMatch?.[1] ?? constMatch?.[1] ?? typeMatch?.[1] ?? ifaceMatch?.[1]
    if (!name) continue

    let usedElsewhere = false
    for (let j = 0; j < allContents.length; j++) {
      if (allFiles[j] === filePath) continue
      const otherContent = allContents[j]
      if (!otherContent) continue
      const importRegex = new RegExp(`\\bimport\\s*(?:\\{[^}]*\\b${escapeRegex(name)}\\b[^}]*\\}|[^{]*${escapeRegex(name)}\\s+from)`)
      if (importRegex.test(otherContent)) {
        usedElsewhere = true
        break
      }
    }

    if (!usedElsewhere) {
      items.push({
        type: 'dead-export',
        file: filePath,
        line: i + 1,
        content: line,
        severity: 'info',
        description: `Dead export: ${name} is never imported`,
        suggestion: `Remove export '${name}' or add tests`,
        estimatedAge: 'unknown',
      })
    }
  }

  return items
}

// ─── detectStaleTodos ─────────────────────────────────────────────────────────

/**
 * Detect TODO/FIXME comments.
 *
 * @example
 * detectStaleTodos('// TODO: fix this later', 'a.ts')
 * // => [{ type: 'stale-todo', ... }]
 */
export function detectStaleTodos(content: string, filePath: string): DustItem[] {
  const items: DustItem[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/\b(TODO|FIXME|HACK|XXX)\b/.test(line ?? '')) {
      items.push({
        type: 'stale-todo',
        file: filePath,
        line: i + 1,
content: line?.trim() ?? '',
        severity: 'info',
        description: 'Stale TODO/FIXME comment',
        suggestion: 'Resolve or create an issue',
        estimatedAge: 'unknown',
      })
    }
  }

  return items
}

// ─── detectDeprecatedPatterns ─────────────────────────────────────────────────

/**
 * Detect usage of deprecated patterns like var, callback hell, etc.
 *
 * @example
 * detectDeprecatedPatterns('var x = 5', 'a.ts')
 * // => [{ type: 'deprecated-pattern', ... }]
 */
export function detectDeprecatedPatterns(content: string, filePath: string): DustItem[] {
  const items: DustItem[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line?.trim()
    if (trimmed?.startsWith('//')) continue
    if (trimmed?.startsWith('*')) continue

    if (/^\s*var\s+\w+/.test(trimmed ?? '') && !trimmed?.includes('// var')) {
      items.push({
        type: 'deprecated-pattern',
        file: filePath,
        line: i + 1,
        content: trimmed ?? '',
        severity: 'warning',
        description: 'Use of var (prefer const/let)',
        suggestion: 'Replace with const or let',
        estimatedAge: 'unknown',
      })
    }
  }

  return items
}

// ─── detectLeftoverDebug ──────────────────────────────────────────────────────

/**
 * Detect leftover console.log/debugger statements in non-test files.
 *
 * @example
 * detectLeftoverDebug('console.log("debug")', 'a.ts')
 * // => [{ type: 'leftover-debug', ... }]
 */
export function detectLeftoverDebug(content: string, filePath: string): DustItem[] {
  const items: DustItem[] = []
  if (filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts') || filePath.includes('__tests__')) {
    return items
  }

  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line?.trim()
    if (trimmed?.startsWith('//')) continue

    if (/\bconsole\.(log|debug|info|warn|error)\s*\(/.test(trimmed ?? '')) {
      items.push({
        type: 'leftover-debug',
        file: filePath,
        line: i + 1,
        content: trimmed ?? '',
        severity: 'cleanup',
        description: 'Leftover console statement',
        suggestion: 'Remove or replace with proper logging',
        estimatedAge: 'unknown',
      })
    }

    if (/^\s*debugger\s*;?\s*$/.test(trimmed ?? '')) {
      items.push({
        type: 'leftover-debug',
        file: filePath,
        line: i + 1,
        content: trimmed ?? '',
        severity: 'cleanup',
        description: 'Leftover debugger statement',
        suggestion: 'Remove debugger statement',
        estimatedAge: 'unknown',
      })
    }
  }

  return items
}

// ─── detectPlaceholders ───────────────────────────────────────────────────────

/**
 * Detect placeholder patterns: empty catch blocks, TODO without description.
 *
 * @example
 * detectPlaceholders('} catch { }', 'a.ts')
 * // => [{ type: 'placeholder', ... }]
 */
export function detectPlaceholders(content: string, filePath: string): DustItem[] {
  const items: DustItem[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line?.trim()

    if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(trimmed ?? '') || /catch\s*\{\s*\}/.test(trimmed ?? '')) {
      items.push({
        type: 'placeholder',
        file: filePath,
        line: i + 1,
        content: trimmed ?? '',
        severity: 'warning',
        description: 'Empty catch block',
        suggestion: 'Add error handling or comment explaining why it is empty',
        estimatedAge: 'unknown',
      })
    }

    if (/\bTODO\s*:?\s*$/.test(trimmed ?? '') || /\bFIXME\s*:?\s*$/.test(trimmed ?? '')) {
      items.push({
        type: 'placeholder',
        file: filePath,
        line: i + 1,
        content: trimmed ?? '',
        severity: 'warning',
        description: 'TODO without description',
        suggestion: 'Add details about what needs to be done',
        estimatedAge: 'unknown',
      })
    }
  }

  return items
}

// ─── classifyCleanliness ──────────────────────────────────────────────────────

/**
 * Classify cleanliness grade based on dust density.
 *
 * @example
 * classifyCleanliness(0, 100)
 * // => 'spotless'
 */
export function classifyCleanliness(dustCount: number, lineCount: number): CleanlinessGrade {
  if (lineCount === 0) return 'spotless'
  const density = (dustCount / lineCount) * 100
  if (dustCount === 0) return 'spotless'
  if (density < 1) return 'clean'
  if (density < 3) return 'dusty'
  if (density < 5) return 'dirty'
  return 'cluttered'
}

// ─── computeCleanlinessScore ──────────────────────────────────────────────────

/**
 * Compute cleanliness score 0-100.
 *
 * @example
 * computeCleanlinessScore(5, 200)
 * // => 75
 */
export function computeCleanlinessScore(dustCount: number, lineCount: number): number {
  if (lineCount === 0) return 100
  const penalty = (dustCount / lineCount) * 1000
  return Math.max(0, Math.round(100 - penalty))
}

// ─── categorizeDust ───────────────────────────────────────────────────────────

/**
 * Group dust items by type.
 *
 * @example
 * categorizeDust(items)
 */
export function categorizeDust(items: DustItem[]): DustCategory[] {
  const groups = new Map<string, DustItem[]>()
  for (const item of items) {
    if (!groups.has(item.type)) groups.set(item.type, [])
    groups.get(item.type)!.push(item)
  }

  const descriptions: Record<DustType, string> = {
    'commented-code': 'Commented-out code that should be removed',
    'unused-import': 'Imports that are never used',
    'dead-export': 'Exports never imported by other files',
    'stale-todo': 'Old TODO/FIXME comments',
    'deprecated-pattern': 'Usage of deprecated patterns',
    'leftover-debug': 'Leftover debug statements',
    'placeholder': 'Incomplete placeholders',
    'stale-config': 'Stale configuration',
    'orphan-file': 'Files not imported anywhere',
  }

  const severities: Record<DustType, DustSeverity> = {
    'commented-code': 'cleanup',
    'unused-import': 'warning',
    'dead-export': 'info',
    'stale-todo': 'info',
    'deprecated-pattern': 'warning',
    'leftover-debug': 'cleanup',
    'placeholder': 'warning',
    'stale-config': 'info',
    'orphan-file': 'info',
  }

  return [...groups.entries()].map(([type, items]) => ({
    type,
    count: items.length,
    items,
    severity: severities[type as DustType] ?? 'info',
    description: descriptions[type as DustType] ?? type,
  })).sort((a, b) => b.count - a.count)
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate cleanup recommendations.
 *
 * @example
 * generateRecommendations(categories, stats)
 */
export function generateRecommendations(categories: DustCategory[], stats: DustStats): string[] {
  const recs: string[] = []

  if (stats.totalDust === 0) {
    recs.push('Codebase is spotless — no dust detected')
    return recs
  }

  const commented = categories.find((c) => c.type === 'commented-code')
  if (commented && commented.count > 0) {
    recs.push(`Remove ${commented.count} commented-out code block(s)`)
  }

  const unusedImports = categories.find((c) => c.type === 'unused-import')
  if (unusedImports && unusedImports.count > 0) {
    recs.push(`Clean up ${unusedImports.count} unused import(s)`)
  }

  const debug = categories.find((c) => c.type === 'leftover-debug')
  if (debug && debug.count > 0) {
    recs.push(`Remove ${debug.count} leftover debug statement(s)`)
  }

  const todos = categories.find((c) => c.type === 'stale-todo')
  if (todos && todos.count > 3) {
    recs.push(`Resolve ${todos.count} stale TODO/FIXME comments`)
  }

  const deprecated = categories.find((c) => c.type === 'deprecated-pattern')
  if (deprecated && deprecated.count > 0) {
    recs.push(`Modernize ${deprecated.count} deprecated pattern(s)`)
  }

  if (stats.dustyFiles > stats.cleanFiles) {
    recs.push('More files have dust than clean files — consider a cleanup sprint')
  }

  if (stats.overallCleanliness < 50) {
    recs.push(`Overall cleanliness is ${stats.overallCleanliness}% — prioritize cleanup`)
  }

  if (recs.length === 0) {
    recs.push('Minor dust detected — routine cleanup recommended')
  }

  return recs
}

// ─── buildDustResult ──────────────────────────────────────────────────────────

/**
 * Build the complete dust detection result.
 *
 * @example
 * buildDustResult(['a.ts'], ['console.log("hi")'])
 */
export function buildDustResult(
  filePaths: string[],
  contents: string[],
  _options?: DustOptions,
): DustResult {
  const allDust: DustItem[] = []
  const reports: DustReport[] = []

  for (let i = 0; i < filePaths.length; i++) {
    const content = contents[i] ?? ''
    const filePath = filePaths[i] ?? ''
    const fileDust: DustItem[] = []

    fileDust.push(...detectCommentedCode(content, filePath))
    fileDust.push(...detectUnusedImports(content, filePath))
    fileDust.push(...detectDeadExports(content, filePath, filePaths, contents))
    fileDust.push(...detectStaleTodos(content, filePath))
    fileDust.push(...detectDeprecatedPatterns(content, filePath))
    fileDust.push(...detectLeftoverDebug(content, filePath))
    fileDust.push(...detectPlaceholders(content, filePath))

    allDust.push(...fileDust)

    const lineCount = content.split('\n').length
    const cleanliness = computeCleanlinessScore(fileDust.length, lineCount)
    const grade = classifyCleanliness(fileDust.length, lineCount)

    reports.push({
      file: filePath,
      dustCount: fileDust.length,
      dustItems: fileDust,
      cleanliness,
      grade,
    })
  }

  const categories = categorizeDust(allDust)
  const totalDust = allDust.length
  const dustyFiles = reports.filter((r) => r.dustCount > 0).length
  const cleanFiles = reports.filter((r) => r.dustCount === 0).length
  const averageCleanliness = reports.length > 0
    ? Math.round(reports.reduce((s, r) => s + r.cleanliness, 0) / reports.length * 10) / 10
    : 100
  const overallCleanliness = averageCleanliness

  const mostCommonDust = categories.length > 0 ? categories[0]?.type : 'none'
  const dustiestReport = reports.reduce((worst, r) =>
    r.dustCount > (worst?.dustCount ?? 0) ? r : worst, reports[0])
  const dustiestFile = dustiestReport ? dustiestReport.file : 'none'

  const stats: DustStats = {
    totalDust,
    dustyFiles,
    cleanFiles,
    averageCleanliness,
    mostCommonDust: mostCommonDust ?? '',
    dustiestFile,
    overallCleanliness,
  }

  const recommendations = generateRecommendations(categories, stats)

  return { files: reports, categories, allDust, stats, recommendations }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
