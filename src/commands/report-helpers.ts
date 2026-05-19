import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// ─── Interfaces ──────────────────────────────────────────

export interface FileContent {
  path: string
  content: string
  size: number
}

export interface ReportSection {
  title: string
  content: string
}

export interface SummaryData {
  totalFiles: number
  totalLines: number
  totalSize: number
  languages: { lang: string; files: number; lines: number; percentage: number }[]
  extensions: { ext: string; count: number }[]
}

export interface ComplexityData {
  totalFunctions: number
  averageComplexity: number
  highRiskCount: number
  topComplexFiles: { file: string; avgComplexity: number }[]
}

export interface TodosData {
  totalTodos: number
  totalFixmes: number
  totalHacks: number
  byFile: { file: string; count: number }[]
}

export interface DependenciesData {
  totalDeps: number
  totalDevDeps: number
  versionTypes: { type: string; count: number }[]
}

export interface SuggestionsData {
  total: number
  highSeverity: number
  byCategory: { category: string; count: number }[]
  topSuggestions: { rule: string; count: number }[]
}

export interface FullReport {
  generatedAt: string
  projectPath: string
  summary: SummaryData
  complexity: ComplexityData
  todos: TodosData
  dependencies: DependenciesData
  suggestions: SuggestionsData
  sections: ReportSection[]
}

export interface ReportOptions {
  sections: string[]
}

// ─── Language detection ─────────────────────────────────

const EXTENSION_MAP: Record<string, string> = {
  '.css': 'CSS',
  '.go': 'Go',
  '.html': 'HTML',
  '.java': 'Java',
  '.js': 'JavaScript',
  '.json': 'JSON',
  '.jsx': 'JavaScript',
  '.md': 'Markdown',
  '.py': 'Python',
  '.rb': 'Ruby',
  '.rs': 'Rust',
  '.sh': 'Shell',
  '.sql': 'SQL',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.xml': 'XML',
  '.yaml': 'YAML',
  '.yml': 'YAML',
}

/**
 * Detects the programming language from a file extension.
 *
 * @param filePath - Path to the file
 * @returns The detected language name or 'Unknown'
 *
 * @example
 * detectLanguage('index.ts') // 'TypeScript'
 * detectLanguage('app.py')   // 'Python'
 */
export function detectLanguage(filePath: string): string {
  const dotIndex = filePath.lastIndexOf('.')
  if (dotIndex === -1) return 'Unknown'
  const ext = filePath.slice(dotIndex).toLowerCase()
  return EXTENSION_MAP[ext] ?? 'Unknown'
}

// ─── Section filtering ──────────────────────────────────

const ALL_SECTIONS = ['summary', 'files', 'complexity', 'todos', 'deps', 'suggestions']

/**
 * Determines whether a section should be included in the report.
 *
 * @param section - The section name to check
 * @param selected - The list of selected sections
 * @returns True if the section should be included
 *
 * @example
 * shouldInclude('summary', ['all'])          // true
 * shouldInclude('todos', ['summary', 'deps']) // false
 */
export function shouldInclude(section: string, selected: string[]): boolean {
  if (selected.includes('all')) return true
  return selected.includes(section)
}

/**
 * Parses a comma-separated sections string into an array.
 *
 * @param sectionsFlag - The raw --sections flag value
 * @returns Array of section names
 *
 * @example
 * parseSections('all')                   // ['all']
 * parseSections('summary,complexity')    // ['summary', 'complexity']
 */
