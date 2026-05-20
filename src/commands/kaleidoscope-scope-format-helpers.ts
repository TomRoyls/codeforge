import chalk from 'chalk'

import type {
  KaleidoscopeScopeResult,
  KaleidoscopeScopeStats,
  ScopeFile,
  ScopeHealth,
  ScopeIssue,
  ScopePattern,
  ScopePatternName,
} from './kaleidoscope-scope-helpers.js'

// ─── Color Maps ────────────────────────────────────────────────────────────────

const HEALTH_COLOR: Record<ScopeHealth, (s: string) => string> = {
  pristine: chalk.rgb(72, 199, 142),
  clean: chalk.rgb(100, 200, 180),
  acceptable: chalk.rgb(200, 200, 80),
  messy: chalk.rgb(220, 150, 80),
  hazardous: chalk.rgb(220, 80, 80),
}

const PATTERN_COLOR: Record<ScopePatternName, (s: string) => string> = {
  'tight-scope': chalk.rgb(72, 199, 142),
  'block-scoped': chalk.rgb(138, 120, 255),
  'module-scoped': chalk.rgb(100, 149, 237),
  'function-scoped': chalk.rgb(220, 180, 80),
  'global-heavy': chalk.rgb(220, 80, 80),
}

const SEVERITY_COLOR: Record<string, (s: string) => string> = {
  error: chalk.rgb(220, 80, 80),
  warning: chalk.rgb(220, 180, 80),
  info: chalk.rgb(100, 149, 237),
}

/**
 * Format scope health label with color.
 *
 * @example
 * formatHealthLabel('pristine') // => colored string
 */
export function formatHealthLabel(health: ScopeHealth): string {
  const color = HEALTH_COLOR[health] ?? ((s: string) => s)
  return color(health)
}

/**
 * Format pattern name with color.
 *
 * @example
 * formatPatternLabel('tight-scope') // => colored string
 */
export function formatPatternLabel(pattern: ScopePatternName): string {
  const color = PATTERN_COLOR[pattern] ?? ((s: string) => s)
  return color(pattern)
}

/**
 * Format severity badge.
 *
 * @example
 * formatSeverity('error') // => colored string
 */
export function formatSeverity(severity: string): string {
  const color = SEVERITY_COLOR[severity] ?? ((s: string) => s)
  return color(severity)
}

// ─── Gauge ─────────────────────────────────────────────────────────────────────

/**
 * Format a value gauge bar.
 *
 * @example
 * formatScopeGauge(75) // => '███████████████░░░░░ 75'
 */
