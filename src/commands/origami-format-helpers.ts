import chalk from 'chalk'

import type {
  Fold,
  FoldPattern,
  FoldScore,
  OverallQuality,
  OrigamiResult,
  OrigamiStats,
  PatternQuality,
} from './origami-helpers.js'

// ─── Quality Colors ──────────────────────────────────────

const QUALITY_COLOR: Record<OverallQuality, (s: string) => string> = {
  masterwork: chalk.rgb(72, 199, 142),
  clean: chalk.rgb(120, 200, 120),
  average: chalk.rgb(200, 180, 80),
  rough: chalk.rgb(220, 150, 80),
  crumpled: chalk.rgb(220, 80, 80),
}

const PATTERN_QUALITY_COLOR: Record<PatternQuality, (s: string) => string> = {
  elegant: chalk.rgb(72, 199, 142),
  acceptable: chalk.rgb(200, 180, 80),
  messy: chalk.rgb(220, 150, 80),
  spaghetti: chalk.rgb(220, 80, 80),
}

// ─── Fold Type Badge ─────────────────────────────────────

/**
 * Format fold type as a badge.
 *
 * @example
 * formatFoldTypeBadge('function') // => '⚙ function'
 */
export function formatFoldTypeBadge(type: string): string {
  const symbols: Record<string, string> = {
    indent: '→',
    block: '▢',
    scope: '◈',
    conditional: '◇',
    loop: '↻',
    'try-catch': '⊕',
    class: '◆',
    function: '⚙',
    callback: 'λ',
  }
  return `${symbols[type] ?? '?'} ${type}`
}

/**
 * Format quality label with color.
 *
 * @example
 * formatQualityLabel('masterwork') // => colored 'masterwork'
 */
export function formatQualityLabel(quality: OverallQuality | PatternQuality): string {
  if (quality in QUALITY_COLOR) {
    return QUALITY_COLOR[quality as OverallQuality](quality)
  }
  return PATTERN_QUALITY_COLOR[quality as PatternQuality](quality)
}

/**
 * Format depth bar.
 *
 * @example
 * formatDepthBar(5) // => '▓▓▓▓▓░░░░░ depth:5'
 */
export function formatDepthBar(depth: number, maxDepth: number = 10): string {
  const width = 10
  const filled = Math.round((depth / maxDepth) * width)
  const empty = width - filled
  const bar = '▓'.repeat(filled) + '░'.repeat(empty)
  const color = depth >= 6 ? chalk.rgb(220, 80, 80) : depth >= 4 ? chalk.rgb(200, 180, 80) : chalk.rgb(72, 199, 142)
  return color(`${bar} depth:${depth}`)
}

/**
 * Format clean score bar.
 *
 * @example
 * formatCleanScoreBar(75) // => '▓▓▓▓▓▓▓░░░ 75'
 */
