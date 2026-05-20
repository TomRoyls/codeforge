import chalk from 'chalk'
import type { VineyardResult, Vintage, Blend, Terroir, VineyardStats } from './vineyard-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function classificationColor(c: string): string {
  if (c === 'grand-cru') return chalk.rgb(128, 0, 128)(c)
  if (c === 'premier-cru') return chalk.blue(c)
  if (c === 'cru-bourgeois') return chalk.cyan(c)
  if (c === 'table-wine') return chalk.yellow(c)
  return chalk.red(c)
}

function overallColor(o: string): string {
  if (o === 'legendary') return chalk.rgb(218, 165, 32)(o)
  if (o === 'excellent') return chalk.green(o)
  if (o === 'good') return chalk.blue(o)
  if (o === 'mediocre') return chalk.yellow(o)
  return chalk.red(o)
}

function blendGradeColor(g: string): string {
  if (g === 'exceptional-blend') return chalk.green(g)
  if (g === 'well-blended') return chalk.blue(g)
  if (g === 'balanced') return chalk.cyan(g)
  if (g === 'rough-blend') return chalk.yellow(g)
  return chalk.red(g)
}

function influenceColor(i: string): string {
  if (i === 'elevating') return chalk.green(i)
  if (i === 'supportive') return chalk.blue(i)
  if (i === 'neutral') return chalk.dim(i)
  return chalk.red(i)
}

// ─── Vintage Formatting ─────────────────────────────────────────────────────────

function formatVintage(v: Vintage): string {
  const corked = v.isCorked ? chalk.red(' [corked]') : ''
  const vinegar = v.isVinegar ? chalk.magenta(' [vinegar]') : ''
  return `  ${chalk.bold(v.file)} ${classificationColor(v.classification)} ${chalk.dim(v.year)} q:${scoreColor(v.quality)} b:${scoreColor(v.body)} c:${scoreColor(v.clarity)} f:${scoreColor(v.finish)} bal:${scoreColor(v.balance)} age:${scoreColor(v.agingPotential)}${corked}${vinegar}`
}

// ─── Blend Formatting ──────────────────────────────────────────────────────────

function formatBlend(b: Blend): string {
  return `  ${chalk.bold(b.name)} ${blendGradeColor(b.grade)} h:${scoreColor(b.harmony)} bal:${scoreColor(b.balance)} cx:${scoreColor(b.complexity)} (${b.components.length} components)`
}

// ─── Terroir Formatting ─────────────────────────────────────────────────────────

function formatTerroir(t: Terroir): string {
  const chars = t.characteristics.length > 0 ? chalk.dim(`[${t.characteristics.join(', ')}]`) : ''
  return `  ${chalk.bold(t.name)} ${influenceColor(t.influence)} q:${scoreColor(t.avgQuality)} (${t.files.length} files) ${chars}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

function formatStats(stats: VineyardStats): string {
  return [
    `  Vintage: ${overallColor(stats.overallVintage)} | Cellar: ${scoreColor(stats.cellarRating)} | Aging: ${scoreColor(stats.agingIndex)} | Blend: ${scoreColor(stats.blendQuality)}`,
    `  Quality: ${scoreColor(stats.avgQuality)} | Body: ${scoreColor(stats.avgBody)} | Clarity: ${scoreColor(stats.avgClarity)} | Finish: ${scoreColor(stats.avgFinish)} | Balance: ${scoreColor(stats.avgBalance)}`,
    `  Grand Cru: ${chalk.green(String(stats.grandCruCount))} | Vinegar: ${chalk.red(String(stats.vinegarCount))} | Corked: ${chalk.red(String(stats.corkedCount))} | Total: ${stats.totalVintages}`,
    `  Blends: ${stats.totalBlends} (${chalk.green(String(stats.exceptionalBlends))} exceptional, ${chalk.red(String(stats.mismatchedBlends))} mismatched) | Terroirs: ${stats.totalTerroirs}`,
    `  Best Terroir: ${chalk.green(stats.bestTerroir)} | Worst Terroir: ${chalk.red(stats.worstTerroir)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────────

/**
 * Format vineyard result as a table
 * @example
 * formatVineyardTable(result, false) // string
 */
export function formatVineyardTable(result: VineyardResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🍷 Vineyard - Code Vintage & Quality Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🍾 Vintages'))
  if (result.vintages.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.vintages : result.vintages.slice(0, 10)
    for (const v of display) {
      lines.push(formatVintage(v))
      if (verbose && v.tastingNotes.length > 0) {
        for (const note of v.tastingNotes) {
          lines.push(`    ${chalk.dim('-')} ${chalk.dim(note)}`)
        }
      }
    }
    if (!verbose && result.vintages.length > 10) {
      lines.push(chalk.dim(`  ... and ${result.vintages.length - 10} more`))
    }
  }
  lines.push('')

  if (result.blends.length > 0) {
    lines.push(chalk.bold('🫗 Blends'))
    for (const b of result.blends) {
      lines.push(formatBlend(b))
      if (verbose && b.tastingNotes.length > 0) {
        for (const note of b.tastingNotes) {
          lines.push(`    ${chalk.dim('-')} ${chalk.dim(note)}`)
        }
      }
    }
    lines.push('')
  }

  if (result.terroirs.length > 0) {
    lines.push(chalk.bold('🌍 Terroirs'))
    for (const t of result.terroirs) {
      lines.push(formatTerroir(t))
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

// ─── JSON Formatter ────────────────────────────────────────────────────────────

/**
 * Format vineyard result as JSON
 * @example
 * formatVineyardJson(result) // string
 */
export function formatVineyardJson(result: VineyardResult): string {
  return JSON.stringify(result, null, 2)
}
