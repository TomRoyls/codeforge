import chalk from 'chalk'
import type { TangleMetrics, TangleCluster, TangleResult, TangleStats } from './tangle-helpers.js'

// ─── classificationColor ──────────────────────────────────────────────────────

/**
 * Map classification to chalk color.
 *
 * @example
 * classificationColor('clean') // chalk.green
 */
export function classificationColor(classification: TangleMetrics['classification']): string {
  switch (classification) {
    case 'clean': return chalk.green(classification)
    case 'minor-tangle': return chalk.yellow(classification)
    case 'tangled': return chalk.rgb(255, 165, 0)(classification)
    case 'spaghetti': return chalk.red(classification)
  }
}

// ─── scoreBar ─────────────────────────────────────────────────────────────────

/**
 * Render a 10-char score bar.
 *
 * @example
 * scoreBar(50) // '█████     '
 */
export function scoreBar(score: number): string {
  const filled = Math.round(score / 10)
  const empty = 10 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  if (score < 20) return chalk.green(bar)
  if (score < 40) return chalk.yellow(bar)
  if (score < 65) return chalk.rgb(255, 165, 0)(bar)
  return chalk.red(bar)
}

// ─── formatTangleTable ────────────────────────────────────────────────────────

/**
 * Format file metrics as table.
 *
 * @example
 * formatTangleTable(metrics) // tabular string
 */
export function formatTangleTable(files: TangleMetrics[]): string {
  if (files.length === 0) return '  (no files)'

  const header = chalk.bold('  File                              Score  Bar         Concerns  RTC  Classification')
  const sep = chalk.gray('  ' + '─'.repeat(90))
  const rows = files.map((f) => {
    const file = f.file.length > 33 ? '...' + f.file.slice(-30) : f.file.padEnd(33)
    const bar = scoreBar(f.tanglingScore)
    return `  ${file}  ${String(f.tanglingScore).padStart(5)}  ${bar}  ${String(f.concernCount).padStart(8)}  ${String(f.reasonToChange).padStart(3)}  ${classificationColor(f.classification)}`
  })

  return [header, sep, ...rows].join('\n')
}

// ─── formatConcernBreakdown ───────────────────────────────────────────────────

/**
 * Format concern details for a single file.
 *
 * @example
 * formatConcernBreakdown(metrics) // concern detail string
 */
export function formatConcernBreakdown(metrics: TangleMetrics): string {
  if (metrics.concerns.length === 0) return '  (no concerns detected)'

  const lines = metrics.concerns.map((c) => {
    const range = c.lineRange[0] > 0 ? `L${c.lineRange[0]}-${c.lineRange[1]}` : 'imports only'
    const imports = c.relatedImports.length > 0 ? ` imports: ${c.relatedImports.join(', ')}` : ''
    return `  ${chalk.cyan(c.name.padEnd(15))} evidence:${c.evidence.length}  fns:${c.functionCount}  ${range}${imports}`
  })

  return lines.join('\n')
}

// ─── formatClusters ───────────────────────────────────────────────────────────

/**
 * Format tangle clusters.
 *
 * @example
 * formatClusters(clusters) // cluster detail string
 */
export function formatClusters(clusters: TangleCluster[]): string {
  if (clusters.length === 0) return '  (no clusters found)'

  return clusters.map((c, i) => {
    const files = c.files.map((f) => `    - ${f}`).join('\n')
    return `  ${chalk.bold(`Cluster ${i + 1}`)} (score: ${c.tanglingScore})\n${files}\n    Shared: ${c.sharedConcerns.join(', ')}\n    ${chalk.gray(c.description)}`
  }).join('\n\n')
}

// ─── formatScoreDistribution ──────────────────────────────────────────────────

/**
 * Format score distribution histogram.
 *
 * @example
 * formatScoreDistribution(files) // histogram string
 */
