// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuditFinding {
  dimension: string
  severity: 'info' | 'warning' | 'error'
  message: string
  file: string
  line: number
  suggestion: string
}

export interface AuditDimension {
  name: string
  score: number
  grade: string
  icon: string
  findings: AuditFinding[]
  summary: string
  weight: number
}

export interface AuditSummary {
  overall: number
  overallGrade: string
  dimensions: AuditDimension[]
  criticalFindings: AuditFinding[]
  topConcerns: string[]
  topStrengths: string[]
  estimatedEffort: string
}

export interface AuditStats {
  totalFiles: number
  totalLines: number
  totalFindings: number
  errorCount: number
  warningCount: number
  infoCount: number
  dimensionsAssessed: number
  auditTimestamp: string
}

export interface AuditResult {
  summary: AuditSummary
  findings: AuditFinding[]
  stats: AuditStats
  recommendations: string[]
}

export interface AuditOptions {
  verbose?: boolean
}

// ─── computeGrade ─────────────────────────────────────────────────────────────

/**
 * Convert a 0-100 score to an A-F grade.
 *
 * @example
 * computeGrade(95) // 'A'
 * computeGrade(45) // 'F'
 */
export function computeGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

// ─── computeOverallScore ──────────────────────────────────────────────────────

/**
 * Compute weighted overall score from dimensions.
 *
 * @example
 * computeOverallScore(dimensions) // 78.5
 */
export function computeOverallScore(dimensions: AuditDimension[]): number {
  let totalWeight = 0
  let weightedSum = 0
  for (const dim of dimensions) {
    weightedSum += dim.score * dim.weight
    totalWeight += dim.weight
  }
  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0
}

// ─── countLines ───────────────────────────────────────────────────────────────

function countLines(content: string): { total: number; code: number; comment: number; blank: number } {
  const lines = content.split('\n')
  let code = 0
  let comment = 0
  let blank = 0
  let inBlock = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '') { blank++; continue }
    if (inBlock) {
      comment++
      if (trimmed.includes('*/')) inBlock = false
      continue
    }
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) { comment++; continue }
    if (trimmed.startsWith('/*')) {
      comment++
      if (!trimmed.includes('*/')) inBlock = true
      continue
    }
    code++
  }

  return { total: lines.length, code, comment, blank }
}

// ─── auditComplexity ──────────────────────────────────────────────────────────

/**
 * Audit cyclomatic complexity dimension.
 *
 * @example
 * auditComplexity(['a.ts'], ['if (x) { foo() }']) // AuditDimension
 */
export function auditComplexity(files: string[], contents: string[]): AuditDimension {
  const findings: AuditFinding[] = []
  let totalBranches = 0
  let totalFunctions = 0

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const lines = content.split('\n')

    let fileBranches = 0
    let fileFuncs = 0
    let funcStart = -1
    let funcBranches = 0

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li]!
      const trimmed = line.trim()

      const isFuncDef = /^(export\s+)?(async\s+)?function\s|=>\s*\{|const\s+\w+\s*=\s*(async\s*)?\(/.test(trimmed)
      if (isFuncDef) {
        if (funcStart >= 0 && funcBranches > 8) {
          findings.push({
            dimension: 'Complexity', severity: 'warning',
            message: `Function has ${funcBranches} branches (high complexity)`,
            file: files[i]!, line: funcStart + 1,
            suggestion: 'Consider breaking this function into smaller, focused functions',
          })
        }
        funcStart = li
        funcBranches = 0
        fileFuncs++
      }

      const branchMatches = trimmed.match(/\b(if|else|for|while|case|catch|&&|\|\||\.|\?)\b/g)
      if (branchMatches) {
        funcBranches += branchMatches.length
        fileBranches += branchMatches.length
      }
    }

    if (funcStart >= 0 && funcBranches > 8) {
      findings.push({
        dimension: 'Complexity', severity: 'warning',
        message: `Function has ${funcBranches} branches (high complexity)`,
        file: files[i]!, line: funcStart + 1,
        suggestion: 'Consider breaking this function into smaller, focused functions',
      })
    }

    totalBranches += fileBranches
    totalFunctions += fileFuncs

    if (fileBranches > 50) {
      findings.push({
        dimension: 'Complexity', severity: 'error',
        message: `File has ${fileBranches} total branches`,
        file: files[i]!, line: 1,
        suggestion: 'Split this file into smaller modules',
      })
    }
  }

  const avgComplexity = totalFunctions > 0 ? totalBranches / totalFunctions : 0
  let score = 100
  if (avgComplexity > 15) score = 30
  else if (avgComplexity > 10) score = 50
  else if (avgComplexity > 6) score = 70
  else if (avgComplexity > 3) score = 85

  score = Math.max(0, score - findings.filter((f) => f.severity === 'error').length * 10 - findings.filter((f) => f.severity === 'warning').length * 3)

  return {
    name: 'Complexity',
    score: Math.max(0, Math.min(100, score)),
    grade: computeGrade(score),
    icon: '🧠',
    findings,
    summary: `Avg complexity: ${avgComplexity.toFixed(1)} branches/function across ${totalFunctions} functions`,
    weight: 20,
  }
}

