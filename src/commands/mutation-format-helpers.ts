import chalk from 'chalk'
import type { MutablePoint, MutationCoverage, MutationResult, MutationStats } from './mutation-helpers.js'

// ─── coverageMeter ────────────────────────────────────────────────────────────

/**
 * Render coverage meter bar.
 *
 * @example
 * coverageMeter(75) // '█████████████████    75%'
 */
export function coverageMeter(percentage: number): string {
  const width = 20
  const filled = Math.round((percentage / 100) * width)
  const empty = width - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = percentage >= 80 ? chalk.green : percentage >= 50 ? chalk.yellow : chalk.red
  return `${color(bar)} ${percentage}%`
}

// ─── detectionBadge ───────────────────────────────────────────────────────────

/**
 * Format detection likelihood as colored badge.
 *
 * @example
 * detectionBadge('high') // chalk.green('HIGH')
 */
export function detectionBadge(likelihood: string): string {
  switch (likelihood) {
    case 'high': return chalk.green('HIGH')
    case 'medium': return chalk.yellow('MED ')
    case 'low': return chalk.rgb(255, 165, 0)('LOW ')
    case 'unlikely': return chalk.red('UNLK')
    default: return likelihood
  }
}

// ─── mutationTypeBadge ────────────────────────────────────────────────────────

/**
 * Format mutation type as short badge.
 *
 * @example
 * mutationTypeBadge('arithmetic-operator') // 'arith'
 */
export function mutationTypeBadge(mType: string): string {
  const badges: Record<string, string> = {
    'arithmetic-operator': chalk.cyan('arith'),
    'comparison-operator': chalk.magenta('cmpr'),
    'logical-operator': chalk.blue('logic'),
    'boolean-literal': chalk.yellow('bool '),
    'number-literal': chalk.green('num  '),
    'string-literal': chalk.rgb(255, 165, 0)('str  '),
    'return-value': chalk.red('ret  '),
    'conditional-boundary': chalk.cyan('bndry'),
    'negate-condition': chalk.magenta('neg  '),
    'remove-statement': chalk.gray('rm   '),
    'array-method': chalk.blue('arr  '),
  }
  return badges[mType] ?? mType.slice(0, 5)
}

// ─── formatMutationsTable ─────────────────────────────────────────────────────

/**
 * Format mutation points as table.
 *
 * @example
 * formatMutationsTable(mutations) // tabular string
 */
export function formatMutationsTable(mutations: MutablePoint[]): string {
  if (mutations.length === 0) return '  (no mutation points)'

  const header = chalk.bold('  Line  Type    Detection  Code                    Mutation')
  const sep = chalk.gray('  ' + '─'.repeat(90))
  const rows = mutations.slice(0, 25).map((m) => {
    const code = m.code.length > 22 ? m.code.slice(0, 19) + '...' : m.code.padEnd(22)
    const mutated = m.mutatedCode.length > 22 ? m.mutatedCode.slice(0, 19) + '...' : m.mutatedCode
    return `  ${String(m.line).padStart(4)}  ${mutationTypeBadge(m.mutationType)}  ${detectionBadge(m.detectionLikelihood)}  ${code}  ${mutated}`
  })

  return [header, sep, ...rows].join('\n')
}

// ─── formatCoverageTable ──────────────────────────────────────────────────────

/**
 * Format per-file coverage scores.
 *
 * @example
 * formatCoverageTable(files) // coverage table
 */
export function formatCoverageTable(files: MutationCoverage[]): string {
  if (files.length === 0) return '  (no files)'

  const header = chalk.bold('  File                             Score  Bar                      Risky')
  const sep = chalk.gray('  ' + '─'.repeat(80))
  const rows = files.map((f) => {
    const file = f.file.length > 30 ? '...' + f.file.slice(-27) : f.file.padEnd(30)
    const bar = coverageMeter(f.coverageScore)
    return `  ${file}  ${String(f.coverageScore).padStart(5)}  ${bar}  ${f.riskyMutations.length}`
  })

  return [header, sep, ...rows].join('\n')
}

// ─── formatTypeDistribution ───────────────────────────────────────────────────

/**
 * Format mutation type distribution.
 *
 * @example
 * formatTypeDistribution(types) // histogram
 */
export function formatTypeDistribution(types: Record<string, number>): string {
  const entries = Object.entries(types).sort((a, b) => b[1] - a[1])
  if (entries.length === 0) return '  (no mutations)'

  const maxVal = Math.max(...entries.map((e) => e[1]), 1)
  return entries.map(([name, count]) => {
    const barLen = Math.round((count / maxVal) * 15)
    const bar = '█'.repeat(barLen)
    return `  ${mutationTypeBadge(name)} ${chalk.gray(bar)} ${count}`
  }).join('\n')
}

// ─── formatStats ──────────────────────────────────────────────────────────────

/**
 * Format statistics summary.
 *
 * @example
 * formatStats(stats) // stat lines
 */
export function formatStats(stats: MutationStats): string {
  return [
    `${chalk.bold('Mutation Points:')}     ${stats.totalMutationPoints}`,
    `${chalk.bold('Estimated Detected:')}  ${stats.estimatedDetected}`,
    `${chalk.bold('Estimated Survival:')}  ${stats.estimatedSurvival}`,
    `${chalk.bold('Avg Coverage:')}        ${coverageMeter(stats.averageCoverageScore)}`,
    `${chalk.bold('Files Below 50%:')}     ${stats.filesBelowThreshold}`,
    `${chalk.bold('Most Risky File:')}     ${stats.mostRiskyFile || '(none)'}`,
  ].join('\n')
}

// ─── formatRecommendations ────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(recs) // bullet list
 */
export function formatRecommendations(recs: string[]): string {
  return recs.map((r) => `  ${chalk.yellow('•')} ${r}`).join('\n')
}

// ─── formatMutationOutput ─────────────────────────────────────────────────────

/**
 * Format full mutation result for terminal.
 *
 * @example
 * formatMutationOutput(result) // full output
 */
export function formatMutationOutput(result: MutationResult): string {
  const sections: string[] = []

  sections.push(chalk.bold.cyan('\n🧬 Mutation Statistics'))
  sections.push(formatStats(result.stats))

  sections.push(chalk.bold.cyan('\n📊 Mutation Type Distribution'))
  sections.push(formatTypeDistribution(result.stats.mutationTypes))

  if (result.files.length > 0) {
    sections.push(chalk.bold.cyan('\n📁 Per-File Coverage'))
    sections.push(formatCoverageTable(result.files))
  }

  if (result.riskyMutations.length > 0) {
    sections.push(chalk.bold.cyan('\n⚠️ Risky Mutations'))
    sections.push(formatMutationsTable(result.riskyMutations.slice(0, 15)))
  }

  sections.push(chalk.bold.cyan('\n💡 Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── formatMutationJson ───────────────────────────────────────────────────────

/**
 * Format mutation result as JSON.
 *
 * @example
 * formatMutationJson(result) // JSON string
 */
export function formatMutationJson(result: MutationResult): string {
  return JSON.stringify({
    stats: result.stats,
    files: result.files.map((f) => ({
      file: f.file, score: f.coverageScore, mutations: f.totalMutations, risky: f.riskyMutations.length,
    })),
    riskyCount: result.riskyMutations.length,
    recommendations: result.recommendations,
  }, null, 2)
}
