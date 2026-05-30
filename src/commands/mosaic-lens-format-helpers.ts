import chalk from 'chalk'
import type { MosaicLensResult, LensView, FilteredFile, LensComparison, MosaicLensStats } from './mosaic-lens-helpers.js'

// ─── Color Utilities ──────────────────────────────────────────────────────────

function lensColor(lens: string, text: string): string {
  if (lens === 'correctness') return chalk.green(text)
  if (lens === 'maintainability') return chalk.blue(text)
  if (lens === 'performance') return chalk.yellow(text)
  if (lens === 'readability') return chalk.cyan(text)
  if (lens === 'robustness') return chalk.rgb(255, 100, 100)(text)
  return chalk.white(text)
}


function classificationColor(c: string): string {
  if (c === 'resilient') return chalk.green(c)
  if (c === 'balanced') return chalk.blue(c)
  if (c === 'lopsided') return chalk.yellow(c)
  return chalk.red(c)
}

function gradeColor(g: string): string {
  if (g === 'panoramic') return chalk.green(g)
  if (g === 'focused') return chalk.blue(g)
  if (g === 'tinted') return chalk.cyan(g)
  if (g === 'blurred') return chalk.yellow(g)
  return chalk.red(g)
}

function scoreBar(v: number): string {
  const filled = Math.round(v / 5)
  return chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(20 - filled))
}

// ─── View Formatting ──────────────────────────────────────────────────────────

function formatViews(views: LensView[], verbose: boolean): string {
  if (views.length === 0) return chalk.dim('  No lens views generated.')

  const byLens = new Map<string, LensView>()
  for (const v of views) {
    const existing = byLens.get(v.lens)
    if (!existing || v.score < existing.score) byLens.set(v.lens, v)
  }

  const display = verbose ? Array.from(byLens.values()) : Array.from(byLens.values()).slice(0, 5)

  return display.map(v => {
    const findings = v.findings.length > 0 ? chalk.dim(` (${v.findings.length} findings)`) : ''
    const highlights = v.highlights.slice(0, 3).map(h => chalk.green(`  ✓ ${h}`)).join('\n')
    const concerns = v.concerns.slice(0, 3).map(c => chalk.red(`  ✗ ${c}`)).join('\n')
    return [
      `  ${lensColor(v.lens, v.lens)} ${chalk.white(String(v.score))}/100${findings}`,
      highlights,
      concerns,
    ].filter(Boolean).join('\n')
  }).join('\n\n')
}

// ─── File Formatting ──────────────────────────────────────────────────────────

function formatFiles(files: FilteredFile[], verbose: boolean): string {
  if (files.length === 0) return chalk.dim('  No files analyzed.')
  const display = verbose ? files : files.slice(0, 10)
  return display.map((f, i) => {
    const scores = Object.entries(f.lensScores).map(([l, s]) => `${lensColor(l, l.charAt(0).toUpperCase())}:${s}`).join(' ')
    return [
      `  ${chalk.bold(`${i + 1}.`)} ${chalk.bold(f.file)} ${classificationColor(f.classification)}`,
      `     Avg: ${chalk.white(String(f.avgScore))} | Best: ${lensColor(f.dominantLens, f.dominantLens)} | Worst: ${lensColor(f.weakestLens, f.weakestLens)} | Gap: ${chalk.white(String(f.disparity))}`,
      `     ${scores}`,
    ].join('\n')
  }).join('\n\n')
}

// ─── Comparison Formatting ────────────────────────────────────────────────────

function formatComparison(comp: LensComparison): string {
  return [
    `  Best Lens: ${lensColor(comp.bestLens, comp.bestLens)} | Worst Lens: ${lensColor(comp.worstLens, comp.worstLens)}`,
    `  Most Correlated: ${lensColor(comp.mostCorrelated[0], comp.mostCorrelated[0])} ↔ ${lensColor(comp.mostCorrelated[1], comp.mostCorrelated[1])}`,
    `  Most Divergent: ${lensColor(comp.mostDivergent[0], comp.mostDivergent[0])} ↔ ${lensColor(comp.mostDivergent[1], comp.mostDivergent[1])}`,
    comp.surpriseFiles.length > 0 ? `  Surprise Files: ${comp.surpriseFiles.map(f => chalk.bold(f)).join(', ')}` : '  No surprise files',
  ].join('\n')
}

// ─── Stats Formatting ─────────────────────────────────────────────────────────

function formatStats(stats: MosaicLensStats): string {
  const lensScores = Object.entries(stats.avgLensScores).map(([l, s]) => `${lensColor(l, l.charAt(0).toUpperCase())}:${s}`).join(' ')
  return [
    `  Overall: ${chalk.bold(String(stats.overallScore))}/100 | Views: ${chalk.white(String(stats.totalViews))} | Findings: ${chalk.white(String(stats.totalFindings))} (${chalk.red(String(stats.errorFindings))} err, ${chalk.yellow(String(stats.warningFindings))} warn)`,
    `  Lens Scores: ${lensScores}`,
    `  Balanced: ${chalk.green(String(stats.balancedFiles))} | Lopsided: ${chalk.yellow(String(stats.lopsidedFiles))} | Avg Disparity: ${chalk.white(String(stats.avgDisparity))}`,
    `  Mosaic Clarity: ${scoreBar(stats.mosaicClarity)} ${chalk.white(String(stats.mosaicClarity))}`,
    `  Grade: ${gradeColor(stats.overallGrade)}`,
  ].join('\n')
}

// ─── Table Formatter ──────────────────────────────────────────────────────────

/**
 * Format mosaic lens result as a table
 * @example
 * formatMosaicLensTable(result, false) // string
 */
export function formatMosaicLensTable(result: MosaicLensResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🔮 Mosaic Lens — Multi-Perspective Code Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')
  lines.push(chalk.bold('🔍 Lens Views'))
  lines.push(formatViews(result.views, verbose))
  lines.push('')
  lines.push(chalk.bold('📂 Files'))
  lines.push(formatFiles(result.files, verbose))
  lines.push('')
  lines.push(chalk.bold('⚖️  Lens Comparison'))
  lines.push(formatComparison(result.comparison))
  lines.push('')
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(formatStats(result.stats))
  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    result.recommendations.forEach(r => lines.push(`  • ${r}`))
  }
  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ───────────────────────────────────────────────────────────

/**
 * Format mosaic lens result as JSON
 * @example
 * formatMosaicLensJson(result) // string
 */
export function formatMosaicLensJson(result: MosaicLensResult): string {
  return JSON.stringify(result, null, 2)
}
