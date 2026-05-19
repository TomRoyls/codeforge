import chalk from 'chalk'

import type { EntropyDistribution, EntropyResult, EntropyStats, FileEntropy } from './entropy-helpers.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function padRight(str: string, len: number): string {
  return str.length >= len ? str : str + ' '.repeat(len - str.length)
}

function classificationBadge(c: string): string {
  switch (c) {
    case 'very-high': return chalk.red(' V-HIGH ')
    case 'high': return chalk.rgb(255, 165, 0)(' HIGH ')
    case 'normal': return chalk.green(' NORM ')
    default: return chalk.gray(' LOW ')
  }
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + '...' : str
}

// ─── Entropy Table ────────────────────────────────────────────────────────────

/**
 * Format file entropy as a table.
 *
 * @example
 * formatEntropyTable(files) // 'File  Overall  Char  Token  Line  Name  Class'
 */
export function formatEntropyTable(files: FileEntropy[]): string {
  if (files.length === 0) return chalk.gray('  No files analyzed.')

  const lines: string[] = []
  lines.push(chalk.bold('\n  Code Entropy Analysis'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────────────'))
  lines.push(`  ${chalk.bold(padRight('File', 30))} ${chalk.bold(padRight('Overall', 10))} ${chalk.bold(padRight('Char', 8))} ${chalk.bold(padRight('Token', 8))} ${chalk.bold(padRight('Line', 8))} ${chalk.bold(padRight('Name', 8))} ${chalk.bold('Class')}`)

  for (const f of files.slice(0, 25)) {
    const file = truncate(f.file, 28)
    const flag = f.isAnomalous ? chalk.red('!') : ' '
    lines.push(`  ${flag}${padRight(file, 29)} ${padRight(String(f.metrics.overallEntropy), 10)} ${padRight(String(f.metrics.characterEntropy), 8)} ${padRight(String(f.metrics.tokenEntropy), 8)} ${padRight(String(f.metrics.lineLengthEntropy), 8)} ${padRight(String(f.metrics.namingEntropy), 8)} ${classificationBadge(f.metrics.classification)}`)
  }

  if (files.length > 25) {
    lines.push(`  ${chalk.gray(`... and ${files.length - 25} more`)}`)
  }

  return lines.join('\n')
}

// ─── Distribution Histogram ───────────────────────────────────────────────────

/**
 * Format entropy distribution as ASCII histogram.
 *
 * @example
 * formatDistributionHistogram(distribution) // 'Avg Char: 4.5  Avg Token: 6.0  ...'
 */
export function formatDistributionHistogram(dist: EntropyDistribution): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n  Entropy Distribution'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────'))

  const metrics = [
    { label: 'Character', value: dist.averageCharacterEntropy },
    { label: 'Token', value: dist.averageTokenEntropy },
    { label: 'Line Len', value: dist.averageLineLengthEntropy },
    { label: 'Naming', value: dist.averageNamingEntropy },
  ]

  for (const m of metrics) {
    const barLen = Math.min(Math.round(m.value), 8)
    const bar = chalk.cyan('█'.repeat(barLen)) + chalk.gray('░'.repeat(8 - barLen))
    lines.push(`  ${padRight(m.label, 12)} ${bar} ${chalk.bold(String(m.value))}`)
  }

  lines.push(`  ${chalk.gray(`StdDev: ${dist.standardDeviation}  Range: [${dist.minEntropy}, ${dist.maxEntropy}]`)}`)

  return lines.join('\n')
}

// ─── Anomalous Files ──────────────────────────────────────────────────────────

/**
 * Format anomalous file warnings.
 *
 * @example
 * formatAnomalousFiles(anomalous) // '! file.ts: V-HIGH entropy - may be obfuscated'
 */
