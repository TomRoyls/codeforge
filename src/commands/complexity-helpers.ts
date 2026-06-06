import type { FunctionComplexity, ComplexityCategory } from '../core/complexity.js'

// ─── Interfaces ──────────────────────────────────────────

export type RiskLevel = 'high' | 'low' | 'medium' | 'very-high'

export interface FunctionInfo {
  name: string
  filePath: string
  startLine: number
  endLine: number
  complexity: number
  params: number
  linesOfCode: number
  riskLevel: RiskLevel
}

export interface FileComplexity {
  filePath: string
  relativePath: string
  functions: FunctionInfo[]
  totalComplexity: number
  averageComplexity: number
  maxComplexity: number
}

export interface ComplexityResult {
  files: FileComplexity[]
  functions: FunctionInfo[]
  totalFunctions: number
  totalComplexity: number
  averageComplexity: number
  byRiskLevel: { level: string; count: number }[]
  byFile: { file: string; complexity: number; functions: number }[]
}

// ─── Risk level ─────────────────────────────────────────

/**
 * Determines the risk level based on cyclomatic complexity score.
 *
 * @param complexity - The cyclomatic complexity value
 * @returns The risk level classification
 *
 * @example
 * getRiskLevel(3)   // 'low'
 * getRiskLevel(8)   // 'medium'
 * getRiskLevel(15)  // 'high'
 * getRiskLevel(25)  // 'very-high'
 */
export function getRiskLevel(complexity: number): RiskLevel {
  if (complexity <= 5) return 'low'
  if (complexity <= 10) return 'medium'
  if (complexity <= 20) return 'high'
  return 'very-high'
}

// ─── Complexity calculation ─────────────────────────────

/**
 * Calculates cyclomatic complexity of a function body by counting decision points + 1.
 *
 * Counts: if, else, for, while, case, catch, &&, ||, ternary ?
 *
 * @param functionBody - The source code of the function body
 * @returns The cyclomatic complexity score (minimum 1)
 *
 * @example
 * calculateComplexity('return 1;')                     // 1
 * calculateComplexity('if (x) { return 1; }')          // 2
 * calculateComplexity('if (x && y) { return 1; }')     // 3
 */
export function calculateComplexity(functionBody: string): number {
  let count = 0

  // Count keyword decision points
  const keywordPatterns = [/\bif\b/g, /\belse\b/g, /\bfor\b/g, /\bwhile\b/g, /\bcase\b/g, /\bcatch\b/g]
  for (const pattern of keywordPatterns) {
    const matches = functionBody.match(pattern)
    if (matches) count += matches.length
  }

  // Count logical operators
  const andMatches = functionBody.match(/&&/g)
  if (andMatches) count += andMatches.length

  const orMatches = functionBody.match(/\|\|/g)
  if (orMatches) count += orMatches.length

  // Count ternary ? — exclude optional chaining (?.) and TypeScript nullable (?:)
  const stripped = functionBody
    .replace(/\?\./g, '')   // remove optional chaining ?.
    .replace(/\?:/g, '')    // remove TypeScript nullable ?:
  const ternaryMatches = stripped.match(/\?/g)
  if (ternaryMatches) count += ternaryMatches.length

  return count + 1
}

// ─── Function extraction ────────────────────────────────

function countLinesOfCode(content: string, startIndex: number): number {
  const braceStart = content.indexOf('{', startIndex)
  if (braceStart === -1) return 1

  let depth = 0
  let i = braceStart
  while (i < content.length) {
    if (content[i] === '{') {
      depth++
    } else if (content[i] === '}') {
      depth--
      if (depth === 0) {
        const body = content.slice(braceStart, i + 1)
        return body.split('\n').length
      }
    }
    i++
  }

  return 1
}

function getLineNumber(content: string, index: number): number {
  let count = 1
  for (let i = 0; i < index && i < content.length; i++) {
    if (content[i] === '\n') count++
  }
  return count
}

function countParams(paramString: string): number {
  const trimmed = paramString.trim()
  if (trimmed.length === 0) return 0
  let depth = 0
  let paramCount = 1
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i]
    if (ch === '(' || ch === '[' || ch === '{' || ch === '<') depth++
    else if (ch === ')' || ch === ']' || ch === '}' || ch === '>') depth--
    else if (ch === ',' && depth === 0) paramCount++
  }
  return paramCount
}