// ─── auditSize ────────────────────────────────────────────────────────────────

/**
 * Audit file and function size dimension.
 *
 * @example
 * auditSize(['a.ts'], ['line1\nline2\nline3']) // AuditDimension
 */
export function auditSize(files: string[], contents: string[]): AuditDimension {
  const findings: AuditFinding[] = []
  let totalLines = 0
  let oversizedFiles = 0

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const lineCount = content.split('\n').length
    totalLines += lineCount

    if (lineCount > 500) {
      oversizedFiles++
      findings.push({
        dimension: 'Size', severity: lineCount > 1000 ? 'error' : 'warning',
        message: `File has ${lineCount} lines (threshold: 500)`,
        file: files[i]!, line: 1,
        suggestion: 'Split into smaller, focused modules',
      })
    }
  }

  const avgSize = files.length > 0 ? totalLines / files.length : 0
  let score = 100
  if (avgSize > 400) score = 40
  else if (avgSize > 300) score = 60
  else if (avgSize > 200) score = 75
  else if (avgSize > 100) score = 85

  score = Math.max(0, score - oversizedFiles * 5)

  return {
    name: 'Size',
    score: Math.max(0, Math.min(100, score)),
    grade: computeGrade(score),
    icon: '📐',
    findings,
    summary: `${totalLines} total lines across ${files.length} files (avg: ${avgSize.toFixed(0)} lines/file)`,
    weight: 10,
  }
}

// ─── auditDependencies ────────────────────────────────────────────────────────

/**
 * Audit dependency and coupling dimension.
 *
 * @example
 * auditDependencies(['a.ts'], ["import x from 'y'"]) // AuditDimension
 */
export function auditDependencies(files: string[], contents: string[]): AuditDimension {
  const findings: AuditFinding[] = []
  let totalImports = 0
  let highCouplingFiles = 0

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const lines = content.split('\n')
    let fileImports = 0

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li]!
      if (/^import\s/.test(line.trim())) {
        fileImports++
        totalImports++
      }
    }

    if (fileImports > 15) {
      highCouplingFiles++
      findings.push({
        dimension: 'Dependencies', severity: 'error',
        message: `File has ${fileImports} imports (threshold: 15)`,
        file: files[i]!, line: 1,
        suggestion: 'Reduce coupling by consolidating related imports or splitting responsibilities',
      })
    } else if (fileImports > 10) {
      findings.push({
        dimension: 'Dependencies', severity: 'warning',
        message: `File has ${fileImports} imports (consider reducing)`,
        file: files[i]!, line: 1,
        suggestion: 'Review if all imports are necessary or if some can be grouped',
      })
    }
  }

  const avgImports = files.length > 0 ? totalImports / files.length : 0
  let score = 100
  if (avgImports > 12) score = 40
  else if (avgImports > 8) score = 60
  else if (avgImports > 5) score = 75
  else if (avgImports > 3) score = 85

  score = Math.max(0, score - highCouplingFiles * 8)

  return {
    name: 'Dependencies',
    score: Math.max(0, Math.min(100, score)),
    grade: computeGrade(score),
    icon: '🔗',
    findings,
    summary: `${totalImports} imports across ${files.length} files (avg: ${avgImports.toFixed(1)} imports/file)`,
    weight: 15,
  }
}

// ─── auditDocumentation ───────────────────────────────────────────────────────

/**
 * Audit documentation coverage dimension.
 *
 * @example
 * auditDocumentation(['a.ts'], ['code with comments']) // AuditDimension
 */
