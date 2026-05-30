import chalk from 'chalk'
import type { PhilosopherResult, Principle, PhilosophicalProfile, PhilosopherStats } from './philosopher-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────────

function adherenceColor(a: number): string {
  if (a >= 70) return chalk.green(String(a))
  if (a >= 40) return chalk.yellow(String(a))
  return chalk.red(String(a))
}

function classificationColor(c: string): string {
  if (c === 'sage') return chalk.green(c)
  if (c === 'scholar') return chalk.blue(c)
  if (c === 'seeker') return chalk.cyan(c)
  if (c === 'skeptic') return chalk.yellow(c)
  return chalk.red(c)
}

function eraColor(e: string): string {
  if (e === 'enlightenment') return chalk.green(e)
  if (e === 'renaissance') return chalk.blue(e)
  if (e === 'classical') return chalk.cyan(e)
  if (e === 'medieval') return chalk.yellow(e)
  return chalk.red(e)
}


function wisdomColor(w: number): string {
  if (w >= 80) return chalk.green(String(w))
  if (w >= 60) return chalk.blue(String(w))
  if (w >= 40) return chalk.yellow(String(w))
  return chalk.red(String(w))
}

// ─── Principle Formatting ──────────────────────────────────────────────────────

function formatPrinciples(principles: Principle[]): string {
  if (principles.length === 0) return chalk.dim('  No principles evaluated.')
  return principles.map(p => {
    const bars = `${chalk.green('█'.repeat(Math.round(p.adherence / 5)))}${chalk.dim('░'.repeat(20 - Math.round(p.adherence / 5)))}`
    const wisdomStr = p.wisdoms.length > 0
      ? p.wisdoms.map(w => chalk.dim(`  ◈ ${w}`)).join('\n')
      : ''
    const violationStr = p.violations.length > 0
      ? chalk.red(`  ⚠ ${p.violations.length} violation(s)`)
      : ''
    return [
      `  ${chalk.bold(p.name)} ${adherenceColor(p.adherence)}/100 ${bars}`,
      `     ${chalk.dim(`[${p.category}] — ${p.philosopher}`)}`,
      wisdomStr,
      violationStr,
    ].filter(Boolean).join('\n')
  }).join('\n\n')
}

// ─── Profile Formatting ────────────────────────────────────────────────────────

function formatProfiles(profiles: PhilosophicalProfile[], verbose: boolean): string {
  if (profiles.length === 0) return chalk.dim('  No profiles analyzed.')
  const display = verbose ? profiles : profiles.slice(0, 10)
  return display.map((p, i) => {
    const enlightened = p.isEnlightened ? chalk.green(' ✦') : ''
    return [
      `  ${chalk.bold(`${i + 1}.`)} ${chalk.bold(p.file)} ${classificationColor(p.classification)}${enlightened}`,
      `     Wisdom: ${wisdomColor(p.wisdom)} | Virtue: ${chalk.green(p.dominantVirtue)} | Sin: ${chalk.red(p.cardinalSin)}`,
    ].join('\n')
  }).join('\n\n')
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

function formatStats(stats: PhilosopherStats): string {
  return [
    `  Overall Wisdom: ${chalk.bold(wisdomColor(stats.overallWisdom))}/100 | Era: ${eraColor(stats.era)}`,
    `  Principles: ${chalk.white(String(stats.totalPrinciples))} | Avg Adherence: ${adherenceColor(stats.avgAdherence)}`,
    `  Best: ${chalk.green(stats.bestPrinciple)} | Worst: ${chalk.red(stats.worstPrinciple)}`,
    `  Violations: ${chalk.white(String(stats.totalViolations))} (${chalk.red(`${stats.heresyViolations} heresy`)})`,
    `  Sage: ${chalk.green(String(stats.sageFiles))} | Heretic: ${chalk.red(String(stats.hereticFiles))} | Enlightenment: ${chalk.white(`${stats.enlightenmentRate}%`)}`,
    `  Virtue: ${chalk.green(stats.dominantVirtue)} | Sin: ${chalk.red(stats.cardinalSin)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────────

/**
 * Format philosopher result as a table
 * @example
 * formatPhilosopherTable(result, false) // string
 */
export function formatPhilosopherTable(result: PhilosopherResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n📜 Philosopher — Code Wisdom Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')
  lines.push(chalk.bold('⚖️  Principles'))
  lines.push(formatPrinciples(result.principles))
  lines.push('')
  lines.push(chalk.bold('🧠 Profiles'))
  lines.push(formatProfiles(result.profiles, verbose))
  lines.push('')
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(formatStats(result.stats))
  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Wisdom'))
    result.recommendations.forEach(r => lines.push(`  • ${r}`))
  }
  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────────

/**
 * Format philosopher result as JSON
 * @example
 * formatPhilosopherJson(result) // string
 */
export function formatPhilosopherJson(result: PhilosopherResult): string {
  return JSON.stringify(result, null, 2)
}
