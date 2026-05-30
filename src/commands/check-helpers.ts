// ─── Interfaces ──────────────────────────────────────────

export interface CheckResult {
  name: string
  status: 'pass' | 'warn' | 'fail'
  score: number
  message: string
  details: string[]
}

export interface HealthCheckResult {
  checks: CheckResult[]
  overallScore: number
  overallStatus: 'pass' | 'warn' | 'fail'
  passedChecks: number
  failedChecks: number
  warnChecks: number
  summary: string
}

export interface HealthCheckOptions {
  checks: string
  threshold: number
}

interface FileContent {
  filePath: string
  content: string
}

// ─── checkTodos ──────────────────────────────────────────

/**
 * Scan content for TODO/FIXME/HACK comments.
 *
 * @example
 * ```ts
 * const result = checkTodos('// TODO: fix this')
 * // result.score === 80, result.status === 'pass'
 * ```
 */
export function checkTodos(content: string): CheckResult {
  const todoMatches = content.match(/\/\/\s*TODO/gi) ?? []
  const fixmeMatches = content.match(/\/\/\s*FIXME/gi) ?? []
  const hackMatches = content.match(/\/\/\s*HACK/gi) ?? []
  const blockTodoMatches = content.match(/\/\*[\s\S]*?TODO[\s\S]*?\*\//gi) ?? []
  const blockFixmeMatches = content.match(/\/\*[\s\S]*?FIXME[\s\S]*?\*\//gi) ?? []
  const blockHackMatches = content.match(/\/\*[\s\S]*?HACK[\s\S]*?\*\//gi) ?? []

  const todoCount = todoMatches.length + blockTodoMatches.length
  const fixmeCount = fixmeMatches.length + blockFixmeMatches.length
  const hackCount = hackMatches.length + blockHackMatches.length
  const total = todoCount + fixmeCount + hackCount

  let score: number
  let status: 'pass' | 'warn' | 'fail'

  if (total === 0) {
    score = 100
  } else if (total < 10) {
    score = 80
  } else if (total < 25) {
    score = 60
  } else if (total < 50) {
    score = 40
  } else {
    score = 20
  }

  if (total < 10) {
    status = 'pass'
  } else if (total < 25) {
    status = 'warn'
  } else {
    status = 'fail'
  }

  const details: string[] = []
  if (todoCount > 0) details.push(`${todoCount} TODO comments`)
  if (fixmeCount > 0) details.push(`${fixmeCount} FIXME comments`)
  if (hackCount > 0) details.push(`${hackCount} HACK comments`)

  return {
    details,
    message: `Found ${total} TODO/FIXME/HACK comments`,
    name: 'todos',
    score,
    status,
  }
}

// ─── checkComplexity ─────────────────────────────────────

/**
 * Estimate cyclomatic complexity by counting decision points per function.
 *
 * @example
 * ```ts
 * const result = checkComplexity('function simple() { return 1; }', 'test.ts')
 * // result.score === 100, result.status === 'pass'
 * ```
 */
export function checkComplexity(content: string, _filePath: string): CheckResult {
  const lines = content.split('\n')

  // Find function boundaries
  const functionRanges: Array<{ end: number; start: number }> = []
  const funcRegex = /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>|\w+\s*\([^)]*\)\s*\{|=>\s*\{)/g
  let match: RegExpExecArray | null

  while ((match = funcRegex.exec(content)) !== null) {
    const startPos = match.index
    const startLine = content.slice(0, startPos).split('\n').length - 1
    // Simple bracket matching to find end
    let braceCount = 0
    let endLine = startLine
    let foundOpen = false

    for (let i = startLine; i < lines.length; i++) {
      for (const char of lines[i]!) {
        if (char === '{') {
          braceCount++
          foundOpen = true
        } else if (char === '}') {
          braceCount--
        }
      }
      if (foundOpen && braceCount <= 0) {
        endLine = i
        break
      }
    }

    functionRanges.push({ end: endLine, start: startLine })
  }

  if (functionRanges.length === 0) {
    return {
      details: ['No functions found'],
      message: 'No functions to analyze',
      name: 'complexity',
      score: 100,
      status: 'pass',
    }
  }

  // Count decision points per function
  const decisionRegex = /(?:if|else|for|while|case|catch|&&|\|\||\?)/g
  const complexities: number[] = []

  for (const range of functionRanges) {
    const funcContent = lines.slice(range.start, range.end + 1).join('\n')
    const decisions = funcContent.match(decisionRegex)
    complexities.push(decisions ? decisions.length : 0)
  }

  const avgComplexity = complexities.reduce((sum, c) => sum + c, 0) / complexities.length

  let score: number
  let status: 'pass' | 'warn' | 'fail'

  if (avgComplexity < 5) {
    score = 100
  } else if (avgComplexity < 10) {
    score = 80
  } else if (avgComplexity < 15) {
    score = 60
  } else if (avgComplexity < 20) {
    score = 40
  } else {
    score = 20
  }

  if (avgComplexity < 10) {
    status = 'pass'
  } else if (avgComplexity < 15) {
    status = 'warn'
  } else {
    status = 'fail'
  }

  const maxComplexity = Math.max(...complexities)

  return {
    details: [
      `Average complexity: ${avgComplexity.toFixed(1)}`,
      `Max complexity: ${maxComplexity}`,
      `Functions analyzed: ${functionRanges.length}`,
    ],
    message: `Average cyclomatic complexity: ${avgComplexity.toFixed(1)}`,
    name: 'complexity',
    score,
    status,
  }
}

// ─── checkDocCoverage ────────────────────────────────────

/**
 * Check JSDoc coverage for exported items.
 *
 * @example
 * ```ts
 * const result = checkDocCoverage('/** doc *\/ export function foo() {}', 'test.ts')
 * // result.score === 100, result.status === 'pass'
 * ```
 */
export function checkDocCoverage(content: string, _filePath: string): CheckResult {
  const lines = content.split('\n')

  // Find exported items
  const exportRegex = /^\s*export\s+(?:function|class|interface|type|const|let|var|enum)\s+(\w+)/
  const exportedItems: Array<{ documented: boolean; line: number; name: string }> = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const match = line.match(exportRegex)
    if (match) {
      const name = match[1] ?? ''
      let documented = false

      // Check if there's a JSDoc comment above this line
      if (i > 0) {
        const prevLine = lines[i - 1]!.trim()
        if (prevLine === '*/') {
          documented = true
        } else if (prevLine.startsWith('/**') && prevLine.endsWith('*/')) {
          documented = true
        } else if (prevLine.startsWith('*') && prevLine.endsWith('*/')) {
          documented = true
        }
      }

      // Also check if the line itself has an inline JSDoc
      if (i >= 2) {
        const lineBeforePrev = lines[i - 2]!.trim()
        if (lineBeforePrev.startsWith('/**')) {
          documented = true
        }
      }

      // Check further back for multi-line JSDoc
      if (!documented && i >= 1) {
        let j = i - 1
        if (lines[j]!.trim() === '*/') {
          j--
          while (j >= 0 && lines[j]!.trim().startsWith('*')) {
            if (lines[j]!.trim().startsWith('/**')) {
              documented = true
              break
            }
            j--
          }
        }
      }

      exportedItems.push({ documented, line: i, name })
    }
  }

  if (exportedItems.length === 0) {
    return {
      details: ['No exported items found'],
      message: 'No exported items to document',
      name: 'doc-coverage',
      score: 100,
      status: 'pass',
    }
  }

  const documentedCount = exportedItems.filter((item) => item.documented).length
  const percentage = (documentedCount / exportedItems.length) * 100
  const score = Math.round(percentage)

  let status: 'pass' | 'warn' | 'fail'
  if (percentage > 80) {
    status = 'pass'
  } else if (percentage > 50) {
    status = 'warn'
  } else {
    status = 'fail'
  }

  const undocumented = exportedItems.filter((item) => !item.documented)

  return {
    details: [
      `${documentedCount}/${exportedItems.length} exported items documented (${percentage.toFixed(1)}%)`,
      ...(undocumented.length > 0 ? [`${undocumented.length} undocumented: ${undocumented.slice(0, 5).map((u) => u.name).join(', ')}${undocumented.length > 5 ? '...' : ''}`] : []),
    ],
    message: `JSDoc coverage: ${percentage.toFixed(1)}% (${documentedCount}/${exportedItems.length})`,
    name: 'doc-coverage',
    score,
    status,
  }
}

// ─── checkDuplicates ─────────────────────────────────────

/**
 * Estimate duplicate lines using hash-based comparison.
 *
 * @example
 * ```ts
 * const result = checkDuplicates(['const x = 1;', 'const x = 1;', 'const y = 2;'])
 * // result.details includes duplication rate
 * ```
 */
export function checkDuplicates(lines: string[]): CheckResult {
  const nonTrivialLines: string[] = []

  for (const line of lines) {
    const normalized = line.trim().replace(/\s+/g, ' ')
    // Skip empty, comment-only, and short lines
    if (normalized.length < 10) continue
    if (normalized.startsWith('//')) continue
    if (normalized.startsWith('/*')) continue
    if (normalized.startsWith('*')) continue
    if (normalized.startsWith('<!--')) continue
    if (normalized.startsWith('#')) continue
    nonTrivialLines.push(normalized)
  }

  if (nonTrivialLines.length === 0) {
    return {
      details: ['No non-trivial lines to analyze'],
      message: 'No content to check for duplicates',
      name: 'dupes',
      score: 100,
      status: 'pass',
    }
  }

  const lineCounts = new Map<string, number>()
  for (const line of nonTrivialLines) {
    lineCounts.set(line, (lineCounts.get(line) ?? 0) + 1)
  }

  let duplicateLines = 0
  for (const count of lineCounts.values()) {
    if (count > 1) {
      duplicateLines += count
    }
  }

  const duplicationRate = (duplicateLines / nonTrivialLines.length) * 100

  let score: number
  let status: 'pass' | 'warn' | 'fail'

  if (duplicationRate < 3) {
    score = 100
  } else if (duplicationRate < 5) {
    score = 80
  } else if (duplicationRate < 10) {
    score = 60
  } else if (duplicationRate < 20) {
    score = 40
  } else {
    score = 20
  }

  if (duplicationRate < 5) {
    status = 'pass'
  } else if (duplicationRate < 10) {
    status = 'warn'
  } else {
    status = 'fail'
  }

  // Find top duplicated lines
  const sortedEntries = Array.from(lineCounts.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])

  const details: string[] = [
    `Duplication rate: ${duplicationRate.toFixed(1)}% (${duplicateLines}/${nonTrivialLines.length} lines)`,
  ]

  for (const [line, count] of sortedEntries.slice(0, 3)) {
    const truncated = line.length > 50 ? line.slice(0, 50) + '...' : line
    details.push(`  "${truncated}" (${count}x)`)
  }

  return {
    details,
    message: `Code duplication: ${duplicationRate.toFixed(1)}%`,
    name: 'dupes',
    score,
    status,
  }
}

// ─── checkUnusedExports ──────────────────────────────────

/**
 * Estimate unused exports by comparing export and import names.
 *
 * @example
 * ```ts
 * const result = checkUnusedExports({ filePath: 'test.ts', content: 'export const foo = 1' })
 * // result.score === 20 (no imports reference foo)
 * ```
 */
export function checkUnusedExports(file: FileContent): CheckResult {
  const { content} = file

  // Collect export names
  const exportNameRegex = /export\s+(?:function|class|const|let|var|interface|type|enum)\s+(\w+)/g
  const exportNames = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = exportNameRegex.exec(content)) !== null) {
    exportNames.add(match[1] ?? '')
  }

  // Collect named import names
  const importNameRegex = /import\s+(?:\{([^}]+)\}|(\w+))/g
  const importNames = new Set<string>()
  while ((match = importNameRegex.exec(content)) !== null) {
    if (match[1]) {
      const names = match[1].split(',').map((n) => n.trim().split(/\s+as\s+/).pop()?.trim()).filter(Boolean)
      for (const name of names) {
        if (name) importNames.add(name)
      }
    }
    if (match[2]) {
      importNames.add(match[2])
    }
  }

  // Also check for dynamic imports and require
  const dynamicImportRegex = /import\s*\(\s*['"][^'"]+['"]\s*\)/g
  const hasDynamicImports = dynamicImportRegex.test(content)

  if (exportNames.size === 0) {
    return {
      details: ['No exports found'],
      message: 'No exports to analyze',
      name: 'unused',
      score: 100,
      status: 'pass',
    }
  }

  // Count unused exports
  const unusedNames: string[] = []
  for (const name of Array.from(exportNames)) {
    if (!importNames.has(name)) {
      unusedNames.push(name)
    }
  }

  // If there are dynamic imports, be more lenient (assume all could be used)
  const effectiveUnused = hasDynamicImports ? 0 : unusedNames.length
  const unusedRate = (effectiveUnused / exportNames.size) * 100

  let score: number
  let status: 'pass' | 'warn' | 'fail'

  if (unusedRate === 0) {
    score = 100
  } else if (unusedRate < 5) {
    score = 80
  } else if (unusedRate < 10) {
    score = 60
  } else if (unusedRate < 20) {
    score = 40
  } else {
    score = 20
  }

  if (unusedRate < 5) {
    status = 'pass'
  } else if (unusedRate < 10) {
    status = 'warn'
  } else {
    status = 'fail'
  }

  return {
    details: [
      `${exportNames.size} exports found, ${effectiveUnused} potentially unused`,
      ...(unusedNames.length > 0 && !hasDynamicImports
        ? [`Unused: ${unusedNames.slice(0, 5).join(', ')}${unusedNames.length > 5 ? '...' : ''}`]
        : []),
    ],
    message: `${unusedRate.toFixed(1)}% potentially unused exports`,
    name: 'unused',
    score,
    status,
  }
}

