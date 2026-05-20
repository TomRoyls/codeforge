// ─── Types ────────────────────────────────────────────────────────────────────

export interface Audit {
  id: string
  title: string
  description: string
  score: number
  severity: 'critical' | 'info' | 'warning'
  files: string[]
  details: string
  suggestion: string
}

export interface LighthouseCategory {
  name: string
  score: number
  weight: number
  audits: Audit[]
}

export type DangerZoneType = 'current' | 'fog' | 'reef' | 'shallows' | 'storm'

export interface DangerZone {
  file: string
  line: number
  type: DangerZoneType
  severity: 'critical' | 'info' | 'warning'
  message: string
  fix: string
}

export interface SafeHarbor {
  pattern: string
  description: string
  files: string[]
}

export interface LighthouseStats {
  overallScore: number
  categoryScores: Record<string, number>
  totalAudits: number
  passedAudits: number
  failedAudits: number
  criticalIssues: number
  warnings: number
  dangerZoneCount: number
  safeHarborCount: number
  healthGrade: string
}

export interface LighthouseResult {
  overallScore: number
  categories: LighthouseCategory[]
  dangerZones: DangerZone[]
  safeHarbors: SafeHarbor[]
  stats: LighthouseStats
  recommendations: string[]
}

export interface LighthouseOptions {
  verbose?: boolean
}

// ─── Health Grade ─────────────────────────────────────────────────────────────

/**
 * Compute health grade from score.
 *
 * @example
 * computeHealthGrade(95)
 */
export function computeHealthGrade(score: number): string {
  if (score >= 95) return 'A+'
  if (score >= 90) return 'A'
  if (score >= 85) return 'A-'
  if (score >= 80) return 'B+'
  if (score >= 75) return 'B'
  if (score >= 70) return 'B-'
  if (score >= 65) return 'C+'
  if (score >= 60) return 'C'
  if (score >= 55) return 'C-'
  if (score >= 50) return 'D'
  if (score >= 40) return 'E'
  return 'F'
}

// ─── Overall Score ────────────────────────────────────────────────────────────

/**
 * Compute weighted overall score from categories.
 *
 * @example
 * computeOverallScore(categories)
 */