export function auditDocumentation(files: string[], contents: string[]): AuditDimension {
  const findings: AuditFinding[] = []
  let totalCommentLines = 0
  let totalCodeLines = 0
  let jsDocCount = 0
  let funcCount = 0

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const counts = countLines(content)
    totalCommentLines += counts.comment
    totalCodeLines += counts.code

    const lines = content.split('\n')
    let hasJSDoc = false
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li]!
      if (line.includes('/**') || line.includes('*/')) hasJSDoc = true
      if (hasJSDoc && (line.includes('function ') || line.includes('=>'))) {
        jsDocCount++
        hasJSDoc = false
      }
      if (line.includes('function ') || /=>\s*[{(]/.test(line)) {
        funcCount++
      }
    }

    const commentRatio = counts.code > 0 ? counts.comment / counts.code : 0
    if (commentRatio < 0.05 && counts.code > 50) {
      findings.push({
        dimension: 'Documentation', severity: 'warning',
        message: `Low comment ratio: ${(commentRatio * 100).toFixed(1)}%`,
        file: files[i]!, line: 1,
        suggestion: 'Add comments to explain complex logic and public APIs',
      })
    }
  }

  const overallRatio = totalCodeLines > 0 ? totalCommentLines / totalCodeLines : 1
  const jsDocCoverage = funcCount > 0 ? jsDocCount / funcCount : 1

  let score = 100
  if (overallRatio < 0.05) score -= 30
  else if (overallRatio < 0.1) score -= 15
  if (jsDocCoverage < 0.2) score -= 25
  else if (jsDocCoverage < 0.5) score -= 10

  score = Math.max(0, score - findings.filter((f) => f.severity === 'warning').length * 5)

  return {
    name: 'Documentation',
    score: Math.max(0, Math.min(100, score)),
    grade: computeGrade(score),
    icon: '📚',
    findings,
    summary: `Comment ratio: ${(overallRatio * 100).toFixed(1)}%, JSDoc coverage: ${(jsDocCoverage * 100).toFixed(1)}%`,
    weight: 15,
  }
}

// ─── auditSecurity ────────────────────────────────────────────────────────────

const SECURITY_PATTERNS: { pattern: RegExp; message: string; suggestion: string }[] = [
  { pattern: /\beval\s*\(/, message: 'Use of eval() detected', suggestion: 'Avoid eval() — use safer alternatives' },
  { pattern: /innerHTML\s*=/, message: 'Direct innerHTML assignment', suggestion: 'Use textContent or DOM APIs to prevent XSS' },
  { pattern: /document\.write\s*\(/, message: 'Use of document.write()', suggestion: 'Use modern DOM manipulation methods' },
  { pattern: /password\s*=\s*['"][^'"]+['"]/, message: 'Possible hardcoded password', suggestion: 'Use environment variables for secrets' },
  { pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/, message: 'Possible hardcoded API key', suggestion: 'Move secrets to environment variables' },
  { pattern: /secret\s*=\s*['"][^'"]+['"]/, message: 'Possible hardcoded secret', suggestion: 'Use secure secret management' },
  { pattern: /token\s*=\s*['"][^'"]{8,}['"]/, message: 'Possible hardcoded token', suggestion: 'Use environment variables for tokens' },
]

/**
 * Audit security dimension.
 *
 * @example
 * auditSecurity(['a.ts'], ['eval("code")']) // AuditDimension
 */
export function auditSecurity(files: string[], contents: string[]): AuditDimension {
  const findings: AuditFinding[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const lines = content.split('\n')

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li]!
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue

      for (const sp of SECURITY_PATTERNS) {
        if (sp.pattern.test(line)) {
          findings.push({
            dimension: 'Security', severity: 'error',
            message: sp.message,
            file: files[i]!, line: li + 1,
            suggestion: sp.suggestion,
          })
        }
      }
    }

    if (content.includes('node:child_process') || content.includes('child_process')) {
      if (content.includes('exec(') || content.includes('execSync(')) {
        findings.push({
          dimension: 'Security', severity: 'warning',
          message: 'Child process exec usage detected',
          file: files[i]!, line: 1,
          suggestion: 'Validate and sanitize all inputs to prevent command injection',
        })
      }
    }
  }

  const errorCount = findings.filter((f) => f.severity === 'error').length
  let score = 100
  if (errorCount > 5) score = 30
  else if (errorCount > 3) score = 50
  else if (errorCount > 1) score = 70
  else if (errorCount === 1) score = 85

  score = Math.max(0, score - findings.filter((f) => f.severity === 'warning').length * 3)

  return {
    name: 'Security',
    score: Math.max(0, Math.min(100, score)),
    grade: computeGrade(score),
    icon: '🔒',
    findings,
    summary: `${findings.length} security findings (${findings.filter((f) => f.severity === 'error').length} critical)`,
    weight: 10,
  }
}

