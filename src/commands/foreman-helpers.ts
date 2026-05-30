// ─── Types ────────────────────────────────────────────────────────────────────

export type Severity = 'cosmetic' | 'critical' | 'major' | 'minor'

export interface Violation {
  file: string
  line: number
  area: string
  severity: Severity
  code: string
  message: string
  fix: string
}

export interface InspectionArea {
  name: string
  score: number
  grade: string
  violations: Violation[]
}

export interface ForemanStats {
  totalViolations: number
  criticalCount: number
  majorCount: number
  minorCount: number
  cosmeticCount: number
  passRate: number
  buildingIntegrity: number
  estimatedFixTime: string
  safestArea: string
  riskiestArea: string
}

export interface ConstructionReport {
  areas: InspectionArea[]
  overallGrade: string
  overallScore: number
  stats: ForemanStats
  recommendations: string[]
}

export interface ForemanOptions {
  verbose?: boolean
}

// ─── Grade Computation ────────────────────────────────────────────────────────

/**
 * Compute letter grade from score.
 *
 * @example
 * computeGrade(92)
 */
export function computeGrade(score: number): string {
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
  return 'F'
}

/**
 * Compute score for an inspection area from violations.
 *
 * @example
 * computeAreaScore(violations, totalChecks)
 */
export function computeAreaScore(violations: Violation[], totalChecks: number): number {
  if (totalChecks === 0) return 100
  let deductions = 0
  for (const v of violations) {
    switch (v.severity) {
      case 'critical': deductions += 15; break
      case 'major': deductions += 8; break
      case 'minor': deductions += 3; break
      case 'cosmetic': deductions += 1; break
    }
  }
  return Math.max(0, Math.round(100 - deductions))
}

// ─── Foundation Inspection ────────────────────────────────────────────────────

/**
 * Inspect foundation (core stability).
 *
 * @example
 * inspectFoundation(files, contents)
 */
export function inspectFoundation(files: string[], contents: string[]): InspectionArea {
  const violations: Violation[] = []
  let checks = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const isEntry = /index|main|app|cli|server/.test(file.toLowerCase())

    if (isEntry) {
      checks++
      if (!content.includes('catch') && !content.includes('try')) {
        violations.push({ file, line: 1, area: 'Foundation', severity: 'major', code: 'FD-001', message: 'Entry point lacks error handling', fix: 'Add try/catch error handling to entry point' })
      }
    }

    if (content.includes('process.env') || content.includes('config')) {
      checks++
      if (!content.includes('validate') && !content.includes('z.') && !content.includes('schema')) {
        violations.push({ file, line: findLine(content, 'process.env') || findLine(content, 'config'), area: 'Foundation', severity: 'major', code: 'FD-002', message: 'Config used without validation', fix: 'Add config validation with a schema' })
      }
    }

    checks++
    if (content.includes('as any')) {
      violations.push({ file, line: findLine(content, 'as any'), area: 'Foundation', severity: 'critical', code: 'FD-004', message: 'Type safety bypassed with as any', fix: 'Replace as any with proper type assertion' })
    }
  }

  const score = computeAreaScore(violations, Math.max(1, checks))
  return { name: 'Foundation', score, grade: computeGrade(score), violations }
}

// ─── Framing Inspection ───────────────────────────────────────────────────────

/**
 * Inspect framing (structural integrity).
 *
 * @example
 * inspectFraming(files, contents)
 */
export function inspectFraming(files: string[], contents: string[]): InspectionArea {
  const violations: Violation[] = []
  let checks = files.length

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const lines = content.split('\n').length

    if (lines > 500) {
      violations.push({ file, line: 1, area: 'Framing', severity: 'major', code: 'FR-002', message: `Oversized file (${lines} lines)`, fix: 'Split into smaller focused modules' })
    }

    const classCount = (content.match(/\bclass\s+\w+/g) ?? []).length
    if (classCount > 5) {
      violations.push({ file, line: 1, area: 'Framing', severity: 'major', code: 'FR-004', message: `God object with ${classCount} classes`, fix: 'Extract classes into separate files' })
    }

    const funcCount = (content.match(/\bfunction\s+\w+/g) ?? []).length + (content.match(/=>/g) ?? []).length
    if (funcCount > 30) {
      violations.push({ file, line: 1, area: 'Framing', severity: 'minor', code: 'FR-004', message: `High function density (${funcCount})`, fix: 'Consider splitting into helper modules' })
    }
  }

  const score = computeAreaScore(violations, Math.max(1, checks))
  return { name: 'Framing', score, grade: computeGrade(score), violations }
}

// ─── Plumbing Inspection ──────────────────────────────────────────────────────

/**
 * Inspect plumbing (data flow).
 *
 * @example
 * inspectPlumbing(files, contents)
 */
