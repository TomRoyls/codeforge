import chalk from 'chalk'

import type { FileWeight, WeightDistribution, WeightResult, WeightStats } from './weight-helpers.js'

// ─── Category Badges ──────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, (s: string) => string> = {
  lightweight: chalk.rgb(80, 255, 120),
  medium: chalk.rgb(255, 255, 80),
  heavy: chalk.rgb(255, 180, 50),
  obese: chalk.rgb(255, 80, 80),
}

// ─── Format Weight Table ──────────────────────────────────────────────────────

/**
 * Format file weights as a table with score and category badge.
 *
 * @example
 * formatWeightTable(files) // formatted string
 */
export function formatWeightTable(files: FileWeight[]): string {
  if (files.length === 0) return chalk.rgb(100, 200, 150)('  No files analyzed.')

  const lines: string[] = [chalk.bold('\n  Import Weight Analysis\n')]

  const maxFileLen = Math.max(...files.map((f) => f.file.length), 10)

  for (const fw of files) {
    const catColor = CATEGORY_COLORS[fw.category] ?? chalk.white
    const badge = catColor(`[${fw.category.toUpperCase().padEnd(11)}]`)
    const file = chalk.white(fw.file.padEnd(maxFileLen))
    const score = catColor(`${String(fw.weightScore).padStart(3)}/100`)
    const info = chalk.rgb(150, 150, 150)(`direct:${fw.directImports} trans:${fw.transitiveImports} lines:${fw.transitiveLines}`)
    lines.push(`  ${badge} ${file} ${score} ${info}`)
  }

  return lines.join('\n')
}

// ─── Format Distribution Chart ────────────────────────────────────────────────

/**
 * Format weight distribution as an ASCII chart.
 *
 * @example
 * formatWeightDistribution({ lightweight: 5, medium: 3, heavy: 1, obese: 0 }) // chart
 */
export function formatWeightDistribution(dist: WeightDistribution): string {
  const lines: string[] = [chalk.bold('\n  Weight Distribution\n')]

  const entries: [string, number, (s: string) => string][] = [
    ['lightweight', dist.lightweight, chalk.rgb(80, 255, 120)],
    ['medium', dist.medium, chalk.rgb(255, 255, 80)],
    ['heavy', dist.heavy, chalk.rgb(255, 180, 50)],
    ['obese', dist.obese, chalk.rgb(255, 80, 80)],
  ]

  const maxCount = Math.max(...entries.map((e) => e[1]), 1)

  for (const [label, count, color] of entries) {
    const barWidth = Math.max(1, Math.round((count / maxCount) * 20))
    const bar = color('█'.repeat(barWidth))
    const name = label.padEnd(12)
    lines.push(`  ${color(name)} ${bar} ${count}`)
  }

  return lines.join('\n')
}

// ─── Format Heaviest Files ────────────────────────────────────────────────────

/**
 * Format heaviest files with import breakdown.
 *
 * @example
 * formatHeaviestFiles(heaviest) // formatted string
 */
export function formatHeaviestFiles(heaviest: FileWeight[]): string {
  if (heaviest.length === 0) return ''

  const lines: string[] = [chalk.bold('\n  Heaviest Files\n')]

  for (let i = 0; i < heaviest.length; i++) {
    const fw = heaviest[i]!
    const num = chalk.rgb(150, 150, 150)(`#${i + 1}`.padEnd(3))
    const catColor = CATEGORY_COLORS[fw.category] ?? chalk.white
    const score = catColor(`${fw.weightScore}/100`)
    lines.push(`  ${num} ${fw.file} ${score} (${fw.transitiveImports} transitive imports, ${fw.transitiveLines} lines)`)

    for (const imp of fw.imports.slice(0, 5)) {
      lines.push(`      ${chalk.rgb(150, 150, 150)(`├─ ${imp.importedFile} (${imp.transitiveCost} lines, depth ${imp.depth})`)}`)
    }
    if (fw.imports.length > 5) {
      lines.push(`      ${chalk.rgb(150, 150, 150)(`└─ ... and ${fw.imports.length - 5} more`)}`)
    }
  }

  return lines.join('\n')
}

// ─── Format Weight Heatmap ────────────────────────────────────────────────────

