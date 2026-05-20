import chalk from 'chalk'
import type { StillLifeResult, StillnessObject, StillLifeArrangement, StillLifeStats } from './still-life-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function stabilityColor(s: string): string {
  if (s === 'anchored') return chalk.green(s)
  if (s === 'resting') return chalk.blue(s)
  if (s === 'balanced') return chalk.cyan(s)
  if (s === 'precarious') return chalk.yellow(s)
  if (s === 'tipping') return chalk.rgb(255, 165, 0)(s)
  if (s === 'falling') return chalk.red(s)
  return chalk.red(s)
}

function positionColor(p: string): string {
  if (p === 'foreground') return chalk.rgb(255, 215, 0)(p)
  if (p === 'midground') return chalk.blue(p)
  if (p === 'background') return chalk.dim(p)
  if (p === 'highlight') return chalk.cyan(p)
  return chalk.dim(p)
}

function objectColor(o: string): string {
  if (o === 'vessel') return chalk.blue(o)
  if (o === 'flower') return chalk.magenta(o)
  if (o === 'fruit') return chalk.green(o)
  if (o === 'book') return chalk.cyan(o)
  if (o === 'candle') return chalk.rgb(255, 215, 0)(o)
  if (o === 'fabric') return chalk.magenta(o)
  if (o === 'utensil') return chalk.dim(o)
  return chalk.red(o)
}

function surfaceColor(s: string): string {
  if (s === 'polished') return chalk.green(s)
  if (s === 'smooth') return chalk.blue(s)
  if (s === 'textured') return chalk.cyan(s)
  if (s === 'rough') return chalk.yellow(s)
  if (s === 'cracked') return chalk.rgb(255, 165, 0)(s)
  return chalk.red(s)
}

function healthColor(h: string): string {
  if (h === 'masterwork') return chalk.rgb(255, 215, 0)(h)
  if (h === 'well-composed') return chalk.green(h)
  if (h === 'pleasant') return chalk.blue(h)
  if (h === 'mediocre') return chalk.yellow(h)
  if (h === 'disjointed') return chalk.rgb(255, 165, 0)(h)
  return chalk.red(h)
}

function gradeColor(g: string): string {
  if (g === 'rock') return chalk.green(g)
  if (g === 'stone') return chalk.blue(g)
  if (g === 'wood') return chalk.cyan(g)
  if (g === 'water') return chalk.yellow(g)
  if (g === 'wind') return chalk.rgb(255, 165, 0)(g)
  return chalk.red(g)
}

// ─── Object Formatting ───────────────────────────────────────────────────────

function formatObject(o: StillnessObject, verbose: boolean): string {
  const markers: string[] = []
  if (o.risks.length > 0) markers.push(chalk.red(`[${o.risks.length} risks]`))
  if (o.strengths.length > 0) markers.push(chalk.green(`[${o.strengths.length} strengths]`))
  if (o.composition.isFocalPoint) markers.push(chalk.rgb(255, 215, 0)('[focal]'))

  const line = `  ${chalk.bold(o.file)} still:${scoreColor(o.stillness)} vol:${scoreColor(100 - o.volatility)} frag:${scoreColor(100 - o.fragility)} comp:${scoreColor(o.composure)} bal:${scoreColor(o.balance)} ${stabilityColor(o.stability)} ${positionColor(o.position)} ${objectColor(o.objectType)} ${surfaceColor(o.surfaceQuality)}${markers.length > 0 ? ' ' + markers.join(' ') : ''}`

  if (!verbose) return line

  const details = [line]
  details.push(`    light:${o.lightExposure} shadow:${o.shadowDepth} weight:${o.weight}`)
  if (o.risks.length > 0) {
    details.push(`    risks: ${o.risks.map(r => chalk.red(r)).join(', ')}`)
  }
  if (o.strengths.length > 0) {
    details.push(`    strengths: ${o.strengths.map(s => chalk.green(s)).join(', ')}`)
  }
  return details.join('\n')
}

// ─── Arrangement Formatting ──────────────────────────────────────────────────

function formatArrangement(a: StillLifeArrangement, verbose: boolean): string {
  const line = `  ${chalk.bold(a.directory)} still:${scoreColor(a.overallStillness)} bal:${scoreColor(a.overallBalance)} comp:${scoreColor(a.overallComposure)} ${healthColor(a.health)} objects:${a.objects.length} ${a.arrangementType}`

  if (!verbose) return line

  const details = [line]
  details.push(`    focal:${a.focalPoint} cohesion:${scoreColor(a.cohesion)} light:${scoreColor(a.lightBalance)} balanced:${a.isBalanced ? chalk.green('yes') : chalk.red('no')}`)
  if (a.tensionPoints.length > 0) {
    details.push(`    tension: ${a.tensionPoints.join(', ')}`)
  }
  return details.join('\n')
}

// ─── Stats Formatting ────────────────────────────────────────────────────────

function formatStats(stats: StillLifeStats): string {
  return [
    `  Stillness Grade: ${gradeColor(stats.stillnessGrade)} | Arrangement Score: ${scoreColor(stats.arrangementScore)} | Balanced: ${stats.isOverallBalanced ? chalk.green('yes') : chalk.red('no')}`,
    `  Files: ${stats.totalFiles} | Arrangements: ${stats.totalArrangements}`,
    `  Avg Stillness: ${scoreColor(stats.avgStillness)} | Avg Volatility: ${scoreColor(100 - stats.avgVolatility)} | Avg Fragility: ${scoreColor(100 - stats.avgFragility)} | Avg Composure: ${scoreColor(stats.avgComposure)} | Avg Balance: ${scoreColor(stats.avgBalance)}`,
    `  Anchored: ${chalk.green(String(stats.anchoredFiles))} | Precarious: ${chalk.yellow(String(stats.precariousFiles))} | Shattered: ${chalk.red(String(stats.shatteredFiles))}`,
    `  Focal Points: ${stats.focalPoints} | Dominant: ${stats.dominantObjectType} (${stats.dominantPosition})`,
    `  Masterworks: ${chalk.rgb(255, 215, 0)(String(stats.masterworkArrangements))} | Chaotic: ${chalk.red(String(stats.chaoticArrangements))} | Light Balance: ${scoreColor(stats.lightBalance)}`,
    `  Best: ${chalk.green(stats.bestArrangement)} | Worst: ${chalk.red(stats.worstArrangement)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format still-life result as a table
 * @example
 * formatStillLifeTable(result, false) // string
 */
export function formatStillLifeTable(result: StillLifeResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🎨 Still Life - Code Stability Analysis\n'))
  lines.push(chalk.bold('═'.repeat(55)))
  lines.push('')

  lines.push(chalk.bold('🏺 Stillness Objects'))
  if (result.objects.length === 0) {
    lines.push(chalk.dim('  No objects found.'))
  } else {
    const display = verbose ? result.objects : result.objects.slice(0, 15)
    for (const o of display) {
      lines.push(formatObject(o, verbose))
    }
    if (!verbose && result.objects.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.objects.length - 15} more`))
    }
  }
  lines.push('')

  if (result.arrangements.length > 0) {
    lines.push(chalk.bold('🖼️ Arrangements'))
    for (const a of result.arrangements) {
      lines.push(formatArrangement(a, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Statistics'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format still-life result as JSON
 * @example
 * formatStillLifeJson(result) // string
 */
export function formatStillLifeJson(result: StillLifeResult): string {
  return JSON.stringify(result, null, 2)
}