export function inspectPlumbing(files: string[], contents: string[]): InspectionArea {
  const violations: Violation[] = []
  let checks = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''

    const asyncFuncs = (content.match(/async\s+function/g) ?? []).length
    if (asyncFuncs > 0) {
      checks++
      const syncReads = (content.match(/readFileSync|writeFileSync|existsSync/g) ?? []).length
      if (syncReads > 0) {
        violations.push({ file, line: 1, area: 'Plumbing', severity: 'major', code: 'PL-003', message: `Synchronous I/O in async context (${syncReads} calls)`, fix: 'Replace sync I/O with async alternatives' })
      }
    }

    checks++
    const bareReturns = (content.match(/return\s*[;\n]/g) ?? []).length
    const functions = (content.match(/\bfunction\b/g) ?? []).length
    if (functions > 0 && bareReturns > functions * 0.5) {
      violations.push({ file, line: 1, area: 'Plumbing', severity: 'minor', code: 'PL-001', message: 'Potential unhandled return values', fix: 'Ensure all return values are handled' })
    }
  }

  const score = computeAreaScore(violations, Math.max(1, checks))
  return { name: 'Plumbing', score, grade: computeGrade(score), violations }
}

// ─── Electrical Inspection ────────────────────────────────────────────────────

/**
 * Inspect electrical (error handling).
 *
 * @example
 * inspectElectrical(files, contents)
 */
export function inspectElectrical(files: string[], contents: string[]): InspectionArea {
  const violations: Violation[] = []
  let checks = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const lines = content.split('\n')

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li]!
      if (/catch\s*\(\s*\w+\s*\)\s*\{\s*\}/.test(line) || /catch\s*\(\s*\w+\s*\)\s*\{\s*\/\//.test(line)) {
        checks++
        violations.push({ file, line: li + 1, area: 'Electrical', severity: 'major', code: 'EL-001', message: 'Bare catch block — error swallowed', fix: 'Handle or rethrow the caught error' })
      }
    }

    checks++
    if (/\bcatch\s*\(\s*e\s*\)/.test(content) && !content.includes('instanceof')) {
      violations.push({ file, line: findLine(content, 'catch (e)'), area: 'Electrical', severity: 'minor', code: 'EL-002', message: 'Generic error catch without type checking', fix: 'Use instanceof to check specific error types' })
    }

    checks++
    const asyncCount = (content.match(/async\s/g) ?? []).length
    const tryCatchCount = (content.match(/try\s*\{/g) ?? []).length
    if (asyncCount > 0 && tryCatchCount === 0 && !content.includes('.catch(')) {
      violations.push({ file, line: 1, area: 'Electrical', severity: 'critical', code: 'EL-003', message: 'Async code without error handling', fix: 'Wrap async operations in try/catch or use .catch()' })
    }

    if (content.includes('throw') || content.includes('reject')) {
      checks++
      if (content.includes('throw "')) {
        violations.push({ file, line: findLine(content, 'throw "'), area: 'Electrical', severity: 'minor', code: 'EL-004', message: 'Throwing string literals instead of Error objects', fix: 'Throw new Error("message") instead' })
      }
    }
  }

  const score = computeAreaScore(violations, Math.max(1, checks))
  return { name: 'Electrical', score, grade: computeGrade(score), violations }
}

// ─── Finishing Inspection ─────────────────────────────────────────────────────

/**
 * Inspect finishing (code quality).
 *
 * @example
 * inspectFinishing(files, contents)
 */
export function inspectFinishing(files: string[], contents: string[]): InspectionArea {
  const violations: Violation[] = []
  let checks = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const lines = content.split('\n')

    checks++
    const commentedCode = lines.filter((l) => /^\s*\/\/\s*(const|let|var|function|class|import|export|if|for|while|return)\b/.test(l)).length
    if (commentedCode > 3) {
      violations.push({ file, line: 1, area: 'Finishing', severity: 'minor', code: 'FN-001', message: `${commentedCode} commented-out code lines`, fix: 'Remove dead code or use version control' })
    }

    checks++
    const consoleLogs = (content.match(/console\.(log|debug|info)\(/g) ?? []).length
    if (consoleLogs > 5) {
      violations.push({ file, line: 1, area: 'Finishing', severity: 'cosmetic', code: 'FN-002', message: `${consoleLogs} debug console statements`, fix: 'Remove or replace with proper logging' })
    }

    checks++
    const magicNumbers = content.match(/\b(?<!const\s)(?<!let\s)(?<!var\s)(?<!return\s)(?<!=\s)\d{2,}\b/g)
    if (magicNumbers && magicNumbers.length > 10) {
      violations.push({ file, line: 1, area: 'Finishing', severity: 'cosmetic', code: 'FN-004', message: `${magicNumbers.length} potential magic numbers`, fix: 'Extract magic numbers into named constants' })
    }
  }

  const score = computeAreaScore(violations, Math.max(1, checks))
  return { name: 'Finishing', score, grade: computeGrade(score), violations }
}

// ─── Roofing Inspection ───────────────────────────────────────────────────────

/**
 * Inspect roofing (test coverage).
 *
 * @example
 * inspectRoofing(files, contents)
 */