const FUNCTION_PATTERNS: RegExp[] = [
  // async function name(params) {  OR  function name(params) {
  /\b(?:async\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(([^)]*)\)\s*(?::\s*[^{]+)?\s*\{/,
  // const name = (params) => {
  /\b(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*\(([^)]*)\)\s*=>\s*\{/,
  // const name = function(params) {
  /\b(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*function\s*\(([^)]*)\)\s*\{/,
  // private/public/protected/static name(params) {
  /\b(?:private|public|protected|static)\s+([a-zA-Z_$][\w$]*)\s*\(([^)]*)\)\s*(?::\s*[^{]+)?\s*\{/,
  // get name() {
  /\bget\s+([a-zA-Z_$][\w$]*)\s*\(\)\s*\{/,
  // set name(value) {
  /\bset\s+([a-zA-Z_$][\w$]*)\s*\(([^)]*)\)\s*\{/,
]

/**
 * Extracts functions from source code content using regex-based pattern matching.
 *
 * @param content - The source code content
 * @param filePath - The file path for reporting
 * @returns Array of FunctionInfo objects for each detected function
 *
 * @example
 * extractFunctions('function hello() { return 1; }', 'test.ts')
 * // [{ name: 'hello', startLine: 1, endLine: 1, complexity: 1, ... }]
 */
export function extractFunctions(content: string, filePath: string): FunctionInfo[] {
  const functions: FunctionInfo[] = []

  for (const pattern of FUNCTION_PATTERNS) {
    const regex = new RegExp(pattern.source, 'g')
    let match: RegExpExecArray | null
    while ((match = regex.exec(content)) !== null) {
      const name = match[1]
      const paramString = match[2] ?? ''
      const startLine = getLineNumber(content, match.index)
      const linesOfCode = countLinesOfCode(content, match.index)

      // Extract function body for complexity calculation
      const braceStart = content.indexOf('{', match.index)
      let endLine = startLine
      let body = ''

      if (braceStart !== -1) {
        let depth = 0
        let j = braceStart
        while (j < content.length) {
          if (content[j] === '{') depth++
          else if (content[j] === '}') {
            depth--
            if (depth === 0) {
              body = content.slice(braceStart, j + 1)
              endLine = getLineNumber(content, j)
              break
            }
          }
          j++
        }
      }

      const complexity = calculateComplexity(body)

      // Skip duplicates from overlapping patterns
      const isDuplicate = functions.some(
        (fn) => fn.name === name && fn.startLine === startLine,
      )

      if (!isDuplicate) {
        functions.push({
          complexity,
          endLine,
          filePath,
          linesOfCode,
          name: name ?? '',
          params: countParams(paramString),
          riskLevel: getRiskLevel(complexity),
          startLine,
        })
      }
    }
  }

  // Sort by start line
  functions.sort((a, b) => a.startLine - b.startLine)

  return functions
}

// ─── File analysis ──────────────────────────────────────

/**
 * Analyzes cyclomatic complexity of all functions in a single file.
 *
 * @param content - The source code content
 * @param filePath - The file path for reporting
 * @returns FileComplexity with per-function and aggregate stats
 *
 * @example
 * analyzeFileComplexity('function foo() { if (x) return 1; }', 'test.ts')
 * // { filePath: 'test.ts', functions: [...], totalComplexity: 2, ... }
 */
export function analyzeFileComplexity(content: string, filePath: string): FileComplexity {
  const functions = extractFunctions(content, filePath)

  const totalComplexity = functions.reduce((sum, fn) => sum + fn.complexity, 0)
  const averageComplexity = functions.length > 0 ? totalComplexity / functions.length : 0
  const maxComplexity = functions.length > 0
    ? Math.max(...functions.map((fn) => fn.complexity))
    : 0

  return {
    averageComplexity,
    filePath,
    functions,
    maxComplexity,
    relativePath: filePath,
    totalComplexity,
  }
}

// ─── Result building ────────────────────────────────────

/**
 * Builds a complete ComplexityResult from multiple file analyses.
 *
 * @param fileResults - Array of FileComplexity results
 * @returns Aggregated ComplexityResult with totals, risk distribution, and file summary
 *
 * @example
 * buildComplexityResult([analyzeFileComplexity(code, 'test.ts')])
 * // { totalFunctions: 1, averageComplexity: 2, byRiskLevel: [...], ... }
 */
export function buildComplexityResult(fileResults: FileComplexity[]): ComplexityResult {
  const allFunctions = fileResults.flatMap((f) => f.functions)

  // Sort by complexity descending
  allFunctions.sort((a, b) => b.complexity - a.complexity)

  const totalFunctions = allFunctions.length
  const totalComplexity = allFunctions.reduce((sum, fn) => sum + fn.complexity, 0)
  const averageComplexity = totalFunctions > 0 ? totalComplexity / totalFunctions : 0

  // Risk level breakdown
  const riskCounts = new Map<RiskLevel, number>()
  riskCounts.set('low', 0)
  riskCounts.set('medium', 0)
  riskCounts.set('high', 0)
  riskCounts.set('very-high', 0)

  for (const fn of allFunctions) {
    riskCounts.set(fn.riskLevel, (riskCounts.get(fn.riskLevel) ?? 0) + 1)
  }

  const byRiskLevel = Array.from(riskCounts.entries()).map(([level, count]) => ({
    count,
    level,
  }))

  // Per-file summary
  const byFile = fileResults
    .map((f) => ({
      complexity: f.totalComplexity,
      file: f.relativePath,
      functions: f.functions.length,
    }))
    .sort((a, b) => b.complexity - a.complexity)

  return {
    averageComplexity,
    byFile,
    byRiskLevel,
    files: fileResults,
    functions: allFunctions,
    totalComplexity,
    totalFunctions,
  }
}

// ─── Filtering ──────────────────────────────────────────

/**
 * Filters functions to only those with complexity at or above the threshold.
 *
 * @param functions - Array of FunctionInfo to filter
 * @param threshold - Minimum complexity to include
 * @returns Filtered array
 *
 * @example
 * filterByThreshold(functions, 5)  // only complexity >= 5
 */
export function filterByThreshold<T extends { cyclomatic?: number; complexity?: number }>(
  functions: T[],
  threshold: number,
): T[] {
  if (threshold <= 0) return functions
  return functions.filter((fn) => (fn.cyclomatic ?? fn.complexity ?? 0) >= threshold)
}

/**
 * Returns only the top N most complex functions.
 *
 * @param functions - Array of FunctionInfo (should be pre-sorted by complexity desc)
 * @param n - Maximum number of functions to return
 * @returns Top N functions
 *
 * @example
 * takeTop(functions, 10)  // top 10 most complex
 */
export function takeTop(functions: FunctionInfo[], n: number): FunctionInfo[] {
  return functions.slice(0, n)
}

// ─── Complexity Output Functions ───────────────────────

export function buildIgnorePatterns(
  defaults: string[],
  userIgnore: string[] | undefined,
): string[] {
  if (!userIgnore || userIgnore.length === 0) return defaults
  return [...defaults, ...userIgnore]
}

export function parseExtensions(input: string): string[] | null {
  if (input.length === 0) return null
  return input
    .split(',')
    .map((ext) => ext.trim())
    .filter((ext) => ext.length > 0)
}

export function filterFilesByExtension<T extends { path: string }>(
  files: T[],
  extensions: string[] | null,
): T[] {
  if (!extensions) return files
  if (extensions.length === 0) return []
  const lowerExts = extensions.map((e) => e.toLowerCase())
  return files.filter((f) => {
    const basename = f.path.split('/').pop() ?? f.path
    if (basename.startsWith('.') && !basename.slice(1).includes('.')) return false
    const ext = basename.match(/\.[^.]+$/)?.[0]?.toLowerCase() ?? ''
    return lowerExts.includes(ext)
  })
}

export function sortByField(
  results: FunctionComplexity[],
  field: string,
): FunctionComplexity[] {
  const sorted = [...results]
  switch (field) {
    case 'complexity':
      sorted.sort((a, b) => b.cyclomatic - a.cyclomatic)
      break
    case 'file':
      sorted.sort((a, b) => a.filePath.localeCompare(b.filePath))
      break
    case 'name':
    default:
      sorted.sort((a, b) => a.functionName.localeCompare(b.functionName))
      break
  }
  return sorted
}

export function getCategoryColor(
  _category: ComplexityCategory | string,
): (text: string) => string {
  return (text: string) => text
}

export function limitResults<T>(items: T[], limit: number): T[] {
  if (limit === 0) return []
  return items.slice(0, limit)
}

export function buildJsonOutput(
  data: FunctionComplexity[],
  summaryOverride?: {
    totalFunctions: number
    averageCyclomatic: number
    averageCognitive: number
    maxCyclomatic: number
    maxCognitive: number
    categoryBreakdown: { low: number; moderate: number; high: number; extreme: number }
  },
): string {
  const summary = summaryOverride ?? {
    totalFunctions: data.length,
    averageCyclomatic: data.length > 0
      ? data.reduce((sum, f) => sum + f.cyclomatic, 0) / data.length
      : 0,
    averageCognitive: data.length > 0
      ? data.reduce((sum, f) => sum + f.cognitive, 0) / data.length
      : 0,
    maxCyclomatic: data.length > 0 ? Math.max(...data.map((f) => f.cyclomatic)) : 0,
    maxCognitive: data.length > 0 ? Math.max(...data.map((f) => f.cognitive)) : 0,
    categoryBreakdown: {
      low: data.filter((f) => f.category === 'low').length,
      moderate: data.filter((f) => f.category === 'moderate').length,
      high: data.filter((f) => f.category === 'high').length,
      extreme: data.filter((f) => f.category === 'extreme').length,
    },
  }
  return JSON.stringify({ functions: data, summary }, null, 2)
}

export function formatMarkdown(data: FunctionComplexity[]): string {
  const lines: string[] = []
  lines.push('# Complexity Analysis')
  lines.push('')

  if (data.length > 0) {
    lines.push('| Function | Cyclomatic | Cognitive | Category | File |')
    lines.push('|--------|------------|-----------|----------|------|')
    for (const f of data) {
      lines.push(
        `| ${f.functionName} | ${f.cyclomatic} | ${f.cognitive} | ${f.category} | ${f.filePath} |`,
      )
    }
    lines.push('')
  }

  const totalFunctions = data.length
  const avgCyc = data.length > 0 ? data.reduce((s, f) => s + f.cyclomatic, 0) / data.length : 0
  const avgCog = data.length > 0 ? data.reduce((s, f) => s + f.cognitive, 0) / data.length : 0
  const maxCyc = data.length > 0 ? Math.max(...data.map((f) => f.cyclomatic)) : 0
  const maxCog = data.length > 0 ? Math.max(...data.map((f) => f.cognitive)) : 0

  lines.push('## Summary')
  lines.push(`**Total functions**: ${totalFunctions}`)
  lines.push(`**Average cyclomatic complexity**: ${avgCyc.toFixed(1)}`)
  lines.push(`**Average cognitive complexity**: ${avgCog.toFixed(1)}`)
  lines.push(`**Maximum cyclomatic complexity**: ${maxCyc}`)
  lines.push(`**Maximum cognitive complexity**: ${maxCog}`)
  lines.push('')

  lines.push('## Category Breakdown')
  lines.push(`**Low**: ${data.filter((f) => f.category === 'low').length}`)
  lines.push(`**Moderate**: ${data.filter((f) => f.category === 'moderate').length}`)
  lines.push(`**High**: ${data.filter((f) => f.category === 'high').length}`)
  lines.push(`**Extreme**: ${data.filter((f) => f.category === 'extreme').length}`)
  lines.push('')

  return lines.join('\n')
}

export function formatTable(data: FunctionComplexity[]): string {
  if (data.length === 0) return 'No functions found with complexity above threshold.'

  const sep = '─'.repeat(80)
  const lines: string[] = []
  lines.push('Complexity Analysis')
  lines.push('')
  lines.push('  Function                         File:Line             Cyclomatic  Cognitive  Category')
  lines.push(sep)

  for (const f of data) {
    const name = f.functionName.length > 28
      ? f.functionName.slice(0, 28)
      : f.functionName
    const category = f.category.toUpperCase()
    lines.push(
      `  ${name.padEnd(30)} ${f.filePath}:${f.startLine}  ${String(f.cyclomatic).padStart(11)}  ${String(f.cognitive).padStart(9)}  ${category}`,
    )
  }

  lines.push(sep)
  lines.push('')
  lines.push('Summary:')
  lines.push(`  Total functions: ${data.length}`)
  const avgCyc = data.reduce((s, f) => s + f.cyclomatic, 0) / data.length
  const avgCog = data.reduce((s, f) => s + f.cognitive, 0) / data.length
  const maxCyc = Math.max(...data.map((f) => f.cyclomatic))
  const maxCog = Math.max(...data.map((f) => f.cognitive))
  lines.push(`  Average cyclomatic complexity: ${avgCyc.toFixed(1)}`)
  lines.push(`  Average cognitive complexity: ${avgCog.toFixed(1)}`)
  lines.push(`  Maximum cyclomatic complexity: ${maxCyc}`)
  lines.push(`  Maximum cognitive complexity: ${maxCog}`)

  lines.push('')
  lines.push('Category breakdown:')
  lines.push(`  Low: ${data.filter((f) => f.category === 'low').length}`)
  lines.push(`  Moderate: ${data.filter((f) => f.category === 'moderate').length}`)
  lines.push(`  High: ${data.filter((f) => f.category === 'high').length}`)
  lines.push(`  Extreme: ${data.filter((f) => f.category === 'extreme').length}`)

  return lines.join('\n')
}

export function formatOutput(
  data: FunctionComplexity[],
  format: string,
): string {
  if (format === 'markdown') return formatMarkdown(data)
  return formatTable(data)
}