export function formatAnomalousFiles(anomalous: FileEntropy[]): string {
  if (anomalous.length === 0) return ''

  const lines: string[] = []
  lines.push(chalk.bold('\n  Anomalous Files'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────'))

  for (const f of anomalous.slice(0, 10)) {
    lines.push(`  ${chalk.red('!')} ${chalk.bold(f.file)} (entropy: ${f.metrics.overallEntropy}, score: ${f.anomalyScore})`)
    if (f.anomalyReason) {
      lines.push(`    ${chalk.gray(f.anomalyReason)}`)
    }
  }

  return lines.join('\n')
}

// ─── Entropy Spectrum ─────────────────────────────────────────────────────────

/**
 * Format entropy spectrum visualization.
 *
 * @example
 * formatEntropySpectrum(files) // visual spectrum of file entropies
 */
export function formatEntropySpectrum(files: FileEntropy[]): string {
  if (files.length === 0) return ''

  const lines: string[] = []
  lines.push(chalk.bold('\n  Entropy Spectrum'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────'))
  lines.push(chalk.gray('  0         2         4         6         8'))
  lines.push(chalk.gray('  |.........|.........|.........|.........|'))

  for (const f of files.slice(0, 15)) {
    const pos = Math.min(Math.round(f.metrics.overallEntropy * 4), 36)
    const dot = f.isAnomalous ? chalk.red('●') : chalk.green('·')
    const prefix = ' '.repeat(pos)
    const name = truncate(f.file, 15)
    lines.push(`  ${prefix}${dot} ${chalk.gray(name)} (${f.metrics.overallEntropy})`)
  }

  return lines.join('\n')
}

// ─── Stats Line ───────────────────────────────────────────────────────────────

/**
 * Format stats summary line.
 *
 * @example
 * formatStatsLine(stats) // 'Files: 20  Avg: 4.5  Anomalous: 2  ...'
 */
export function formatStatsLine(stats: EntropyStats): string {
  return chalk.gray(`\n  Files: ${stats.totalFiles}  Avg Entropy: ${stats.averageEntropy}  Anomalous: ${stats.anomalousCount}  Low: ${stats.lowEntropyCount}  High: ${stats.highEntropyCount}`)
}

// ─── Table Format ─────────────────────────────────────────────────────────────

/**
 * Format complete entropy result as table output.
 *
 * @example
 * formatEntropyResultTable(result, false) // full dashboard output
 */
export function formatEntropyResultTable(result: EntropyResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(formatEntropyTable(result.files))
  sections.push(formatDistributionHistogram(result.distribution))
  sections.push(formatStatsLine(result.stats))

  if (verbose) {
    sections.push(formatEntropySpectrum(result.files))
  }

  if (result.anomalousFiles.length > 0) {
    sections.push(formatAnomalousFiles(result.anomalousFiles))
  }

  if (result.recommendations.length > 0) {
    sections.push(chalk.bold('\n  Recommendations'))
    sections.push(chalk.gray('  ────────────────────────────────────────────────────'))
    for (const rec of result.recommendations) {
      sections.push(`  ${chalk.gray('•')} ${rec}`)
    }
  }

  return sections.join('\n') + '\n'
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format entropy result as JSON.
 *
 * @example
 * formatEntropyJson(result) // '{"files":[...]...}'
 */
export function formatEntropyJson(result: EntropyResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV Format ───────────────────────────────────────────────────────────────

/**
 * Format entropy result as CSV.
 *
 * @example
 * formatEntropyCsv(result) // 'file,overall,character,token,...'
 */
export function formatEntropyCsv(result: EntropyResult): string {
  const lines: string[] = ['file,overall,character,token,lineLength,naming,classification,lines,size,anomalyScore']

  for (const f of result.files) {
    lines.push(`${f.file},${f.metrics.overallEntropy},${f.metrics.characterEntropy},${f.metrics.tokenEntropy},${f.metrics.lineLengthEntropy},${f.metrics.namingEntropy},${f.metrics.classification},${f.lines},${f.size},${f.anomalyScore}`)
  }

  return lines.join('\n')
}