// ─── runHealthCheck ──────────────────────────────────────

/**
 * Orchestrate all health checks and produce a combined result.
 *
 * @example
 * ```ts
 * const result = await runHealthCheck('./src', { checks: 'all', threshold: 70 })
 * console.log(result.overallScore)
 * ```
 */
export async function runHealthCheck(
  path: string,
  options: HealthCheckOptions,
  discoverFn?: (options: { cwd: string; ignore: string[]; patterns: string[] }) => Promise<Array<{ absolutePath: string; path: string }>>,
  readFileFn?: (path: string) => Promise<string>,
): Promise<HealthCheckResult> {
  const discover = discoverFn ?? (async () => [])
  const readFile = readFileFn ?? (async () => '')

  const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
  const files = await discover({
    cwd: path,
    ignore: defaultIgnore,
    patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  })

  const fileContents: FileContent[] = []
  for (const file of files) {
    try {
      const content = await readFile(file.absolutePath)
      fileContents.push({ content, filePath: file.path })
    } catch {
      // Skip files that can't be read
    }
  }

  if (fileContents.length === 0) {
    return {
      checks: [],
      failedChecks: 0,
      overallScore: 100,
      overallStatus: 'pass',
      passedChecks: 0,
      summary: 'No files found to analyze',
      warnChecks: 0,
    }
  }

  const allContent = fileContents.map((f) => f.content).join('\n')
  const allLines = allContent.split('\n')

  const checksEnabled = options.checks === 'all'
    ? ['todos', 'complexity', 'doc-coverage', 'dupes', 'unused'] as const
    : options.checks.split(',').map((c) => c.trim())

  const checks: CheckResult[] = []

  if (checksEnabled.includes('todos')) {
    checks.push(checkTodos(allContent))
  }

  if (checksEnabled.includes('complexity')) {
    // Run complexity per file and average
    const complexityResults = fileContents.map((f) => checkComplexity(f.content, f.filePath))
    if (complexityResults.length > 0) {
      const avgScore = Math.round(complexityResults.reduce((sum, r) => sum + r.score, 0) / complexityResults.length)
      const worstStatus = complexityResults.some((r) => r.status === 'fail')
        ? 'fail' as const
        : complexityResults.some((r) => r.status === 'warn')
          ? 'warn' as const
          : 'pass' as const
      checks.push({
        details: complexityResults.flatMap((r) => r.details),
        message: `Average complexity score: ${avgScore}/100 across ${complexityResults.length} files`,
        name: 'complexity',
        score: avgScore,
        status: worstStatus,
      })
    }
  }

  if (checksEnabled.includes('doc-coverage')) {
    // Aggregate doc coverage across files
    const docResults = fileContents.map((f) => checkDocCoverage(f.content, f.filePath))
    const totalExported = docResults.reduce((sum, r) => {
      const match = r.message.match(/(\d+)\/(\d+)/)
      return sum + (match ? parseInt(match[2]!, 10) : 0)
    }, 0)
    const totalDocumented = docResults.reduce((sum, r) => {
      const match = r.message.match(/(\d+)\/(\d+)/)
      return sum + (match ? parseInt(match[1] ?? '', 10) : 0)
    }, 0)

    if (totalExported === 0) {
      checks.push({
        details: ['No exported items found'],
        message: 'No exported items to document',
        name: 'doc-coverage',
        score: 100,
        status: 'pass',
      })
    } else {
      const percentage = (totalDocumented / totalExported) * 100
      const score = Math.round(percentage)
      let status: 'pass' | 'warn' | 'fail'
      if (percentage > 80) status = 'pass'
      else if (percentage > 50) status = 'warn'
      else status = 'fail'

      checks.push({
        details: [`JSDoc coverage: ${percentage.toFixed(1)}% (${totalDocumented}/${totalExported})`],
        message: `JSDoc coverage: ${percentage.toFixed(1)}% (${totalDocumented}/${totalExported})`,
        name: 'doc-coverage',
        score,
        status,
      })
    }
  }

  if (checksEnabled.includes('dupes')) {
    checks.push(checkDuplicates(allLines))
  }

  if (checksEnabled.includes('unused')) {
    // Check unused across all files combined
    const allCombined: FileContent = { content: allContent, filePath: 'combined' }
    checks.push(checkUnusedExports(allCombined))
  }

  // Weight each check
  const weights: Record<string, number> = {
    complexity: 0.25,
    'doc-coverage': 0.20,
    dupes: 0.20,
    todos: 0.15,
    unused: 0.20,
  }

  let weightedSum = 0
  let totalWeight = 0
  for (const check of checks) {
    const weight = weights[check.name] ?? 0.2
    weightedSum += check.score * weight
    totalWeight += weight
  }

  const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 100

  const passedChecks = checks.filter((c) => c.status === 'pass').length
  const failedChecks = checks.filter((c) => c.status === 'fail').length
  const warnChecks = checks.filter((c) => c.status === 'warn').length

  let overallStatus: 'pass' | 'warn' | 'fail'
  if (overallScore >= options.threshold) {
    overallStatus = 'pass'
  } else if (overallScore >= options.threshold - 10) {
    overallStatus = 'warn'
  } else {
    overallStatus = 'fail'
  }

  const summary = `Health score: ${overallScore}/100 (${passedChecks} passed, ${warnChecks} warnings, ${failedChecks} failed)`

  return {
    checks,
    failedChecks,
    overallScore,
    overallStatus,
    passedChecks,
    summary,
    warnChecks,
  }
}