export function computeOverallScore(categories: LighthouseCategory[]): number {
  if (categories.length === 0) return 100

  let totalWeight = 0
  let weightedSum = 0

  for (const cat of categories) {
    totalWeight += cat.weight
    weightedSum += cat.score * cat.weight
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 100
}

// ─── Safety Audits ────────────────────────────────────────────────────────────

/**
 * Run safety audits on files.
 *
 * @example
 * runSafetyAudits(files, contents)
 */
export function runSafetyAudits(files: string[], contents: string[]): Audit[] {
  const audits: Audit[] = []

  const emptyCatchFiles: string[] = []
  const unhandledPromiseFiles: string[] = []
  const nullCheckFiles: string[] = []
  const typeAssertionFiles: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''

    if (/catch\s*\(\s*\w+\s*\)\s*\{\s*\}/.test(content)) {
      emptyCatchFiles.push(file)
    }

    if (/\bawait\b/.test(content) && !/\btry\s*\{/.test(content) && !/\.catch\s*\(/.test(content)) {
      unhandledPromiseFiles.push(file)
    }

    const lines = content.split('\n')
    for (const line of lines) {
      const dotAccess = line.match(/\w+\.\w+/g)
      if (dotAccess && !line.includes('?.') && !line.includes('null') && !line.includes('undefined') && !line.includes('if') && !line.includes('const') && !line.includes('import') && !line.includes('export') && !line.includes('//') && !line.includes('return ')) {
        if (!nullCheckFiles.includes(file)) nullCheckFiles.push(file)
        break
      }
    }

    if (/as\s+(?:any|string|number|boolean)\b/.test(content) && !/typeof\s+\w+/.test(content.split(/as\s+(?:any|string|number|boolean)/)[0] ?? '')) {
      typeAssertionFiles.push(file)
    }
  }

  audits.push({
    id: 'safety-empty-catch',
    title: 'No empty catch blocks',
    description: 'Empty catch blocks swallow errors silently',
    score: emptyCatchFiles.length === 0 ? 1 : 0,
    severity: 'critical',
    files: emptyCatchFiles,
    details: emptyCatchFiles.length > 0 ? `Found in ${emptyCatchFiles.length} file(s)` : 'No empty catch blocks found',
    suggestion: 'Add error handling or logging in catch blocks',
  })

  audits.push({
    id: 'safety-unhandled-promises',
    title: 'No unhandled promise rejections',
    description: 'Async operations should be wrapped in try/catch or have .catch()',
    score: unhandledPromiseFiles.length === 0 ? 1 : 0,
    severity: 'critical',
    files: unhandledPromiseFiles,
    details: unhandledPromiseFiles.length > 0 ? `Found in ${unhandledPromiseFiles.length} file(s)` : 'All promises properly handled',
    suggestion: 'Wrap async operations in try/catch or add .catch() handlers',
  })

  audits.push({
    id: 'safety-null-checks',
    title: 'No missing null/undefined checks',
    description: 'Property access without null safety can cause runtime errors',
    score: nullCheckFiles.length === 0 ? 1 : 0,
    severity: 'warning',
    files: nullCheckFiles,
    details: nullCheckFiles.length > 0 ? `Potential unsafe access in ${nullCheckFiles.length} file(s)` : 'All access is null-safe',
    suggestion: 'Use optional chaining (?.) or explicit null checks',
  })

  audits.push({
    id: 'safety-type-assertions',
    title: 'No unsafe type assertions',
    description: 'Type assertions without runtime validation bypass type safety',
    score: typeAssertionFiles.length === 0 ? 1 : 0,
    severity: 'warning',
    files: typeAssertionFiles,
    details: typeAssertionFiles.length > 0 ? `Unsafe assertions in ${typeAssertionFiles.length} file(s)` : 'No unsafe type assertions',
    suggestion: 'Add runtime type validation before assertions',
  })

  return audits
}

// ─── Maintainability Audits ───────────────────────────────────────────────────

/**
 * Run maintainability audits on files.
 *
 * @example
 * runMaintainabilityAudits(files, contents)
 */
export function runMaintainabilityAudits(files: string[], contents: string[]): Audit[] {
  const audits: Audit[] = []

  const longFunctionFiles: string[] = []
  const largeFiles: string[] = []
  const deepNestingFiles: string[] = []
  const magicNumberFiles: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const lines = content.split('\n')

    if (lines.length > 500) largeFiles.push(file)

    let inFunction = false
    let functionLines = 0
    let functionBraceDepth = 0
    for (const line of lines) {
      const opens = (line.match(/\{/g) ?? []).length
      const closes = (line.match(/\}/g) ?? []).length

      if (/\bfunction\b|\b=>\s*\{|async\s+\w+\s*\(/.test(line) && !inFunction) {
        inFunction = true
        functionLines = 0
        functionBraceDepth = 0
      }

      if (inFunction) {
        functionLines++
        functionBraceDepth += opens - closes
        if (functionBraceDepth <= 0 && functionLines > 0) {
          if (functionLines > 50 && !longFunctionFiles.includes(file)) longFunctionFiles.push(file)
          inFunction = false
        }
      }
    }

    let maxDepth = 0
    let currentDepth = 0
    for (const line of lines) {
      const indent = line.match(/^(\s*)/)?.[1]?.length ?? 0
      if (indent > 0) {
        currentDepth = Math.floor(indent / 2)
        maxDepth = Math.max(maxDepth, currentDepth)
      }
    }
    if (maxDepth > 4) deepNestingFiles.push(file)

    const magicMatch = content.match(/(?:^|[^\w.])(?:(?:3[0-9]{2,})|(?:[4-9]\d+)|(?:1\d{2,}))(?:[^\d.]|$)/g)
    if (magicMatch && magicMatch.length > 0) magicNumberFiles.push(file)
  }

  audits.push({
    id: 'maint-long-functions',
    title: 'No functions over 50 lines',
    description: 'Long functions are harder to understand and test',
    score: longFunctionFiles.length === 0 ? 1 : 0,
    severity: 'warning',
    files: longFunctionFiles,
    details: longFunctionFiles.length > 0 ? `Long functions in ${longFunctionFiles.length} file(s)` : 'All functions are concise',
    suggestion: 'Break long functions into smaller, focused functions',
  })

  audits.push({
    id: 'maint-large-files',
    title: 'No files over 500 lines',
    description: 'Large files are difficult to navigate and maintain',
    score: largeFiles.length === 0 ? 1 : 0,
    severity: 'warning',
    files: largeFiles,
    details: largeFiles.length > 0 ? `${largeFiles.length} file(s) exceed 500 lines` : 'All files are reasonably sized',
    suggestion: 'Split large files into focused modules',
  })

  audits.push({
    id: 'maint-deep-nesting',
    title: 'No deep nesting (> 4 levels)',
    description: 'Deeply nested code increases cognitive complexity',
    score: deepNestingFiles.length === 0 ? 1 : 0,
    severity: 'info',
    files: deepNestingFiles,
    details: deepNestingFiles.length > 0 ? `Deep nesting in ${deepNestingFiles.length} file(s)` : 'Nesting is under control',
    suggestion: 'Extract nested logic into separate functions',
  })

  audits.push({
    id: 'maint-magic-numbers',
    title: 'No magic numbers',
    description: 'Unexplained numeric literals reduce readability',
    score: magicNumberFiles.length === 0 ? 1 : 0,
    severity: 'info',
    files: magicNumberFiles,
    details: magicNumberFiles.length > 0 ? `Magic numbers in ${magicNumberFiles.length} file(s)` : 'No magic numbers detected',
    suggestion: 'Extract numeric literals into named constants',
  })

  return audits
}

// ─── Performance Audits ───────────────────────────────────────────────────────

/**
 * Run performance audits on files.
 *
 * @example
 * runPerformanceAudits(files, contents)
 */
export function runPerformanceAudits(files: string[], contents: string[]): Audit[] {
  const audits: Audit[] = []

  const syncInAsyncFiles: string[] = []
  const reexportFiles: string[] = []
  const longChainFiles: string[] = []
  const redundantFiles: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''

    if (/async\s/.test(content) && /readFileSync|writeFileSync|existsSync|readdirSync/.test(content)) {
      syncInAsyncFiles.push(file)
    }

    if (/export\s+\*\s+from/.test(content) || (/export\s*\{[^}]*\}\s*from/.test(content) && /^import\s/m.test(content))) {
      reexportFiles.push(file)
    }

    const importCount = (content.match(/^import\s/gm) ?? []).length
    if (importCount > 20) longChainFiles.push(file)

    const duplicatePattern = /(\b\w+\s*=\s*[^;]+;)\s*\1/
    if (duplicatePattern.test(content)) redundantFiles.push(file)
  }

  audits.push({
    id: 'perf-sync-in-async',
    title: 'No sync operations in async functions',
    description: 'Synchronous calls block the event loop inside async code',
    score: syncInAsyncFiles.length === 0 ? 1 : 0,
    severity: 'warning',
    files: syncInAsyncFiles,
    details: syncInAsyncFiles.length > 0 ? `Sync calls in async context in ${syncInAsyncFiles.length} file(s)` : 'No sync calls in async code',
    suggestion: 'Replace sync operations with async equivalents',
  })

  audits.push({
    id: 'perf-reexports',
    title: 'No unnecessary re-exports',
    description: 'Re-exports add indirection without value',
    score: reexportFiles.length === 0 ? 1 : 0,
    severity: 'info',
    files: reexportFiles,
    details: reexportFiles.length > 0 ? `Re-exports in ${reexportFiles.length} file(s)` : 'No unnecessary re-exports',
    suggestion: 'Import directly from source modules',
  })

  audits.push({
    id: 'perf-long-chains',
    title: 'No large import chains',
    description: 'Files with many imports may have hidden dependency costs',
    score: longChainFiles.length === 0 ? 1 : 0,
    severity: 'info',
    files: longChainFiles,
    details: longChainFiles.length > 0 ? `${longChainFiles.length} file(s) with 20+ imports` : 'Import counts are reasonable',
    suggestion: 'Reduce dependency count by consolidating or removing unused imports',
  })

  audits.push({
    id: 'perf-redundant',
    title: 'No redundant computations',
    description: 'Duplicate expressions waste computation',
    score: redundantFiles.length === 0 ? 1 : 0,
    severity: 'info',
    files: redundantFiles,
    details: redundantFiles.length > 0 ? `Redundant patterns in ${redundantFiles.length} file(s)` : 'No redundant computations detected',
    suggestion: 'Extract repeated computations into variables',
  })

  return audits
}

// ─── Correctness Audits ───────────────────────────────────────────────────────

/**
 * Run correctness audits on files.
 *
 * @example
 * runCorrectnessAudits(files, contents)
 */
export function runCorrectnessAudits(files: string[], contents: string[]): Audit[] {
  const audits: Audit[] = []

  const unusedImportFiles: string[] = []
  const unreachableFiles: string[] = []
  const inconsistentReturnFiles: string[] = []
  const missingReturnTypeFiles: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''

    const importMatches = content.matchAll(/import\s+(?:\{([^}]+)\}|(\w+))\s+from/g)
    for (const match of importMatches) {
      const named = match[1]
      const def = match[2]
      const imports = named ? named.split(',').map((s) => s.trim().split(/\s+as\s+/).pop()!.trim()) : def ? [def] : []
      for (const imp of imports) {
        if (imp && !new RegExp(`\\b${imp}\\b`, 'g').test(content.replace(match[0], ''))) {
          if (!unusedImportFiles.includes(file)) unusedImportFiles.push(file)
        }
      }
    }

    if (/return\s.*\n\s*(?:return|throw|}\s*$)/.test(content)) {
      unreachableFiles.push(file)
    }

    const funcRegex = /function\s+\w+\s*\([^)]*\)\s*\{/g
    let funcMatch: RegExpExecArray | null
    while ((funcMatch = funcRegex.exec(content)) !== null) {
      const afterFunc = content.slice(funcMatch.index + funcMatch[0].length)
      const bodyEnd = findMatchingBrace(afterFunc)
      const body = afterFunc.slice(0, bodyEnd)
      const hasReturn = /\breturn\b/.test(body)
      const hasReturnVal = /\breturn\s+[^\n;]/.test(body)
      if (hasReturn && !hasReturnVal) {
        if (!inconsistentReturnFiles.includes(file)) inconsistentReturnFiles.push(file)
      }
    }

    if (/export\s+(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*(?!:\s*\w)/.test(content)) {
      missingReturnTypeFiles.push(file)
    }
  }

  audits.push({
    id: 'correctness-unused-imports',
    title: 'No unused imports',
    description: 'Unused imports add noise and increase bundle size',
    score: unusedImportFiles.length === 0 ? 1 : 0,
    severity: 'info',
    files: unusedImportFiles,
    details: unusedImportFiles.length > 0 ? `Unused imports in ${unusedImportFiles.length} file(s)` : 'All imports are used',
    suggestion: 'Remove unused imports',
  })

  audits.push({
    id: 'correctness-unreachable',
    title: 'No unreachable code',
    description: 'Code after return statements is never executed',
    score: unreachableFiles.length === 0 ? 1 : 0,
    severity: 'warning',
    files: unreachableFiles,
    details: unreachableFiles.length > 0 ? `Unreachable code in ${unreachableFiles.length} file(s)` : 'No unreachable code',
    suggestion: 'Remove or restructure unreachable code',
  })

  audits.push({
    id: 'correctness-inconsistent-returns',
    title: 'No inconsistent returns',
    description: 'Functions should consistently return values or not',
    score: inconsistentReturnFiles.length === 0 ? 1 : 0,
    severity: 'warning',
    files: inconsistentReturnFiles,
    details: inconsistentReturnFiles.length > 0 ? `Inconsistent returns in ${inconsistentReturnFiles.length} file(s)` : 'All functions return consistently',
    suggestion: 'Ensure all return paths return a value or all return void',
  })

  audits.push({
    id: 'correctness-missing-return-types',
    title: 'No missing return types on exports',
    description: 'Exported functions should have explicit return types',
    score: missingReturnTypeFiles.length === 0 ? 1 : 0,
    severity: 'info',
    files: missingReturnTypeFiles,
    details: missingReturnTypeFiles.length > 0 ? `Missing return types in ${missingReturnTypeFiles.length} file(s)` : 'All exports have return types',
    suggestion: 'Add explicit return type annotations to exported functions',
  })

  return audits
}

