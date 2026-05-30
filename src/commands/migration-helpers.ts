import { extname } from 'node:path'

// ─── Types ──────────────────────────────────────────────

export type ContentReader = (filePath: string) => Promise<string>

export interface MigrationPattern {
  category: string
  description: string
  id: string
  name: string
  newPattern: string
  oldPattern: RegExp
  severity: string
}

export interface MigrationMatch {
  file: string
  line: number
  oldCode: string
  pattern: string
  suggestedNew: string
}

export interface MigrationProgress {
  category: string
  files: number
  name: string
  pattern: string
  percentage: number
  severity: string
  totalOccurrences: number
}

export interface MigrationResult {
  matches: MigrationMatch[]
  overallProgress: number
  patterns: MigrationProgress[]
  stats: MigrationStats
}

export interface MigrationStats {
  byCategory: Record<string, number>
  completedMigrations: number
  inProgressMigrations: number
  notStartedMigrations: number
  totalMigrations: number
  totalPatterns: number
}

export interface MigrationOptions {
  contentReader: ContentReader
  ignorePatterns?: string[]
  verbose?: boolean
}

// ─── Migration Patterns ─────────────────────────────────

/**
 * @example
 * const patterns = getMigrationPatterns()
 * console.log(patterns.length) // 12
 */