export function inspectRoofing(files: string[], contents: string[]): InspectionArea {
  const violations: Violation[] = []
  const sourceFiles = files.filter((f) => !f.includes('.test.') && !f.includes('.spec.'))
  const testFiles = files.filter((f) => f.includes('.test.') || f.includes('.spec.'))
  let checks = sourceFiles.length

  for (const src of sourceFiles) {
    const base = src.replace(/\.\w+$/, '')
    const hasTest = testFiles.some((t) => t.includes(base) || t.includes(base.split('/').at(-1) ?? ''))
    if (!hasTest) {
      violations.push({ file: src, line: 1, area: 'Roofing', severity: 'minor', code: 'RF-001', message: 'No test file found', fix: `Create a test file for ${src}` })
    }
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    if (!file.includes('.test.') && !file.includes('.spec.')) continue
    const content = contents[i] ?? ''

    if (content.includes('.skip(') || content.includes('.todo(')) {
      violations.push({ file, line: 1, area: 'Roofing', severity: 'minor', code: 'RF-004', message: 'Skipped or todo tests found', fix: 'Complete or remove skipped tests' })
    }
  }

  const score = computeAreaScore(violations, Math.max(1, checks))
  return { name: 'Roofing', score, grade: computeGrade(score), violations }
}

// ─── Fix Time Estimate ────────────────────────────────────────────────────────

/**
 * Estimate fix time from violations.
 *
 * @example
 * estimateFixTime(violations)
 */
export function estimateFixTime(violations: Violation[]): string {
  let minutes = 0
  for (const v of violations) {
    switch (v.severity) {
      case 'critical': minutes += 30; break
      case 'major': minutes += 15; break
      case 'minor': minutes += 5; break
      case 'cosmetic': minutes += 2; break
    }
  }
  if (minutes === 0) return '0 minutes'
  if (minutes < 60) return `${minutes} minutes`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate foreman recommendations.
 *
 * @example
 * generateForemanRecommendations(areas, stats)
 */
export function generateForemanRecommendations(areas: InspectionArea[], stats: ForemanStats): string[] {
  const recs: string[] = []

  if (stats.criticalCount > 0) {
    recs.push(`${stats.criticalCount} critical violation(s) — fix immediately before deployment`)
  }

  if (stats.majorCount > 3) {
    recs.push(`${stats.majorCount} major violation(s) — plan a refactoring sprint`)
  }

  const weakest = [...areas].sort((a, b) => a.score - b.score)[0]
  if (weakest && weakest.score < 70) {
    recs.push(`${weakest.name} is the weakest area (${weakest.score}/100) — prioritize improvement`)
  }

  if (stats.passRate < 60) {
    recs.push(`Pass rate is ${stats.passRate}% — establish coding standards and enforce them`)
  }

  if (recs.length === 0) {
    recs.push('Construction quality is excellent — codebase passes all major inspections')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete foreman result.
 *
 * @example
 * buildForemanResult(files, contents)
 */
export function buildForemanResult(
  files: string[],
  contents: string[],
  _options?: ForemanOptions,
): ConstructionReport {
  const areas: InspectionArea[] = [
    inspectFoundation(files, contents),
    inspectFraming(files, contents),
    inspectPlumbing(files, contents),
    inspectElectrical(files, contents),
    inspectFinishing(files, contents),
    inspectRoofing(files, contents),
  ]

  const allViolations = areas.flatMap((a) => a.violations)
  const overallScore = areas.length > 0
    ? Math.round(areas.reduce((s, a) => s + a.score, 0) / areas.length)
    : 100

  const criticalCount = allViolations.filter((v) => v.severity === 'critical').length
  const majorCount = allViolations.filter((v) => v.severity === 'major').length
  const minorCount = allViolations.filter((v) => v.severity === 'minor').length
  const cosmeticCount = allViolations.filter((v) => v.severity === 'cosmetic').length

  const totalChecks = areas.reduce((s, a) => s + Math.max(1, a.violations.length + 1), 0)
  const passedChecks = totalChecks - allViolations.length
  const passRate = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100

  const sorted = [...areas].sort((a, b) => b.score - a.score)
  const safestArea = sorted[0]?.name ?? 'N/A'
  const riskiestArea = sorted[sorted.length - 1]?.name ?? 'N/A'

  const buildingIntegrity = Math.max(0, Math.round(overallScore - criticalCount * 5 - majorCount * 2))

  const stats: ForemanStats = {
    totalViolations: allViolations.length,
    criticalCount,
    majorCount,
    minorCount,
    cosmeticCount,
    passRate,
    buildingIntegrity,
    estimatedFixTime: estimateFixTime(allViolations),
    safestArea,
    riskiestArea,
  }

  const recommendations = generateForemanRecommendations(areas, stats)

  return {
    areas,
    overallGrade: computeGrade(overallScore),
    overallScore,
    stats,
    recommendations,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Find line number of a substring.
 *
 * @example
 * findLine(content, 'process.env')
 */
export function findLine(content: string, pattern: string): number {
  const idx = content.indexOf(pattern)
  if (idx === -1) return 1
  return content.substring(0, idx).split('\n').length
}