/**
 * Format weight heatmap grouped by directory.
 *
 * @example
 * formatWeightHeatmap(files) // formatted string
 */
export function formatWeightHeatmap(files: FileWeight[]): string {
  if (files.length === 0) return ''

  const dirMap = new Map<string, { total: number; count: number; max: number }>()
  for (const fw of files) {
    const dir = fw.file.includes('/') ? fw.file.substring(0, fw.file.lastIndexOf('/')) : '.'
    const entry = dirMap.get(dir) ?? { total: 0, count: 0, max: 0 }
    entry.total += fw.weightScore
    entry.count++
    entry.max = Math.max(entry.max, fw.weightScore)
    dirMap.set(dir, entry)
  }

  const lines: string[] = [chalk.bold('\n  Weight Heatmap by Directory\n')]

  const entries = [...dirMap.entries()].sort((a, b) => b[1].max - a[1].max)
  for (const [dir, data] of entries) {
    const avg = Math.round(data.total / data.count)
    let heatColor: (s: string) => string
    if (avg < 25) heatColor = chalk.rgb(80, 255, 120)
    else if (avg < 50) heatColor = chalk.rgb(255, 255, 80)
    else if (avg < 75) heatColor = chalk.rgb(255, 180, 50)
    else heatColor = chalk.rgb(255, 80, 80)

    const bar = heatColor('█'.repeat(Math.max(1, Math.round(avg / 5))))
    lines.push(`  ${dir.padEnd(30)} ${bar} avg:${avg} max:${data.max} (${data.count} files)`)
  }

  return lines.join('\n')
}

// ─── Format Stats Line ────────────────────────────────────────────────────────

/**
 * Format weight stats summary.
 *
 * @example
 * formatWeightStatsLine(stats) // 'Files: 10 | Avg Score: 35 | Heaviest: app.ts'
 */
export function formatWeightStatsLine(stats: WeightStats): string {
  return [
    `Files: ${stats.totalFiles}`,
    `Avg Imports: ${stats.averageDirectImports} direct / ${stats.averageTransitiveImports} transitive`,
    `Avg Score: ${stats.averageWeightScore}/100`,
    `Heaviest: ${stats.heaviestFile}`,
  ].join(' | ')
}

// ─── Format Recommendations ───────────────────────────────────────────────────

/**
 * Format recommendations list.
 *
 * @example
 * formatWeightRecommendations(recs) // formatted string
 */
export function formatWeightRecommendations(recs: string[]): string {
  if (recs.length === 0) return ''
  const lines: string[] = [chalk.bold('\n  Recommendations\n')]
  for (const r of recs) {
    lines.push(`  ${chalk.rgb(255, 200, 50)('→')} ${r}`)
  }
  return lines.join('\n')
}

// ─── Format Weight Result Table ───────────────────────────────────────────────

/**
 * Format the full weight result.
 *
 * @example
 * formatWeightResultTable(result, false) // complete formatted output
 */
export function formatWeightResultTable(result: WeightResult, verbose: boolean): string {
  const parts: string[] = []

  parts.push(formatWeightStatsLine(result.stats))
  parts.push(formatWeightDistribution(result.distribution))
  parts.push(formatHeaviestFiles(result.heaviest))

  if (verbose) {
    parts.push(formatWeightTable(result.files))
    parts.push(formatWeightHeatmap(result.files))
  }

  parts.push(formatWeightRecommendations(result.recommendations))

  return parts.join('\n')
}

// ─── Format Weight JSON ───────────────────────────────────────────────────────

/**
 * Format weight result as JSON.
 *
 * @example
 * formatWeightJson(result) // JSON string
 */
export function formatWeightJson(result: WeightResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Format Weight CSV ────────────────────────────────────────────────────────

/**
 * Format file weights as CSV.
 *
 * @example
 * formatWeightCsv(result) // CSV string
 */
export function formatWeightCsv(result: WeightResult): string {
  const header = 'file,directImports,transitiveImports,directLines,transitiveLines,weightScore,category'
  const rows = result.files.map((fw) =>
    [
      fw.file,
      fw.directImports,
      fw.transitiveImports,
      fw.directLines,
      fw.transitiveLines,
      fw.weightScore,
      fw.category,
    ].join(','),
  )
  return [header, ...rows].join('\n')
}