/**
 * Find matching brace in code string.
 *
 * @example
 * findMatchingBrace(code)
 */
export function findMatchingBrace(code: string): number {
  let depth = 1
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '{') depth++
    if (code[i] === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return code.length
}

// ─── Style Audits ─────────────────────────────────────────────────────────────

/**
 * Run style audits on files.
 *
 * @example
 * runStyleAudits(files, contents)
 */
export function runStyleAudits(files: string[], contents: string[]): Audit[] {
  const audits: Audit[] = []

  const inconsistentNamingFiles: string[] = []
  const consoleLogFiles: string[] = []
  const commentedCodeFiles: string[] = []
  const unorderedImportFiles: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''

    const hasCamelCase = /\b[a-z]\w*[A-Z]\w*\b/.test(content)
    const hasSnakeCase = /\b[a-z]+_[a-z_]+\b/.test(content)
    if (hasCamelCase && hasSnakeCase) inconsistentNamingFiles.push(file)

    if (/console\.(log|warn|error|info|debug)\(/.test(content)) consoleLogFiles.push(file)

    const commentedCode = content.match(/\/\/\s*(?:const|let|var|function|return|import|export|if|for|while)\s/m)
    if (commentedCode) commentedCodeFiles.push(file)

    const importLines = content.match(/^import\s.+$/gm)
    if (importLines && importLines.length > 2) {
      const sorted = [...importLines].sort()
      for (let j = 0; j < importLines.length; j++) {
        if (importLines[j] !== sorted[j]) {
          if (!unorderedImportFiles.includes(file)) unorderedImportFiles.push(file)
          break
        }
      }
    }
  }

  audits.push({
    id: 'style-naming',
    title: 'Consistent naming convention',
    description: 'Files should use one naming style consistently',
    score: inconsistentNamingFiles.length === 0 ? 1 : 0,
    severity: 'info',
    files: inconsistentNamingFiles,
    details: inconsistentNamingFiles.length > 0 ? `Mixed conventions in ${inconsistentNamingFiles.length} file(s)` : 'Naming is consistent',
    suggestion: 'Pick one naming convention and apply it consistently',
  })

  audits.push({
    id: 'style-console-log',
    title: 'No console.log in production code',
    description: 'Console statements should be removed before production',
    score: consoleLogFiles.length === 0 ? 1 : 0,
    severity: 'warning',
    files: consoleLogFiles,
    details: consoleLogFiles.length > 0 ? `Console calls in ${consoleLogFiles.length} file(s)` : 'No console calls found',
    suggestion: 'Use a proper logging library or remove console calls',
  })

  audits.push({
    id: 'style-commented-code',
    title: 'No commented-out code',
    description: 'Commented code creates confusion and clutter',
    score: commentedCodeFiles.length === 0 ? 1 : 0,
    severity: 'info',
    files: commentedCodeFiles,
    details: commentedCodeFiles.length > 0 ? `Commented code in ${commentedCodeFiles.length} file(s)` : 'No commented-out code',
    suggestion: 'Remove commented code and rely on version control',
  })

  audits.push({
    id: 'style-import-order',
    title: 'Consistent import ordering',
    description: 'Imports should be sorted alphabetically',
    score: unorderedImportFiles.length === 0 ? 1 : 0,
    severity: 'info',
    files: unorderedImportFiles,
    details: unorderedImportFiles.length > 0 ? `Unordered imports in ${unorderedImportFiles.length} file(s)` : 'Imports are ordered',
    suggestion: 'Sort imports alphabetically',
  })

  return audits
}