export function formatScoreDistribution(files: TangleMetrics[]): string {
  const buckets = [0, 0, 0, 0]
  for (const f of files) {
    if (f.tanglingScore < 20) buckets[0] = (buckets[0] ?? 0) + 1
    else if (f.tanglingScore < 40) buckets[1] = (buckets[1] ?? 0) + 1
    else if (f.tanglingScore < 65) buckets[2] = (buckets[2] ?? 0) + 1
    else buckets[3] = (buckets[3] ?? 0) + 1
  }

  const labels = [
    { label: 'Clean (0-19)', color: chalk.green },
    { label: 'Minor (20-39)', color: chalk.yellow },
    { label: 'Tangled (40-64)', color: chalk.rgb(255, 165, 0) },
    { label: 'Spaghetti (65+)', color: chalk.red },
  ]

  const maxVal = Math.max(...buckets, 1)

  return labels.map((l, i) => {
    const count = buckets[i]!
    const barLen = Math.round((count / maxVal) * 20)
    const bar = l.color('█'.repeat(barLen))
    return `  ${l.label.padEnd(18)} ${bar} ${count}`
  }).join('\n')
}

// ─── formatStats ──────────────────────────────────────────────────────────────

/**
 * Format stats summary.
 *
 * @example
 * formatStats(stats) // stat lines
 */
export function formatStats(stats: TangleStats): string {
  return [
    `${chalk.bold('Total Files:')}          ${stats.totalFiles}`,
    `${chalk.bold('Avg Tangling Score:')}   ${stats.averageTanglingScore}`,
    `${chalk.bold('Clean Files:')}          ${stats.cleanFiles}`,
    `${chalk.bold('Tangled Files:')}        ${stats.tangledFiles}`,
    `${chalk.bold('Spaghetti Files:')}      ${stats.spaghettiFiles}`,
    `${chalk.bold('Most Tangled:')}         ${stats.mostTangledFile}`,
    `${chalk.bold('Cleanest File:')}        ${stats.cleanestFile}`,
    `${chalk.bold('Avg Concerns/File:')}    ${stats.averageConcernsPerFile}`,
    `${chalk.bold('Avg Reasons/Change:')}   ${stats.averageReasonsToChange}`,
  ].join('\n')
}

// ─── formatRecommendations ────────────────────────────────────────────────────

/**
 * Format recommendations as bullet list.
 *
 * @example
 * formatRecommendations(recs) // bullet list
 */
export function formatRecommendations(recs: string[]): string {
  return recs.map((r) => `  ${chalk.yellow('•')} ${r}`).join('\n')
}

// ─── formatTangleOutput ───────────────────────────────────────────────────────

/**
 * Format full tangle result for terminal.
 *
 * @example
 * formatTangleOutput(result) // full output
 */
export function formatTangleOutput(result: TangleResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(chalk.bold.cyan('\n📊 Tangle Statistics'))
  sections.push(formatStats(result.stats))

  sections.push(chalk.bold.cyan('\n📈 Score Distribution'))
  sections.push(formatScoreDistribution(result.files))

  sections.push(chalk.bold.cyan('\n🗂️ File Scores'))
  sections.push(formatTangleTable(result.files))

  if (verbose && result.files.some((f) => f.concerns.length > 0)) {
    sections.push(chalk.bold.cyan('\n🔍 Concern Breakdown'))
    for (const f of result.files) {
      if (f.concerns.length > 0) {
        sections.push(chalk.bold(`  ${f.file} (${classificationColor(f.classification)})`))
        sections.push(formatConcernBreakdown(f))
      }
    }
  }

  if (result.clusters.length > 0) {
    sections.push(chalk.bold.cyan('\n🔗 Tangle Clusters'))
    sections.push(formatClusters(result.clusters))
  }

  sections.push(chalk.bold.cyan('\n💡 Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── formatTangleJson ─────────────────────────────────────────────────────────

/**
 * Format tangle result as JSON.
 *
 * @example
 * formatTangleJson(result) // JSON string
 */
export function formatTangleJson(result: TangleResult): string {
  return JSON.stringify(result, (_key, value) => {
    if (value instanceof Map) return Object.fromEntries(value)
    return value
  }, 2)
}
