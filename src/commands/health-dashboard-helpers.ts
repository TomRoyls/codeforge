
// ─── Types ──────────────────────────────────────────────

export type ContentReader = (filePath: string) => Promise<string>

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface HealthDimension {
  findings: string[]
  grade: Grade
  name: string
  score: number
  suggestions: string[]
  weight: number
}

export interface HealthAction {
  action: string
  dimension: string
  effort: 'high' | 'low' | 'medium'
  impact: string
  priority: number
}

export interface HealthReport {
  actions: HealthAction[]
  concerns: string[]
  dimensions: HealthDimension[]
  grade: Grade
  highlights: string[]
  overall: number
}

export interface HealthOptions {
  verbose?: boolean
}

// ─── Grade Helper ───────────────────────────────────────

/**
 * @example
 * scoreToGrade(95) // 'A'
 * scoreToGrade(45) // 'F'
 */
export function scoreToGrade(score: number): Grade {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

// ─── assessTestHealth ───────────────────────────────────

/**
 * @example
 * const dim = assessTestHealth(['app.ts', 'app.test.ts'], { 'app.test.ts': 'test' })
 * console.log(dim.score)
 */
export function assessTestHealth(
  files: string[],
  contents: Record<string, string>,
): HealthDimension {
  const testFiles = files.filter((f) => /\.(test|spec)\.(ts|js|tsx|jsx)$/.test(f))
  const sourceFiles = files.filter(
    (f) => /\.(ts|js|tsx|jsx)$/.test(f) && !/\.(test|spec)\.(ts|js|tsx|jsx)$/.test(f),
  )

  const findings: string[] = []
  const suggestions: string[] = []

  findings.push(`${testFiles.length} test files, ${sourceFiles.length} source files`)

  if (sourceFiles.length === 0) {
    return { findings, grade: 'F', name: 'Tests', score: 0, suggestions: ['Add source files'], weight: 0.20 }
  }

  const ratio = testFiles.length / sourceFiles.length
  let score = Math.min(100, Math.round(ratio * 100))

  const hasTests = testFiles.length > 0
  if (!hasTests) {
    score = 10
    suggestions.push('Add test files for your source code')
  }

  const testContent = testFiles.map((f) => contents[f] ?? '').join('\n')
  if (testContent && !testContent.includes('describe') && !testContent.includes('test(')) {
    score = Math.max(score - 20, 0)
    suggestions.push('Use proper test structure (describe/test blocks)')
  }

  if (ratio > 0.5 && ratio < 1.5) {
    findings.push('Good test-to-source ratio')
  } else if (ratio < 0.3) {
    findings.push('Low test coverage')
    suggestions.push('Increase test coverage to at least 50% of source files')
  }

  return { findings, grade: scoreToGrade(score), name: 'Tests', score, suggestions, weight: 0.20 }
}

// ─── assessDependencyHealth ─────────────────────────────

/**
 * @example
 * const dim = assessDependencyHealth({ 'package.json': '{"dependencies":{"lodash":"3.0.0"}}' })
 * console.log(dim.score)
 */
export function assessDependencyHealth(
  contents: Record<string, string>,
): HealthDimension {
  const findings: string[] = []
  const suggestions: string[] = []

  const pkgContent = contents['package.json']
  if (!pkgContent) {
    return { findings: ['No package.json found'], grade: 'F', name: 'Dependencies', score: 0, suggestions: ['Initialize package.json'], weight: 0.15 }
  }

  let pkg: Record<string, unknown>
  try {
    pkg = JSON.parse(pkgContent)
  } catch {
    return { findings: ['Invalid package.json'], grade: 'F', name: 'Dependencies', score: 0, suggestions: ['Fix package.json syntax'], weight: 0.15 }
  }

  let score = 100

  const deps = Object.keys((pkg.dependencies as Record<string, string>) ?? {})
  const devDeps = Object.keys((pkg.devDependencies as Record<string, string>) ?? {})
  const totalDeps = deps.length + devDeps.length

  findings.push(`${totalDeps} dependencies (${deps.length} production, ${devDeps.length} dev)`)

  if (totalDeps > 50) {
    score -= 20
    suggestions.push('Consider reducing dependency count (50+ is high)')
  }

  const deprecated = ['request', 'colors', 'moment', 'lodash', 'underscore']
  const foundDeprecated = [...deps, ...devDeps].filter((d) => deprecated.includes(d))
  if (foundDeprecated.length > 0) {
    score -= foundDeprecated.length * 10
    findings.push(`Deprecated packages found: ${foundDeprecated.join(', ')}`)
    suggestions.push(`Replace deprecated packages: ${foundDeprecated.join(', ')}`)
  }

  if (!contents['package-lock.json'] && !contents['yarn.lock'] && !contents['pnpm-lock.yaml']) {
    score -= 15
    findings.push('No lockfile found')
    suggestions.push('Add a lockfile for reproducible builds')
  }

  score = Math.max(0, score)
  return { findings, grade: scoreToGrade(score), name: 'Dependencies', score, suggestions, weight: 0.15 }
}

// ─── assessSecurityHealth ───────────────────────────────

/**
 * @example
 * const dim = assessSecurityHealth(['app.ts'], { 'app.ts': 'const key = "hardcoded"' })
 * console.log(dim.findings)
 */
export function assessSecurityHealth(
  _files: string[],
  contents: Record<string, string>,
): HealthDimension {
  const findings: string[] = []
  const suggestions: string[] = []
  let score = 100

  const allContent = Object.values(contents).join('\n')

  const secretPatterns = [
    { name: 'API key', pattern: /api[_-]?key\s*=\s*['"][^'"]{20,}['"]/gi },
    { name: 'password', pattern: /password\s*=\s*['"][^'"]+['"]/gi },
    { name: 'token', pattern: /token\s*=\s*['"][^'"]{20,}['"]/gi },
    { name: 'private key', pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g },
  ]

  for (const { name, pattern } of secretPatterns) {
    const matches = allContent.match(pattern)
    if (matches && matches.length > 0) {
      score -= matches.length * 15
      findings.push(`Potential hardcoded ${name} found (${matches.length} occurrence(s))`)
      suggestions.push(`Remove hardcoded ${name}s, use environment variables instead`)
    }
  }

  if (allContent.includes('eval(')) {
    score -= 20
    findings.push('eval() usage detected')
    suggestions.push('Remove eval() calls — security risk')
  }

  if (allContent.includes('innerHTML')) {
    score -= 10
    findings.push('innerHTML usage detected')
    suggestions.push('Avoid innerHTML — use safe DOM APIs')
  }

  if (findings.length === 0) {
    findings.push('No obvious security issues found')
  }

  score = Math.max(0, score)
  return { findings, grade: scoreToGrade(score), name: 'Security', score, suggestions, weight: 0.20 }
}

// ─── assessCodeQuality ──────────────────────────────────

/**
 * @example
 * const dim = assessCodeQuality(['app.ts'], { 'app.ts': 'console.log("x")'.repeat(50) })
 * console.log(dim.score)
 */
export function assessCodeQuality(
  files: string[],
  contents: Record<string, string>,
): HealthDimension {
  const findings: string[] = []
  const suggestions: string[] = []
  let score = 100

  let totalLines = 0
  let consoleCount = 0
  let todoCount = 0
  let longFiles = 0

  for (const file of files) {
    const content = contents[file]
    if (!content) continue

    const lines = content.split('\n')
    totalLines += lines.length

    if (lines.length > 300) {
      longFiles++
    }

    for (const line of lines) {
      if (/\bconsole\.(log|warn|error|info)\b/.test(line)) {
        consoleCount++
      }
      if (/\/\/\s*(TODO|FIXME|HACK|XXX)/i.test(line)) {
        todoCount++
      }
    }
  }

  findings.push(`${totalLines} total lines across ${files.length} files`)

  if (consoleCount > 20) {
    score -= 10
    findings.push(`${consoleCount} console statements found`)
    suggestions.push('Remove or replace console statements with proper logger')
  }

  if (todoCount > 10) {
    score -= 10
    findings.push(`${todoCount} TODO/FIXME comments`)
    suggestions.push('Address TODO/FIXME comments')
  }

  if (longFiles > 5) {
    score -= 10
    findings.push(`${longFiles} files over 300 lines`)
    suggestions.push('Break down large files into smaller modules')
  }

  if (findings.length === 1) {
    findings.push('Code quality looks good')
  }

  score = Math.max(0, score)
  return { findings, grade: scoreToGrade(score), name: 'Quality', score, suggestions, weight: 0.20 }
}

// ─── assessDocumentationHealth ──────────────────────────

/**
 * @example
 * const dim = assessDocumentationHealth(['app.ts'], { 'app.ts': '/** docs *\/ function foo() {}' })
 * console.log(dim.score)
 */
export function assessDocumentationHealth(
  files: string[],
  contents: Record<string, string>,
): HealthDimension {
  const findings: string[] = []
  const suggestions: string[] = []
  let score = 100

  const hasReadme = Object.keys(contents).some((f) =>
    f.toLowerCase().includes('readme'),
  )

  if (!hasReadme) {
    score -= 20
    findings.push('No README file found')
    suggestions.push('Add a README.md file')
  } else {
    findings.push('README file present')
  }

  const jsFiles = files.filter((f) => /\.(ts|js)$/.test(f))
  let jsdocCount = 0
  let functionCount = 0

  for (const file of jsFiles) {
    const content = contents[file] ?? ''
    const jsdocMatches = content.match(/\/\*\*[\s\S]*?\*\//g)
    if (jsdocMatches) jsdocCount += jsdocMatches.length

    const fnMatches = content.match(/\bfunction\s+\w+|=>\s*\{|export\s+(async\s+)?function/g)
    if (fnMatches) functionCount += fnMatches.length
  }

  const jsdocRatio = functionCount > 0 ? jsdocCount / functionCount : 0
  findings.push(`${jsdocCount} JSDoc comments for ~${functionCount} functions`)

  if (jsdocRatio < 0.2 && functionCount > 5) {
    score -= 15
    suggestions.push('Add JSDoc comments to public functions')
  }

  const allContent = Object.values(contents).join('\n')
  const commentLines = allContent.split('\n').filter((l) => l.trim().startsWith('//') || l.trim().startsWith('*')).length
  findings.push(`${commentLines} inline comment lines`)

  score = Math.max(0, score)
  return { findings, grade: scoreToGrade(score), name: 'Documentation', score, suggestions, weight: 0.15 }
}

// ─── assessPerformanceHealth ────────────────────────────

/**
 * @example
 * const dim = assessPerformanceHealth(['app.ts'], { 'app.ts': 'for (let i = 0; i < arr.length; i++) {}' })
 * console.log(dim.score)
 */
export function assessPerformanceHealth(
  _files: string[],
  contents: Record<string, string>,
): HealthDimension {
  const findings: string[] = []
  const suggestions: string[] = []
  let score = 100

  const allContent = Object.values(contents).join('\n')

  const syncReadCount = (allContent.match(/readFileSync|writeFileSync/g) ?? []).length
  if (syncReadCount > 0) {
    score -= syncReadCount * 5
    findings.push(`${syncReadCount} synchronous file operations found`)
    suggestions.push('Use async file operations (fs/promises)')
  }

  const nestedLoopCount = (allContent.match(/for\s*\(.*\n\s*for\s*\(/g) ?? []).length
  if (nestedLoopCount > 3) {
    score -= 10
    findings.push(`${nestedLoopCount} nested loops detected`)
    suggestions.push('Optimize nested loops — consider better algorithms')
  }

  const regexInLoop = (allContent.match(/for\s*\([\s\S]*?new RegExp/g) ?? []).length
  if (regexInLoop > 0) {
    score -= 10
    findings.push('RegExp created inside loop')
    suggestions.push('Move RegExp creation outside loops')
  }

  if (findings.length === 0) {
    findings.push('No obvious performance anti-patterns found')
  }

  score = Math.max(0, score)
  return { findings, grade: scoreToGrade(score), name: 'Performance', score, suggestions, weight: 0.10 }
}

// ─── computeOverallHealth ───────────────────────────────

/**
 * @example
 * const report = computeOverallHealth(dimensions)
 * console.log(report.overall)
 */
export function computeOverallHealth(dimensions: HealthDimension[]): HealthReport {
  let weightedSum = 0
  let totalWeight = 0

  for (const d of dimensions) {
    weightedSum += d.score * d.weight
    totalWeight += d.weight
  }

  const overall = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
  const grade = scoreToGrade(overall)

  const sortedByScore = [...dimensions].sort((a, b) => b.score - a.score)
  const highlights = sortedByScore
    .filter((d) => d.score >= 70)
    .slice(0, 3)
    .map((d) => `${d.name}: ${d.grade} (${d.score}%)`)

  const concerns = sortedByScore
    .filter((d) => d.score < 70)
    .reverse()
    .slice(0, 3)
    .map((d) => `${d.name}: ${d.grade} (${d.score}%)`)

  const actions = generatePriorityActions(dimensions)

  return { actions, concerns, dimensions, grade, highlights, overall }
}

// ─── generatePriorityActions ────────────────────────────

/**
 * @example
 * const actions = generatePriorityActions(dimensions)
 * console.log(actions[0].priority)
 */
export function generatePriorityActions(dimensions: HealthDimension[]): HealthAction[] {
  const actions: HealthAction[] = []

  const sorted = [...dimensions].sort((a, b) => a.score - b.score)

  for (const dim of sorted) {
    for (const suggestion of dim.suggestions) {
      const effort: 'high' | 'low' | 'medium' = dim.score < 40 ? 'high' : dim.score < 70 ? 'medium' : 'low'
      actions.push({
        action: suggestion,
        dimension: dim.name,
        effort,
        impact: `Improve ${dim.name} score`,
        priority: actions.length < 5 ? actions.length + 1 : 5,
      })
    }
  }

  return actions.slice(0, 5)
}

// ─── buildHealthReport ──────────────────────────────────

/**
 * @example
 * const report = await buildHealthReport(files, contents, {})
 * console.log(report.overall)
 */
export async function buildHealthReport(
  files: string[],
  contents: Record<string, string>,
  options?: HealthOptions,
): Promise<HealthReport> {
  const dimensions: HealthDimension[] = [
    assessTestHealth(files, contents),
    assessDependencyHealth(contents),
    assessSecurityHealth(files, contents),
    assessCodeQuality(files, contents),
    assessDocumentationHealth(files, contents),
    assessPerformanceHealth(files, contents),
  ]

  const report = computeOverallHealth(dimensions)

  if (options?.verbose) {
    for (const dim of report.dimensions) {
      dim.findings.push(...dim.suggestions)
    }
  }

  return report
}