// ─── Danger Zone Detection ────────────────────────────────────────────────────

/**
 * Detect danger zones in files.
 *
 * @example
 * detectDangerZones(files, contents)
 */
export function detectDangerZones(files: string[], contents: string[]): DangerZone[] {
  const zones: DangerZone[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const lines = content.split('\n')

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx]!

      if (/catch\s*\(\s*\w+\s*\)\s*\{\s*\}/.test(line)) {
        zones.push({ file, line: lineIdx + 1, type: 'storm', severity: 'critical', message: 'Empty catch block swallows errors', fix: 'Add error handling in catch block' })
      }

      if (/as\s+any\b/.test(line)) {
        zones.push({ file, line: lineIdx + 1, type: 'reef', severity: 'warning', message: 'Unsafe type assertion', fix: 'Use proper type narrowing or validation' })
      }

      const oneLetterVar = line.match(/(?:const|let|var)\s+([a-z])\s*[=:]/)
      if (oneLetterVar && !['i', 'j', 'k', 'x', 'y', 'e', '_'].includes(oneLetterVar[1]!)) {
        zones.push({ file, line: lineIdx + 1, type: 'fog', severity: 'info', message: `Single-letter variable '${oneLetterVar[1]}'`, fix: 'Use a descriptive variable name' })
      }

      if (line.match(/^(\s{10,})/) && /\b(if|for|while)\b/.test(line)) {
        zones.push({ file, line: lineIdx + 1, type: 'reef', severity: 'warning', message: 'Deeply nested control flow', fix: 'Extract nested logic into a separate function' })
      }

      if (/\.forEach\s*\(\s*async/.test(line)) {
        zones.push({ file, line: lineIdx + 1, type: 'storm', severity: 'critical', message: 'async forEach does not await properly', fix: 'Use for...of loop with await' })
      }

      if (/TODO|FIXME|HACK|XXX/.test(line)) {
        zones.push({ file, line: lineIdx + 1, type: 'shallows', severity: 'info', message: `Found ${line.match(/TODO|FIXME|HACK|XXX/)?.[0]}`, fix: 'Resolve the TODO/FIXME or convert to tracked issue' })
      }

      if (/console\.(log|warn|error|info|debug)\(/.test(line)) {
        zones.push({ file, line: lineIdx + 1, type: 'shallows', severity: 'info', message: 'Console statement in production code', fix: 'Use a logging library or remove' })
      }
    }

    const importCount = (content.match(/^import\s/gm) ?? []).length
    if (importCount > 15) {
      zones.push({ file, line: 1, type: 'current', severity: 'warning', message: `High import count (${importCount})`, fix: 'Reduce dependencies or consolidate imports' })
    }
  }

  return zones
}

