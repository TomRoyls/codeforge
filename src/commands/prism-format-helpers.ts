import chalk from 'chalk'
import {
  type CompositeResult,
  type Prism,
  type PrismResult,
  type PrismResultStats,
  type Severity,
} from './prism-helpers.js'

// ─── Color Map ────────────────────────────────────────────────────────────────

const PRISM_COLORS: Record<string, (t: string) => string> = {
  red: (t) => chalk.rgb(244, 67, 54)(t),
  orange: (t) => chalk.rgb(255, 152, 0)(t),
  yellow: (t) => chalk.rgb(255, 193, 7)(t),
  green: (t) => chalk.rgb(76, 175, 80)(t),
  blue: (t) => chalk.rgb(33, 150, 243)(t),
  violet: (t) => chalk.rgb(156, 39, 176)(t),
}

const SEVERITY_ICON: Record<Severity, string> = {
  info: 'ℹ',
  warning: '⚠',
  critical: '⛔',
}

/**
 * Get color function for a prism.
 *
 * @example
 * getPrismColor('red')
 */
export function getPrismColor(color: string): (t: string) => string {
  return PRISM_COLORS[color] ?? chalk.white
}

/**
 * Format a severity icon.
 *
 * @example
 * formatSeverity('critical')
 */
export function formatSeverity(severity: Severity): string {
  return SEVERITY_ICON[severity] ?? '○'
}

// ─── Composite Gauge ──────────────────────────────────────────────────────────

/**
 * Render composite score gauge.
 *
 * @example
 * formatCompositeGauge(composite)
 */
export function formatCompositeGauge(composite: CompositeResult): string {
  const filled = Math.round(composite.overallScore / 5)
  const empty = 20 - filled
  let colorFn: (t: string) => string
  if (composite.overallScore >= 80) colorFn = chalk.rgb(76, 175, 80)
  else if (composite.overallScore >= 60) colorFn = chalk.rgb(255, 193, 7)
  else colorFn = chalk.rgb(244, 67, 54)
  const bar = colorFn('█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0)))
  return `  Composite: ${bar} ${composite.overallScore}/100 (Grade: ${composite.overallGrade})`
}

// ─── Prism Row ────────────────────────────────────────────────────────────────

/**
 * Format a prism summary row.
 *
 * @example
 * formatPrismRow(prism)
 */
export function formatPrismRow(prism: Prism): string {
  const colorFn = getPrismColor(prism.color)
  const score = `${prism.stats.averageScore}`.padStart(3)
  const name = prism.name.padEnd(14)
  return colorFn(`  ${name} Score: ${score}  Findings: ${prism.stats.findingCount}  (${prism.description.substring(0, 30)})`)
}

// ─── Prism Comparison Table ───────────────────────────────────────────────────

/**
 * Format prism comparison table.
 *
 * @example
 * formatPrismComparison(prisms)
 */
export function formatPrismComparison(prisms: Prism[]): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Prism Comparison:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────────────────'))
  lines.push(chalk.gray('  Prism          Score  Findings  Description'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────────────────'))
  for (const p of prisms) {
    lines.push(formatPrismRow(p))
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Findings List ────────────────────────────────────────────────────────────

/**
 * Format findings for a prism.
 *
 * @example
 * formatPrismFindings(prism)
 */
export function formatPrismFindings(prism: Prism): string {
  const colorFn = getPrismColor(prism.color)
  const lines: string[] = []
  lines.push(colorFn(chalk.bold(`  ${prism.name} Prism:`)))
  lines.push(chalk.gray(`    ${prism.description}`))

  for (const pf of prism.files) {
    if (pf.findings.length === 0) continue
    lines.push(chalk.dim(`    ${pf.file} (score: ${pf.score})`))
    for (const f of pf.findings.slice(0, 5)) {
      lines.push(`      ${formatSeverity(f.severity)} L${f.line}: ${f.message}`)
    }
    if (pf.findings.length > 5) {
      lines.push(chalk.dim(`      ... and ${pf.findings.length - 5} more`))
    }
  }

  return lines.join('\n')
}

// ─── Stats Summary ────────────────────────────────────────────────────────────

/**
 * Format prism result stats.
 *
 * @example
 * formatStatsSummary(stats)
 */
export function formatStatsSummary(stats: PrismResultStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Stats:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  lines.push(`  Total prisms: ${stats.totalPrisms}`)
  lines.push(`  Total findings: ${stats.totalFindings}`)
  lines.push(`  Average score: ${stats.averageScore}`)
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(recs)
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('  No recommendations.')
  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Full Table Format ────────────────────────────────────────────────────────

/**
 * Format the full prism result as a table.
 *
 * @example
 * formatPrismTable(result)
 */
export function formatPrismTable(result: PrismResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Multi-Dimensional Code Prism\n'))
  sections.push(formatCompositeGauge(result.composite))
  sections.push(`  Best: ${result.composite.bestPrism} | Worst: ${result.composite.worstPrism}`)
  sections.push('')
  sections.push(formatPrismComparison(result.prisms))
  sections.push('')

  if (result.stats.totalFindings > 0) {
    sections.push(chalk.bold('  Findings by Prism:'))
    sections.push(chalk.gray('  ─────────────────────────────────────────────────'))
    for (const p of result.prisms) {
      if (p.stats.findingCount > 0) {
        sections.push(formatPrismFindings(p))
      }
    }
    sections.push('')
  }

  sections.push(formatStatsSummary(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format prism result as JSON.
 *
 * @example
 * formatPrismJSON(result)
 */
export function formatPrismJSON(result: PrismResult): string {
  return JSON.stringify(result, null, 2)
}