// ─── auditStyle ───────────────────────────────────────────────────────────────

/**
 * Audit code style consistency dimension.
 *
 * @example
 * auditStyle(['a.ts'], ['const foo_bar = 1']) // AuditDimension
 */
export function auditStyle(files: string[], contents: string[]): AuditDimension {
  const findings: AuditFinding[] = []
  let snakeCaseCount = 0
  let camelCaseCount = 0
  let PascalCaseCount = 0
  let inconsistentFiles = 0

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const lines = content.split('\n')
    let fileSnake = 0
    let fileCamel = 0

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li]!
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue

      const identifiers = line.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g) ?? []
      for (const id of identifiers) {
        if (/^[a-z]/.test(id) && id.includes('_')) { snakeCaseCount++; fileSnake++ }
        if (/^[a-z][a-zA-Z0-9]*[A-Z]/.test(id)) { camelCaseCount++; fileCamel++ }
        if (/^[A-Z]/.test(id) && id.length > 1) PascalCaseCount++
      }
    }

    if (fileSnake > 5 && fileCamel > 5) {
      inconsistentFiles++
      findings.push({
        dimension: 'Style', severity: 'info',
        message: 'Mixed naming conventions (camelCase and snake_case)',
        file: files[i]!, line: 1,
        suggestion: 'Pick one naming convention and apply it consistently',
      })
    }

    const lineLengths = lines.map((l) => l.length)
    const longLines = lineLengths.filter((l) => l > 120).length
    if (longLines > lines.length * 0.2) {
      findings.push({
        dimension: 'Style', severity: 'info',
        message: `${longLines} lines exceed 120 characters`,
        file: files[i]!, line: 1,
        suggestion: 'Break long lines for better readability',
      })
    }
  }

  let score = 100
  if (inconsistentFiles > files.length * 0.3) score -= 20
  if (inconsistentFiles > 3) score -= 10
  score = Math.max(0, score - findings.filter((f) => f.severity === 'warning').length * 5)
  score = Math.max(0, score - findings.filter((f) => f.severity === 'info').length * 2)

  return {
    name: 'Style',
    score: Math.max(0, Math.min(100, score)),
    grade: computeGrade(score),
    icon: '🎨',
    findings,
    summary: `Naming: ${camelCaseCount} camelCase, ${snakeCaseCount} snake_case, ${PascalCaseCount} PascalCase`,
    weight: 10,
  }
}

// ─── auditTesting ─────────────────────────────────────────────────────────────

/**
 * Audit testing dimension.
 *
 * @example
 * auditTesting(['a.ts', 'a.test.ts'], ['fn()', 'test("x", () => {})']) // AuditDimension
 */