// ─── Safe Harbor Detection ────────────────────────────────────────────────────

/**
 * Find safe harbor patterns in files.
 *
 * @example
 * findSafeHarbors(files, contents)
 */
export function findSafeHarbors(files: string[], contents: string[]): SafeHarbor[] {
  const harbors: SafeHarbor[] = []

  const errorHandlingFiles: string[] = []
  const typeSafeFiles: string[] = []
  const documentedFiles: string[] = []
  const testedFiles: string[] = []
  const strictFiles: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''

    if (/try\s*\{/.test(content) && /catch\s*\(/.test(content) && !/catch\s*\(\s*\w+\s*\)\s*\{\s*\}/.test(content)) {
      errorHandlingFiles.push(file)
    }

    if ((/interface\s+\w+/.test(content) || /type\s+\w+\s*=/.test(content)) && !/as\s+any/.test(content)) {
      typeSafeFiles.push(file)
    }

    if ((content.match(/\/\*\*/g) ?? []).length >= 1) {
      documentedFiles.push(file)
    }

    if (/describe\s*\(|it\s*\(|test\s*\(/.test(content)) {
      testedFiles.push(file)
    }

    if (content.length > 10 && (/strictNullChecks|noImplicitAny|noUncheckedIndexedAccess/.test(content) || (content.includes('!') === false && /as\s/.test(content) === false))) {
      strictFiles.push(file)
    }
  }

  if (errorHandlingFiles.length > 0) {
    harbors.push({ pattern: 'Proper error handling', description: 'Files with try/catch that properly handle errors', files: errorHandlingFiles })
  }

  if (typeSafeFiles.length > 0) {
    harbors.push({ pattern: 'Type-safe code', description: 'Files using TypeScript types without unsafe casts', files: typeSafeFiles })
  }

  if (documentedFiles.length > 0) {
    harbors.push({ pattern: 'Well-documented code', description: 'Files with JSDoc comments', files: documentedFiles })
  }

  if (testedFiles.length > 0) {
    harbors.push({ pattern: 'Test coverage', description: 'Files containing test cases', files: testedFiles })
  }

  if (strictFiles.length > 0) {
    harbors.push({ pattern: 'Strict mode patterns', description: 'Files following strict TypeScript patterns', files: strictFiles })
  }

  return harbors
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate recommendations from analysis results.
 *
 * @example
 * generateRecommendations(categories, dangerZones)
 */
export function generateRecommendations(
  categories: LighthouseCategory[],
  dangerZones: DangerZone[],
): string[] {
  const recs: string[] = []

  const criticals = dangerZones.filter((d) => d.severity === 'critical')
  if (criticals.length > 0) {
    recs.push(`Fix ${criticals.length} critical issue(s) immediately — these are ship-sinking risks`)
  }

  const storms = dangerZones.filter((d) => d.type === 'storm')
  if (storms.length > 0) {
    recs.push(`Address ${storms.length} storm pattern(s) — error-prone code that can cause crashes`)
  }

  const reefs = dangerZones.filter((d) => d.type === 'reef')
  if (reefs.length > 0) {
    recs.push(`Navigate carefully around ${reefs.length} reef(s) — hidden edge cases detected`)
  }

  const weakest = [...categories].sort((a, b) => a.score - b.score)[0]
  if (weakest && weakest.score < 80) {
    recs.push(`Focus on ${weakest.name} — it has the lowest score (${weakest.score}/100)`)
  }

  for (const cat of categories) {
    if (cat.score === 100) {
      recs.push(`${cat.name} is in excellent shape — all audits passing`)
      break
    }
  }

  const failedAudits = categories.flatMap((c) => c.audits).filter((a) => a.score === 0)
  if (failedAudits.length > 3) {
    recs.push(`${failedAudits.length} audits failing — prioritize critical severity issues first`)
  }

  if (recs.length === 0) {
    recs.push('All clear — your codebase is sailing smoothly!')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete lighthouse result.
 *
 * @example
 * buildLighthouseResult(files, contents)
 */
export function buildLighthouseResult(
  files: string[],
  contents: string[],
  _options?: LighthouseOptions,
): LighthouseResult {
  const safetyAudits = runSafetyAudits(files, contents)
  const maintAudits = runMaintainabilityAudits(files, contents)
  const perfAudits = runPerformanceAudits(files, contents)
  const correctAudits = runCorrectnessAudits(files, contents)
  const styleAudits = runStyleAudits(files, contents)

  const categories: LighthouseCategory[] = [
    { name: 'Safety', score: computeCategoryScore(safetyAudits), weight: 30, audits: safetyAudits },
    { name: 'Maintainability', score: computeCategoryScore(maintAudits), weight: 25, audits: maintAudits },
    { name: 'Performance', score: computeCategoryScore(perfAudits), weight: 20, audits: perfAudits },
    { name: 'Correctness', score: computeCategoryScore(correctAudits), weight: 15, audits: correctAudits },
    { name: 'Style', score: computeCategoryScore(styleAudits), weight: 10, audits: styleAudits },
  ]

  const overallScore = computeOverallScore(categories)
  const dangerZones = detectDangerZones(files, contents)
  const safeHarbors = findSafeHarbors(files, contents)
  const recommendations = generateRecommendations(categories, dangerZones)

  const allAudits = categories.flatMap((c) => c.audits)
  const categoryScores: Record<string, number> = {}
  for (const cat of categories) {
    categoryScores[cat.name] = cat.score
  }

  const stats: LighthouseStats = {
    overallScore,
    categoryScores,
    totalAudits: allAudits.length,
    passedAudits: allAudits.filter((a) => a.score === 1).length,
    failedAudits: allAudits.filter((a) => a.score === 0).length,
    criticalIssues: allAudits.filter((a) => a.score === 0 && a.severity === 'critical').length,
    warnings: allAudits.filter((a) => a.score === 0 && a.severity === 'warning').length,
    dangerZoneCount: dangerZones.length,
    safeHarborCount: safeHarbors.length,
    healthGrade: computeHealthGrade(overallScore),
  }

  return { overallScore, categories, dangerZones, safeHarbors, stats, recommendations }
}

/**
 * Compute category score from audits.
 *
 * @example
 * computeCategoryScore(audits)
 */
export function computeCategoryScore(audits: Audit[]): number {
  if (audits.length === 0) return 100
  const passed = audits.filter((a) => a.score === 1).length
  return Math.round((passed / audits.length) * 100)
}