export function formatCleanScoreBar(score: number): string {
  const width = 10
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  const bar = '▓'.repeat(filled) + '░'.repeat(empty)
  const color = score >= 70 ? chalk.rgb(72, 199, 142) : score >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${score}`)
}

// ─── Fold Visualization ──────────────────────────────────

/**
 * Format ASCII fold tree visualization.
 *
 * @example
 * formatFoldTree(folds) // => indented tree
 */
export function formatFoldTree(folds: Fold[]): string {
  if (folds.length === 0) return 'No folds detected.'

  const lines: string[] = [chalk.bold('Fold Tree:')]
  for (const fold of folds.slice(0, 20)) {
    const indent = '  '.repeat(fold.depth - 1)
    const badge = formatFoldTypeBadge(fold.type)
    const score = formatCleanScoreBar(fold.cleanScore)
    lines.push(`${indent}├─ ${badge} L${fold.line} (${fold.lineCount} lines) ${score}`)
  }

  if (folds.length > 20) {
    lines.push(chalk.rgb(150, 150, 150)(`  ... and ${folds.length - 20} more folds`))
  }

  return lines.join('\n')
}

// ─── Pattern Gallery ─────────────────────────────────────

/**
 * Format fold pattern gallery.
 *
 * @example
 * formatPatternGallery(patterns) // => visual pattern overview
 */
export function formatPatternGallery(patterns: FoldPattern[]): string {
  if (patterns.length === 0) return 'No fold patterns detected.'

  const lines: string[] = [chalk.bold('Fold Pattern Gallery:')]

  for (const pattern of patterns) {
    const quality = formatQualityLabel(pattern.quality)
    const depth = pattern.avgDepth.toFixed(1)
    lines.push(`  ${chalk.bold(pattern.name)} — ${quality}`)
    lines.push(`    ${chalk.rgb(150, 150, 150)(pattern.description)}`)
    lines.push(`    Files: ${pattern.files.length} | Avg depth: ${depth} | Folds: ${pattern.foldCount}`)
    lines.push(`    ${chalk.rgb(200, 200, 200)(`→ ${pattern.suggestion}`)}`)
    lines.push('')
  }

  return lines.join('\n')
}

// ─── Score Table ─────────────────────────────────────────

/**
 * Format fold score table.
 *
 * @example
 * formatScoreTable(scores) // => table of file scores
 */
export function formatScoreTable(scores: FoldScore[]): string {
  if (scores.length === 0) return 'No fold scores.'

  const header = chalk.bold('File                           Folds  MaxD  AvgD  Clean  Unfold  Pattern')
  const separator = '─'.repeat(80)
  const rows = scores.map(s => {
    const file = s.file.substring(0, 28).padEnd(28)
    const folds = String(s.totalFolds).padStart(5)
    const maxD = String(s.maxDepth).padStart(5)
    const avgD = s.avgDepth.toFixed(1).padStart(5)
    const clean = formatCleanScoreBar(s.cleanScore)
    const unfold = String(s.unfoldability).padStart(6)
    const pattern = s.pattern
    return `${file} ${folds} ${maxD} ${avgD}  ${clean} ${unfold}  ${pattern}`
  })

  return [header, separator, ...rows].join('\n')
}

// ─── Depth Histogram ─────────────────────────────────────

/**
 * Format depth histogram.
 *
 * @example
 * formatDepthHistogram(folds) // => visual bar chart
 */
export function formatDepthHistogram(folds: Fold[]): string {
  if (folds.length === 0) return 'No depth data.'

  const depthCounts = new Map<number, number>()
  for (const fold of folds) {
    depthCounts.set(fold.depth, (depthCounts.get(fold.depth) ?? 0) + 1)
  }

  const maxCount = Math.max(...depthCounts.values())
  const lines: string[] = [chalk.bold('Depth Distribution:')]

  const maxDepth = Math.max(...depthCounts.keys())
  for (let d = 1; d <= maxDepth; d++) {
    const count = depthCounts.get(d) ?? 0
    const barWidth = Math.round((count / maxCount) * 20)
    const bar = '█'.repeat(barWidth) + '░'.repeat(20 - barWidth)
    const color = d >= 6 ? chalk.rgb(220, 80, 80) : d >= 4 ? chalk.rgb(200, 180, 80) : chalk.rgb(72, 199, 142)
    lines.push(`  D${d} ${color(bar)} ${count}`)
  }

  return lines.join('\n')
}

// ─── Stats Summary ───────────────────────────────────────

/**
 * Format origami stats.
 *
 * @example
 * formatOrigamiStats(stats) // => stats summary
 */
export function formatOrigamiStats(stats: OrigamiStats): string {
  const lines = [
    chalk.bold('Origami Statistics:'),
    `  Total folds: ${stats.totalFolds}`,
    `  Avg depth: ${stats.avgDepth} | Max depth: ${stats.maxDepth}`,
    `  Deepest file: ${stats.deepestFile || 'N/A'}`,
    `  Cleanest file: ${stats.cleanestFile || 'N/A'}`,
    `  Messiest file: ${stats.messiestFile || 'N/A'}`,
    `  Avg clean score: ${stats.avgCleanScore} | Avg unfoldability: ${stats.avgUnfoldability}`,
    `  Fold efficiency: ${stats.foldEfficiency}% | Unnecessary folds: ${stats.unnecessaryFolds}`,
    `  Complexity index: ${stats.foldComplexityIndex}`,
    `  Overall quality: ${formatQualityLabel(stats.overallFoldQuality)}`,
  ]

  const distEntries = Object.entries(stats.patternDistribution)
  if (distEntries.length > 0) {
    const dist = distEntries.map(([k, v]) => `${k}:${v}`).join(', ')
    lines.push(`  Pattern distribution: ${dist}`)
  }

  return lines.join('\n')
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatOrigamiRecommendations(['Extract deep folds']) // => bullet list
 */
export function formatOrigamiRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.rgb(72, 199, 142)('✓ Code folding is elegant — no origami concerns')
  const lines = [chalk.bold('🦢 Recommendations:')]
  for (const rec of recommendations) {
    lines.push(`  • ${rec}`)
  }
  return lines.join('\n')
}

// ─── Full Output ─────────────────────────────────────────

/**
 * Format full origami result as table.
 *
 * @example
 * formatOrigamiTable(result, false) // => full output
 */
export function formatOrigamiTable(result: OrigamiResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(chalk.bold('\nOrigami — Code Folding Analysis\n'))
  sections.push(formatOrigamiStats(result.stats))
  sections.push('')

  if (result.folds.length > 0 && verbose) {
    sections.push(formatFoldTree(result.folds))
    sections.push('')
  }

  if (result.scores.length > 0) {
    sections.push(chalk.bold('File Scores:'))
    sections.push(formatScoreTable(result.scores))
    sections.push('')
  }

  if (result.patterns.length > 0) {
    sections.push(formatPatternGallery(result.patterns))
  }

  if (result.folds.length > 0) {
    sections.push(formatDepthHistogram(result.folds))
    sections.push('')
  }

  sections.push(formatOrigamiRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── JSON Output ─────────────────────────────────────────

/**
 * Format origami result as JSON.
 *
 * @example
 * formatOrigamiJson(result) // => JSON string
 */
export function formatOrigamiJson(result: OrigamiResult): string {
  return JSON.stringify(result, null, 2)
}