export function formatScopeGauge(value: number, width: number = 20): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const color = value >= 80 ? chalk.rgb(72, 199, 142) : value >= 50 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${value}`)
}

// ─── Scope Tree ────────────────────────────────────────────────────────────────

/**
 * Format scope tree visualization.
 *
 * @example
 * formatScopeTree(layers) // => tree string
 */
export function formatScopeTree(layers: ScopeFile[]): string {
  const header = chalk.bold('Scope File Analysis')
  const separator = '\u2500'.repeat(70)

  if (layers.length === 0) {
    return `${header}\n${separator}\nNo files analyzed.`
  }

  const lines = [header, separator]

  for (const f of layers) {
    const pattern = formatPatternLabel(f.pattern as ScopePatternName)
    lines.push(`${chalk.cyan(f.file.padEnd(35))} ${pattern.padEnd(18)} depth:${f.maxScopeDepth} hygiene:${f.scopeHygiene}`)
    if (f.issues.length > 0) {
      lines.push(`  issues: ${f.issues.length} (${f.issues.filter(i => i.severity === 'error').length} errors, ${f.issues.filter(i => i.severity === 'warning').length} warnings)`)
    }
  }

  return lines.join('\n')
}

// ─── Issues Table ──────────────────────────────────────────────────────────────

/**
 * Format scope issues table.
 *
 * @example
 * formatIssuesTable(issues) // => issues table
 */
export function formatIssuesTable(issues: ScopeIssue[]): string {
  const header = chalk.bold('Scope Issues')
  const separator = '\u2500'.repeat(80)

  if (issues.length === 0) {
    return `${header}\n${separator}\n${chalk.rgb(72, 199, 142)('No scope issues found. Clean scopes!')}`
  }

  const lines = [header, separator]

  for (const issue of issues) {
    const sev = formatSeverity(issue.severity)
    lines.push(`${sev.padEnd(10)} ${issue.type.padEnd(20)} ${chalk.gray(`line:${issue.line}`)} ${issue.name}`)
    lines.push(`  ${issue.description}`)
  }

  return lines.join('\n')
}

// ─── Pattern Distribution ──────────────────────────────────────────────────────

/**
 * Format scope patterns.
 *
 * @example
 * formatPatterns(patterns) // => pattern list
 */
export function formatPatterns(patterns: ScopePattern[]): string {
  const header = chalk.bold('Scope Patterns')
  const separator = '\u2500'.repeat(60)

  if (patterns.length === 0) {
    return `${header}\n${separator}\nNo patterns detected.`
  }

  const lines = [header, separator]

  for (const p of patterns) {
    const label = formatPatternLabel(p.name)
    lines.push(`${label.padEnd(20)} score:${p.score}  files:${p.files.length}  color:${p.color}`)
    lines.push(`  ${p.description}`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format kaleidoscope scope stats.
 *
 * @example
 * formatKaleidoscopeScopeStats(stats) // => stats summary
 */
export function formatKaleidoscopeScopeStats(stats: KaleidoscopeScopeStats): string {
  const header = chalk.bold('Kaleidoscope Scope Analysis')
  const separator = '\u2500'.repeat(55)

  const lines = [
    header,
    separator,
    `Declarations:   ${stats.totalDeclarations} (var:${stats.varCount} let:${stats.letCount} const:${stats.constCount} fn:${stats.functionCount} class:${stats.classCount})`,
    `Layers:         ${stats.totalScopeLayers}`,
    `Exported:       ${stats.exportedCount}   Unused: ${stats.unusedCount}`,
    separator,
    `Issues:         ${stats.totalIssues} (shadow:${stats.shadows} leak:${stats.leaks} hoist:${stats.hoists} unused:${stats.unused} creep:${stats.scopeCreep})`,
    separator,
    `Avg Depth:      ${stats.avgScopeDepth}   Max Depth: ${stats.maxScopeDepth}`,
    `Avg Hygiene:    ${formatScopeGauge(stats.avgHygiene, 15)}`,
    `Symmetry:       ${formatScopeGauge(stats.kaleidoscopeSymmetry, 15)}`,
    `Health:         ${formatHealthLabel(stats.scopeHealth)}`,
    `Pattern:        ${formatPatternLabel(stats.dominantPattern as ScopePatternName)}`,
  ]

  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Fix X']) // => list string
 */
export function formatRecommendations(recommendations: string[]): string {
  const header = chalk.bold('Recommendations')
  const separator = '\u2500'.repeat(50)

  if (recommendations.length === 0) {
    return `${header}\n${separator}\nNo recommendations. Scope is pristine!`
  }

  const lines = [header, separator]
  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full kaleidoscope scope table output.
 *
 * @example
 * formatKaleidoscopeScopeTable(result) // => full table string
 */
export function formatKaleidoscopeScopeTable(result: KaleidoscopeScopeResult): string {
  return [
    formatKaleidoscopeScopeStats(result.stats),
    '',
    formatScopeTree(result.files),
    '',
    formatPatterns(result.patterns),
    '',
    formatIssuesTable(result.files.flatMap(f => f.issues)),
    '',
    formatRecommendations(result.recommendations),
  ].join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format kaleidoscope scope result as JSON.
 *
 * @example
 * formatKaleidoscopeScopeJson(result) // => JSON string
 */
export function formatKaleidoscopeScopeJson(result: KaleidoscopeScopeResult): string {
  return JSON.stringify(result, null, 2)
}