export function auditTesting(files: string[], contents: string[]): AuditDimension {
  const findings: AuditFinding[] = []
  let sourceFiles = 0
  let testFiles = 0
  let testAssertions = 0

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]!
    const content = contents[i] ?? ''

    if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('__tests__')) {
      testFiles++
      const itMatches = content.match(/\b(it|test)\s*\(/g)
      const expectMatches = content.match(/\bexpect\s*\(/g)
      testAssertions += (itMatches?.length ?? 0) + (expectMatches?.length ?? 0)
    } else {
      sourceFiles++
    }
  }

  const testRatio = sourceFiles > 0 ? testFiles / sourceFiles : (testFiles > 0 ? 1 : 0)

  if (sourceFiles > 0 && testFiles === 0) {
    findings.push({
      dimension: 'Testing', severity: 'error',
      message: 'No test files found',
      file: '', line: 0,
      suggestion: 'Add unit tests to ensure code correctness',
    })
  } else if (testRatio < 0.3 && sourceFiles > 5) {
    findings.push({
      dimension: 'Testing', severity: 'warning',
      message: `Low test-to-source ratio: ${testRatio.toFixed(2)}`,
      file: '', line: 0,
      suggestion: 'Aim for at least one test file per source module',
    })
  }

  let score = 100
  if (sourceFiles === 0 && testFiles === 0) score = 100
  else if (testFiles === 0 && sourceFiles > 0) score = 20
  else if (testRatio < 0.2) score = 40
  else if (testRatio < 0.5) score = 60
  else if (testRatio < 0.8) score = 75
  else if (testRatio < 1.0) score = 85

  score = Math.max(0, score - findings.filter((f) => f.severity === 'error').length * 15)

  return {
    name: 'Testing',
    score: Math.max(0, Math.min(100, score)),
    grade: computeGrade(score),
    icon: '🧪',
    findings,
    summary: `${testFiles} test files, ${sourceFiles} source files, ${testAssertions} assertions (ratio: ${testRatio.toFixed(2)})`,
    weight: 10,
  }
}

// ─── auditArchitecture ────────────────────────────────────────────────────────

/**
 * Audit architecture dimension.
 *
 * @example
 * auditArchitecture(['a.ts'], ['export function handler() {}']) // AuditDimension
 */
export function auditArchitecture(files: string[], contents: string[]): AuditDimension {
  const findings: AuditFinding[] = []
  let totalExports = 0
  let totalFiles = files.length
  let deepNesting = 0
  let oversizedModules = 0

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const lines = content.split('\n')

    let maxDepth = 0
    let currentDepth = 0
    let fileExports = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('export ')) fileExports++
      for (const ch of trimmed) {
        if (ch === '{' || ch === '(' || ch === '[') currentDepth++
        if (ch === '}' || ch === ')' || ch === ']') currentDepth--
        if (currentDepth > maxDepth) maxDepth = currentDepth
      }
    }

    totalExports += fileExports

    if (maxDepth > 6) {
      deepNesting++
      findings.push({
        dimension: 'Architecture', severity: 'warning',
        message: `Deep nesting detected (depth: ${maxDepth})`,
        file: files[i]!, line: 1,
        suggestion: 'Refactor to reduce nesting — extract functions or use early returns',
      })
    }

    if (fileExports > 20) {
      oversizedModules++
      findings.push({
        dimension: 'Architecture', severity: 'warning',
        message: `Module exports ${fileExports} items (threshold: 20)`,
        file: files[i]!, line: 1,
        suggestion: 'Consider splitting into smaller, focused modules',
      })
    }
  }

  const avgExports = totalFiles > 0 ? totalExports / totalFiles : 0

  let score = 100
  if (deepNesting > totalFiles * 0.3) score -= 20
  if (oversizedModules > 0) score -= oversizedModules * 5
  if (avgExports > 15) score -= 10
  score = Math.max(0, score - findings.filter((f) => f.severity === 'warning').length * 5)

  return {
    name: 'Architecture',
    score: Math.max(0, Math.min(100, score)),
    grade: computeGrade(score),
    icon: '🏗️',
    findings,
    summary: `${totalFiles} modules, avg ${avgExports.toFixed(1)} exports/module, ${deepNesting} deeply nested files`,
    weight: 10,
  }
}

// ─── extractTopConcerns ───────────────────────────────────────────────────────

/**
 * Extract top 5 concerns from findings.
 *
 * @example
 * extractTopConcerns(findings) // ['eval() in a.ts', ...]
 */
export function extractTopConcerns(findings: AuditFinding[]): string[] {
  const sorted = [...findings]
    .filter((f) => f.severity === 'error' || f.severity === 'warning')
    .sort((a, b) => {
      const sev = { error: 0, warning: 1, info: 2 }
      return (sev[a.severity] ?? 2) - (sev[b.severity] ?? 2)
    })

  return sorted.slice(0, 5).map((f) =>
    f.file ? `${f.message} (${f.file}:${f.line})` : f.message,
  )
}

// ─── extractTopStrengths ──────────────────────────────────────────────────────

/**
 * Extract top 5 strengths from dimensions.
 *
 * @example
 * extractTopStrengths(dimensions) // ['Complexity: A (95)', ...]
 */
export function extractTopStrengths(dimensions: AuditDimension[]): string[] {
  return [...dimensions]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((d) => `${d.name}: ${d.grade} (${d.score})`)
}