export function getMigrationPatterns(): MigrationPattern[] {
  return [
    {
      category: 'syntax',
      description: 'CommonJS require() calls should be replaced with ES module imports',
      id: 'CJS_REQUIRE',
      name: 'CJS to ESM (require)',
      newPattern: "import ... from '...'",
      oldPattern: /\brequire\s*\(\s*['"][^'"]*['"]\s*\)/g,
      severity: 'high',
    },
    {
      category: 'syntax',
      description: 'module.exports should be replaced with ES module exports',
      id: 'CJS_MODULE_EXPORTS',
      name: 'CJS to ESM (module.exports)',
      newPattern: 'export default',
      oldPattern: /\bmodule\.exports\s*=/g,
      severity: 'high',
    },
    {
      category: 'pattern',
      description: 'Callback-style error handling should use async/await',
      id: 'CALLBACK_STYLE',
      name: 'Callbacks to Async/Await',
      newPattern: 'async/await with try/catch',
      oldPattern: /\bfunction\s*\(\s*err\s*,\s*\w+\s*\)/g,
      severity: 'high',
    },
    {
      category: 'syntax',
      description: 'var declarations should be replaced with let or const',
      id: 'VAR_DECLARATION',
      name: 'var to let/const',
      newPattern: 'let or const',
      oldPattern: /\bvar\s+\w/g,
      severity: 'medium',
    },
    {
      category: 'pattern',
      description: 'Traditional for loops can use for...of or .forEach',
      id: 'FOR_LOOP',
      name: 'For Loop to for...of',
      newPattern: 'for...of or .forEach',
      oldPattern: /\bfor\s*\(\s*var\s+\w+\s*=\s*\d+\s*;\s*\w+\s*<\s*\w+\.length\s*;\s*\w+\+\+\s*\)/g,
      severity: 'low',
    },
    {
      category: 'syntax',
      description: 'Array.concat() can use spread syntax',
      id: 'ARRAY_CONCAT',
      name: 'Array.concat to Spread',
      newPattern: '[...arr1, ...arr2]',
      oldPattern: /\.concat\s*\(/g,
      severity: 'low',
    },
    {
      category: 'syntax',
      description: 'Object.assign() can use spread syntax',
      id: 'OBJECT_ASSIGN',
      name: 'Object.assign to Spread',
      newPattern: '{ ...a, ...b }',
      oldPattern: /\bObject\.assign\s*\(\s*\{\s*\}/g,
      severity: 'medium',
    },
    {
      category: 'pattern',
      description: 'Constructor functions should use ES6 classes',
      id: 'FUNCTION_PROTO',
      name: 'Function to Class',
      newPattern: 'class Foo',
      oldPattern: /\bfunction\s+\b[A-Z]\w*\s*\([^)]*\)\s*\{/g,
      severity: 'medium',
    },
    {
      category: 'pattern',
      description: 'Promise .then() chains should use async/await',
      id: 'PROMISE_CHAIN',
      name: 'Promise Chain to Async/Await',
      newPattern: 'async/await',
      oldPattern: /\.then\s*\(/g,
      severity: 'high',
    },
    {
      category: 'syntax',
      description: 'String concatenation should use template literals',
      id: 'STRING_CONCAT',
      name: 'String Concat to Template Literal',
      newPattern: '`hello ${name}`',
      oldPattern: /['"][^'"]*['"]\s*\+\s*\w/g,
      severity: 'low',
    },
    {
      category: 'syntax',
      description: '.indexOf() checks should use .includes()',
      id: 'INDEXOF',
      name: 'indexOf to includes',
      newPattern: '.includes(x)',
      oldPattern: /\.indexOf\s*\([^)]*\)\s*[!=]==?\s*-?\s*1/g,
      severity: 'medium',
    },
    {
      category: 'style',
      description: 'Verbose null checks can use optional chaining',
      id: 'NULL_CHECK',
      name: 'Verbose Null Check',
      newPattern: 'x != null or optional chaining',
      oldPattern: /\w+\s*!==?\s*null\s*&&\s*\w+\s*!==?\s*undefined/g,
      severity: 'low',
    },
  ]
}

// ─── Core Functions ─────────────────────────────────────

/**
 * @example
 * const matches = scanForPattern('const x = require("fs")', 'app.ts', patterns[0])
 * console.log(matches.length) // 1
 */
export function scanForPattern(
  content: string,
  filePath: string,
  pattern: MigrationPattern,
): MigrationMatch[] {
  const matches: MigrationMatch[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue

    const regex = new RegExp(pattern.oldPattern.source, pattern.oldPattern.flags)
    let match: RegExpExecArray | null

    while ((match = regex.exec(line)) !== null) {
      matches.push({
        file: filePath,
        line: i + 1,
        oldCode: match[0],
        pattern: pattern.id,
        suggestedNew: pattern.newPattern,
      })
    }
  }

  return matches
}

/**
 * @example
 * const progress = computeMigrationProgress(matches, pattern)
 * console.log(progress.percentage) // 100
 */
export function computeMigrationProgress(
  matches: MigrationMatch[],
  pattern: MigrationPattern,
): MigrationProgress {
  const patternMatches = matches.filter((m) => m.pattern === pattern.id)
  const uniqueFiles = new Set(patternMatches.map((m) => m.file))

  const percentage = patternMatches.length === 0 ? 100 : 0

  return {
    category: pattern.category,
    files: uniqueFiles.size,
    name: pattern.name,
    pattern: pattern.id,
    percentage,
    severity: pattern.severity,
    totalOccurrences: patternMatches.length,
  }
}

/**
 * @example
 * const progress = computeOverallProgress(progressList)
 * console.log(progress) // 75
 */
export function computeOverallProgress(patterns: MigrationProgress[]): number {
  if (patterns.length === 0) return 100

  const severityWeights: Record<string, number> = {
    high: 3,
    low: 1,
    medium: 2,
  }

  let totalWeight = 0
  let weightedSum = 0

  for (const p of patterns) {
    const weight = severityWeights[p.severity] ?? 1
    totalWeight += weight
    weightedSum += p.percentage * weight
  }

  return totalWeight === 0 ? 100 : Math.round(weightedSum / totalWeight)
}

/**
 * @example
 * const stats = computeMigrationStats(progressList)
 * console.log(stats.completedMigrations) // 5
 */
export function computeMigrationStats(patterns: MigrationProgress[]): MigrationStats {
  let completedMigrations = 0
  let inProgressMigrations = 0
  let notStartedMigrations = 0
  const byCategory: Record<string, number> = {}

  for (const p of patterns) {
    if (p.percentage >= 100) {
      completedMigrations++
    } else if (p.percentage > 0) {
      inProgressMigrations++
    } else {
      notStartedMigrations++
    }

    byCategory[p.category] = (byCategory[p.category] ?? 0) + p.totalOccurrences
  }

  return {
    byCategory,
    completedMigrations,
    inProgressMigrations,
    notStartedMigrations,
    totalMigrations: patterns.length,
    totalPatterns: patterns.length,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/**
 * @example
 * const result = await buildMigrationResult(files, reader, {})
 * console.log(result.overallProgress) // 50
 */
export async function buildMigrationResult(
  files: string[],
  contentReader: ContentReader,
  options?: Omit<MigrationOptions, 'contentReader'>,
): Promise<MigrationResult> {
  const patterns = getMigrationPatterns()
  const allMatches: MigrationMatch[] = []

  for (const file of files) {
    const ext = extname(file).toLowerCase()
    const scannable = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']
    if (!scannable.includes(ext)) continue

    let content: string
    try {
      content = await contentReader(file)
    } catch {
      continue
    }

    for (const pattern of patterns) {
      const matches = scanForPattern(content, file, pattern)
      allMatches.push(...matches)
    }
  }

  const progressList = patterns.map((p) => computeMigrationProgress(allMatches, p))
  const overallProgress = computeOverallProgress(progressList)
  const stats = computeMigrationStats(progressList)

  return {
    matches: options?.verbose ? allMatches : allMatches.slice(0, 100),
    overallProgress,
    patterns: progressList,
    stats,
  }
}