export function parseSections(sectionsFlag: string): string[] {
  if (sectionsFlag === 'all') return ['all']
  return sectionsFlag
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

// ─── collectSummary ─────────────────────────────────────

/**
 * Computes file, line, language, and extension statistics.
 *
 * @param files - Array of file content objects
 * @returns Aggregated summary data
 *
 * @example
 * collectSummary([
 *   { path: 'a.ts', content: 'const x = 1;', size: 14 },
 *   { path: 'b.py', content: 'x = 1\ny = 2', size: 10 },
 * ])
 */
export function collectSummary(files: FileContent[]): SummaryData {
  let totalLines = 0
  let totalSize = 0
  const langMap = new Map<string, { files: number; lines: number }>()
  const extMap = new Map<string, number>()

  for (const file of files) {
    const lines = file.content.split('\n').length
    totalLines += lines
    totalSize += file.size

    const lang = detectLanguage(file.path)
    const existing = langMap.get(lang)
    if (existing) {
      existing.files++
      existing.lines += lines
    } else {
      langMap.set(lang, { files: 1, lines })
    }

    const dotIndex = file.path.lastIndexOf('.')
    const ext = dotIndex !== -1 ? file.path.slice(dotIndex).toLowerCase() : '(none)'
    extMap.set(ext, (extMap.get(ext) ?? 0) + 1)
  }

  const languages = Array.from(langMap.entries()).map(([lang, data]) => ({
    files: data.files,
    lang,
    lines: data.lines,
    percentage: totalLines > 0 ? Math.round((data.lines / totalLines) * 10000) / 100 : 0,
  }))
  languages.sort((a, b) => b.lines - a.lines)

  const extensions = Array.from(extMap.entries()).map(([ext, count]) => ({ count, ext }))
  extensions.sort((a, b) => b.count - a.count)

  return {
    extensions,
    languages,
    totalFiles: files.length,
    totalLines,
    totalSize,
  }
}

// ─── collectComplexity ──────────────────────────────────

/**
 * Performs lightweight cyclomatic complexity analysis.
 *
 * Counts functions and decision points using regex heuristics,
 * then computes per-file and aggregate complexity metrics.
 *
 * @param allContent - Array of file content objects
 * @returns Complexity metrics
 *
 * @example
 * collectComplexity([
 *   { path: 'a.ts', content: 'function foo() { if (x) { bar(); } }', size: 36 },
 * ])
 */
export function collectComplexity(allContent: FileContent[]): ComplexityData {
  let totalFunctions = 0
  let totalComplexity = 0
  let highRiskCount = 0
  const fileComplexities: { file: string; avgComplexity: number }[] = []

  for (const file of allContent) {
    const funcCount = countFunctions(file.content)
    const decisionCount = countDecisionPoints(file.content)
    totalFunctions += funcCount
    totalComplexity += decisionCount

    const avgComplexity = funcCount > 0 ? Math.round(((decisionCount + funcCount) / funcCount) * 100) / 100 : 0
    if (avgComplexity > 10) {
      highRiskCount++
    }
    fileComplexities.push({ avgComplexity, file: file.path })
  }

  const averageComplexity =
    totalFunctions > 0 ? Math.round(((totalComplexity + totalFunctions) / totalFunctions) * 100) / 100 : 0

  fileComplexities.sort((a, b) => b.avgComplexity - a.avgComplexity)
  const topComplexFiles = fileComplexities.slice(0, 5).filter((f) => f.avgComplexity > 0)

  return {
    averageComplexity,
    highRiskCount,
    topComplexFiles,
    totalFunctions,
  }
}

function countFunctions(content: string): number {
  let count = 0
  const funcKeyword = content.match(/\bfunction\s+\w/g)
  count += funcKeyword ? funcKeyword.length : 0
  const arrowFunc = content.match(/=>/g)
  count += arrowFunc ? arrowFunc.length : 0
  const methodDef = content.match(/\b(async\s+)?\w+\s*\([^)]*\)\s*:\s*\w/g)
  count += methodDef ? methodDef.length : 0
  return count
}

function countDecisionPoints(content: string): number {
  let count = 0
  const ifMatch = content.match(/\bif\b/g)
  count += ifMatch ? ifMatch.length : 0
  const forMatch = content.match(/\bfor\b/g)
  count += forMatch ? forMatch.length : 0
  const whileMatch = content.match(/\bwhile\b/g)
  count += whileMatch ? whileMatch.length : 0
  const caseMatch = content.match(/\bcase\b/g)
  count += caseMatch ? caseMatch.length : 0
  const catchMatch = content.match(/\bcatch\b/g)
  count += catchMatch ? catchMatch.length : 0
  const andMatch = content.match(/&&/g)
  count += andMatch ? andMatch.length : 0
  const orMatch = content.match(/\|\|/g)
  count += orMatch ? orMatch.length : 0
  const ternaryMatch = content.match(/\?(?![?.])/g)
  count += ternaryMatch ? ternaryMatch.length : 0
  return count
}