// ─── estimateEffort ───────────────────────────────────────────────────────────

/**
 * Estimate effort to address findings.
 *
 * @example
 * estimateEffort(findings) // '~2 hours'
 */
export function estimateEffort(findings: AuditFinding[]): string {
  let minutes = 0
  for (const f of findings) {
    if (f.severity === 'error') minutes += 30
    else if (f.severity === 'warning') minutes += 10
    else minutes += 2
  }

  if (minutes === 0) return 'No effort needed'
  if (minutes < 15) return `~${minutes} minutes`
  if (minutes < 60) return `~${Math.round(minutes / 15) * 15} minutes`
  const hours = Math.round(minutes / 60 * 10) / 10
  if (hours < 8) return `~${hours} hours`
  return `~${Math.round(hours / 8)} days`
}

// ─── generateAuditRecommendations ─────────────────────────────────────────────

/**
 * Generate actionable recommendations from audit summary.
 *
 * @example
 * generateAuditRecommendations(summary) // ['Fix 3 security issues...', ...]
 */
export function generateAuditRecommendations(summary: AuditSummary): string[] {
  const recs: string[] = []

  const weak = summary.dimensions.filter((d) => d.score < 70).sort((a, b) => a.score - b.score)
  for (const dim of weak.slice(0, 3)) {
    recs.push(`Priority: Improve ${dim.name} (${dim.grade}, score ${dim.score}) — ${dim.findings.filter((f) => f.severity === 'error').length} critical issues`)
  }

  const errors = summary.criticalFindings.length
  if (errors > 0) {
    recs.push(`Address ${errors} critical findings before next release`)
  }

  const strong = summary.dimensions.filter((d) => d.score >= 85)
  if (strong.length > 0) {
    recs.push(`Maintain strong ${strong.map((d) => d.name).join(', ')} scores`)
  }

  if (summary.overall >= 80) {
    recs.push('Overall codebase health is good — focus on incremental improvements')
  } else if (summary.overall >= 60) {
    recs.push('Codebase needs moderate attention — prioritize security and complexity issues')
  } else {
    recs.push('Codebase needs significant improvement — start with highest-weight dimensions')
  }

  if (recs.length === 0) {
    recs.push('No specific recommendations — codebase audit looks healthy.')
  }

  return recs
}

// ─── buildAuditResult ─────────────────────────────────────────────────────────

/**
 * Orchestrate full codebase audit.
 *
 * @example
 * buildAuditResult(['a.ts'], ['code...']) // AuditResult
 */
export function buildAuditResult(
  files: string[],
  contents: string[],
  _options?: AuditOptions,
): AuditResult {

  const dimensions: AuditDimension[] = [
    auditComplexity(files, contents),
    auditSize(files, contents),
    auditDependencies(files, contents),
    auditDocumentation(files, contents),
    auditSecurity(files, contents),
    auditStyle(files, contents),
    auditTesting(files, contents),
    auditArchitecture(files, contents),
  ]

  const overall = computeOverallScore(dimensions)
  const overallGrade = computeGrade(overall)

  const allFindings: AuditFinding[] = dimensions.flatMap((d) => d.findings)
  const criticalFindings = allFindings.filter((f) => f.severity === 'error')

  let totalLines = 0
  for (const c of contents) {
    totalLines += c.split('\n').length
  }

  const topConcerns = extractTopConcerns(allFindings)
  const topStrengths = extractTopStrengths(dimensions)
  const estimatedEffort = estimateEffort(allFindings)

  const summary: AuditSummary = {
    overall,
    overallGrade,
    dimensions,
    criticalFindings,
    topConcerns,
    topStrengths,
    estimatedEffort,
  }

  const stats: AuditStats = {
    totalFiles: files.length,
    totalLines,
    totalFindings: allFindings.length,
    errorCount: allFindings.filter((f) => f.severity === 'error').length,
    warningCount: allFindings.filter((f) => f.severity === 'warning').length,
    infoCount: allFindings.filter((f) => f.severity === 'info').length,
    dimensionsAssessed: dimensions.length,
    auditTimestamp: new Date().toISOString(),
  }

  const recommendations = generateAuditRecommendations(summary)

  return { summary, findings: allFindings, stats, recommendations }
}