// ─── collectTodos ───────────────────────────────────────

/**
 * Counts TODO, FIXME, and HACK markers across all files.
 *
 * @param allContent - Array of file content objects
 * @returns Todo counts grouped by type and file
 *
 * @example
 * collectTodos([
 *   { path: 'a.ts', content: '// TODO: fix this\n// FIXME: broken', size: 30 },
 * ])
 */
export function collectTodos(allContent: FileContent[]): TodosData {
  let totalTodos = 0
  let totalFixmes = 0
  let totalHacks = 0
  const fileMap = new Map<string, number>()

  for (const file of allContent) {
    const todoMatches = file.content.match(/\bTODO\b/gi)
    const fixmeMatches = file.content.match(/\bFIXME\b/gi)
    const hackMatches = file.content.match(/\bHACK\b/gi)

    const todoCount = todoMatches ? todoMatches.length : 0
    const fixmeCount = fixmeMatches ? fixmeMatches.length : 0
    const hackCount = hackMatches ? hackMatches.length : 0
    const fileTotal = todoCount + fixmeCount + hackCount

    totalTodos += todoCount
    totalFixmes += fixmeCount
    totalHacks += hackCount

    if (fileTotal > 0) {
      fileMap.set(file.path, fileTotal)
    }
  }

  const byFile = Array.from(fileMap.entries())
    .map(([file, count]) => ({ count, file }))
    .sort((a, b) => b.count - a.count)

  return { byFile, totalFixmes, totalHacks, totalTodos }
}

// ─── collectDependencies ───────────────────────────────

/**
 * Analyzes dependencies from a package.json file.
 *
 * Reads package.json from the given directory, counts dependencies
 * and categorizes version types (caret, tilde, exact).
 *
 * @param dir - Directory containing package.json
 * @returns Dependency analysis data (empty if no package.json)
 *
 * @example
 * await collectDependencies('/path/to/project')
 */
export async function collectDependencies(dir: string): Promise<DependenciesData> {
  const pkgPath = resolve(dir, 'package.json')
  if (!existsSync(pkgPath)) {
    return { totalDeps: 0, totalDevDeps: 0, versionTypes: [] }
  }

  try {
    const raw = await readFile(pkgPath, 'utf8')
    const pkg = JSON.parse(raw) as Record<string, unknown>
    return analyzeDependencies(pkg)
  } catch {
    return { totalDeps: 0, totalDevDeps: 0, versionTypes: [] }
  }
}

/**
 * Analyzes dependency data from a parsed package.json object.
 *
 * @param pkg - Parsed package.json object
 * @returns Dependency analysis data
 *
 * @example
 * analyzeDependencies({ dependencies: { lodash: '^4.17.0' }, devDependencies: { vitest: '~1.0.0' } })
 */
export function analyzeDependencies(pkg: Record<string, unknown>): DependenciesData {
  const deps = (pkg.dependencies ?? {}) as Record<string, string>
  const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>

  const depsEntries = Object.entries(deps)
  const devDepsEntries = Object.entries(devDeps)

  const versionTypeMap = new Map<string, number>()
  for (const [, version] of [...depsEntries, ...devDepsEntries]) {
    const type = categorizeVersion(version)
    versionTypeMap.set(type, (versionTypeMap.get(type) ?? 0) + 1)
  }

  const versionTypes = Array.from(versionTypeMap.entries()).map(([type, count]) => ({ count, type }))
  versionTypes.sort((a, b) => b.count - a.count)

  return {
    totalDeps: depsEntries.length,
    totalDevDeps: devDepsEntries.length,
    versionTypes,
  }
}

function categorizeVersion(version: string): string {
  if (version.startsWith('file:') || version.startsWith('link:')) return 'local'
  if (version.startsWith('github:') || version.includes('/')) return 'git'
  if (version.startsWith('^')) return 'caret'
  if (version.startsWith('~')) return 'tilde'
  if (version.startsWith('>=')) return 'range'
  if (version.startsWith('*') || version === 'latest') return 'wildcard'
  return 'exact'
}

// ─── collectSuggestions ─────────────────────────────────

interface SuggestionRule {
  pattern: RegExp
  rule: string
  category: string
  severity: 'high' | 'low' | 'medium'
}

const SUGGESTION_RULES: SuggestionRule[] = [
  { category: 'debugging', pattern: /console\.log/g, rule: 'no-console-log', severity: 'low' },
  { category: 'type-safety', pattern: /:\s*any\b/g, rule: 'no-explicit-any', severity: 'medium' },
  { category: 'type-safety', pattern: /@ts-ignore/g, rule: 'no-ts-ignore', severity: 'medium' },
  { category: 'error-handling', pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g, rule: 'no-empty-catch', severity: 'high' },
  { category: 'error-handling', pattern: /catch\s*\(\)\s*\{\s*\}/g, rule: 'no-empty-catch', severity: 'high' },
  { category: 'security', pattern: /\beval\s*\(/g, rule: 'no-eval', severity: 'high' },
]

/**
 * Scans files for common code quality issues.
 *
 * Checks for console.log, explicit any, ts-ignore, empty catch,
 * and eval usage. Groups by severity and category.
 *
 * @param allContent - Array of file content objects
 * @returns Suggestion data grouped by severity and category
 *
 * @example
 * collectSuggestions([
 *   { path: 'a.ts', content: 'console.log("hello"); eval(str)', size: 30 },
 * ])
 */
export function collectSuggestions(allContent: FileContent[]): SuggestionsData {
  let total = 0
  let highSeverity = 0
  const categoryMap = new Map<string, number>()
  const ruleMap = new Map<string, number>()

  for (const file of allContent) {
    for (const rule of SUGGESTION_RULES) {
      const matches = file.content.match(rule.pattern)
      const count = matches ? matches.length : 0
      if (count > 0) {
        total += count
        if (rule.severity === 'high') {
          highSeverity += count
        }
        categoryMap.set(rule.category, (categoryMap.get(rule.category) ?? 0) + count)
        ruleMap.set(rule.rule, (ruleMap.get(rule.rule) ?? 0) + count)
      }
    }
  }

  const byCategory = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  const allSuggestions = Array.from(ruleMap.entries())
    .map(([rule, count]) => ({ count, rule }))
    .sort((a, b) => b.count - a.count)

  const topSuggestions = allSuggestions.slice(0, 5)

  return { byCategory, highSeverity, topSuggestions, total }
}

// ─── buildFullReport ────────────────────────────────────

/**
 * Orchestrates all data collection and builds a complete report.
 *
 * Collects summary, complexity, todos, dependencies, and suggestions
 * data. Creates formatted sections based on the selected sections.
 *
 * @param projectPath - The project root path
 * @param files - Array of file content objects
 * @param options - Report generation options
 * @returns Complete report data
 *
 * @example
 * await buildFullReport('/project', files, { sections: ['all'] })
 */
export async function buildFullReport(
  projectPath: string,
  files: FileContent[],
  options: ReportOptions,
): Promise<FullReport> {
  const selected = options.sections

  const summary = collectSummary(files)
  const complexity = collectComplexity(files)
  const todos = collectTodos(files)
  const dependencies = await collectDependencies(projectPath)
  const suggestions = collectSuggestions(files)

  const sections: ReportSection[] = []

  if (shouldInclude('summary', selected)) {
    const lines: string[] = []
    lines.push(`Total Files: ${summary.totalFiles}`)
    lines.push(`Total Lines: ${summary.totalLines.toLocaleString()}`)
    lines.push(`Total Size: ${formatBytes(summary.totalSize)}`)
    lines.push('')
    if (summary.languages.length > 0) {
      lines.push('Language Breakdown:')
      for (const lang of summary.languages) {
        lines.push(`  ${lang.lang.padEnd(14)} ${String(lang.lines).padStart(6)} lines (${lang.percentage.toFixed(1)}%) - ${lang.files} files`)
      }
    }
    sections.push({ content: lines.join('\n'), title: 'Summary' })
  }

  if (shouldInclude('files', selected)) {
    const lines: string[] = []
    if (files.length === 0) {
      lines.push('No files found.')
    } else {
      const sortedFiles = [...files].sort((a, b) => b.content.split('\n').length - a.content.split('\n').length)
      for (const file of sortedFiles) {
        const lineCount = file.content.split('\n').length
        const lang = detectLanguage(file.path)
        lines.push(`  ${file.path.padEnd(40)} ${String(lineCount).padStart(6)} lines  ${lang}`)
      }
    }
    sections.push({ content: lines.join('\n'), title: 'Files' })
  }

  if (shouldInclude('complexity', selected)) {
    const lines: string[] = []
    lines.push(`Total Functions: ${complexity.totalFunctions}`)
    lines.push(`Average Complexity: ${complexity.averageComplexity}`)
    lines.push(`High Risk Count (>10): ${complexity.highRiskCount}`)
    if (complexity.topComplexFiles.length > 0) {
      lines.push('')
      lines.push('Top Complex Files:')
      for (const entry of complexity.topComplexFiles) {
        lines.push(`  ${entry.file.padEnd(40)} avg: ${entry.avgComplexity}`)
      }
    }
    sections.push({ content: lines.join('\n'), title: 'Complexity' })
  }

  if (shouldInclude('todos', selected)) {
    const lines: string[] = []
    lines.push(`TODOs: ${todos.totalTodos}`)
    lines.push(`FIXMEs: ${todos.totalFixmes}`)
    lines.push(`HACKs: ${todos.totalHacks}`)
    if (todos.byFile.length > 0) {
      lines.push('')
      lines.push('Files with Most Todos:')
      const topFiles = todos.byFile.slice(0, 10)
      for (const entry of topFiles) {
        lines.push(`  ${entry.file.padEnd(40)} ${entry.count}`)
      }
    }
    sections.push({ content: lines.join('\n'), title: 'Todos' })
  }

  if (shouldInclude('deps', selected)) {
    const lines: string[] = []
    lines.push(`Dependencies: ${dependencies.totalDeps}`)
    lines.push(`Dev Dependencies: ${dependencies.totalDevDeps}`)
    if (dependencies.versionTypes.length > 0) {
      lines.push('')
      lines.push('Version Types:')
      for (const vt of dependencies.versionTypes) {
        lines.push(`  ${vt.type.padEnd(10)} ${vt.count}`)
      }
    }
    sections.push({ content: lines.join('\n'), title: 'Dependencies' })
  }

  if (shouldInclude('suggestions', selected)) {
    const lines: string[] = []
    lines.push(`Total Suggestions: ${suggestions.total}`)
    lines.push(`High Severity: ${suggestions.highSeverity}`)
    if (suggestions.byCategory.length > 0) {
      lines.push('')
      lines.push('By Category:')
      for (const cat of suggestions.byCategory) {
        lines.push(`  ${cat.category.padEnd(18)} ${cat.count}`)
      }
    }
    if (suggestions.topSuggestions.length > 0) {
      lines.push('')
      lines.push('Top Suggestions:')
      for (const sug of suggestions.topSuggestions) {
        lines.push(`  ${sug.rule.padEnd(20)} ${sug.count}`)
      }
    }
    sections.push({ content: lines.join('\n'), title: 'Suggestions' })
  }

  return {
    complexity,
    dependencies,
    generatedAt: new Date().toISOString(),
    projectPath,
    sections,
    summary,
    suggestions,
    todos,
  }
}

// ─── Utility ────────────────────────────────────────────

/**
 * Formats a byte count into a human-readable string.
 *
 * @param bytes - The byte count
 * @returns Formatted string like "1.2 KB" or "3.4 MB"
 *
 * @example
 * formatBytes(1024)       // '1.00 KB'
 * formatBytes(1048576)    // '1.00 MB'
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(2)} ${units[i]}`
}
