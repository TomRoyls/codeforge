import chalk from 'chalk'
import type { MagnifyingLensResult, GemstoneInspection, GemDisplay } from './magnifying-lens-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function gemColor(g: string): string {
  switch (g) {
    case 'diamond': return chalk.rgb(185, 242, 255)(g)
    case 'ruby': return chalk.rgb(224, 17, 95)(g)
    case 'sapphire': return chalk.blue(g)
    case 'emerald': return chalk.green(g)
    case 'topaz': return chalk.rgb(255, 183, 77)(g)
    case 'opal': return chalk.rgb(167, 139, 250)(g)
    case 'quartz': return chalk.rgb(200, 200, 200)(g)
    case 'glass': return chalk.dim(g)
    default: return chalk.dim(g)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'flawless': return chalk.rgb(255, 215, 0)(c)
    case 'excellent': return chalk.green(c)
    case 'very-good': return chalk.blue(c)
    case 'good': return chalk.cyan(c)
    case 'fair': return chalk.yellow(c)
    case 'poor': return chalk.rgb(255, 165, 0)(c)
    case 'damaged': return chalk.red(c)
    case 'shattered': return chalk.rgb(139, 0, 0)(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-gemologist': return chalk.rgb(255, 215, 0)(g)
    case 'gemologist': return chalk.green(g)
    case 'appraiser': return chalk.blue(g)
    case 'jeweler': return chalk.yellow(g)
    case 'amateur': return chalk.rgb(255, 165, 0)(g)
    case 'blind': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function displayColor(d: string): string {
  switch (d) {
    case 'museum': return chalk.rgb(255, 215, 0)(d)
    case 'gallery': return chalk.green(d)
    case 'collection': return chalk.blue(d)
    case 'display': return chalk.cyan(d)
    case 'pawn-shop': return chalk.yellow(d)
    case 'rubble': return chalk.red(d)
    default: return chalk.dim(d)
  }
}

// ─── Gem Formatting ──────────────────────────────────────────────────────────

function formatGem(g: GemstoneInspection, verbose: boolean): string {
  const inc = g.inclusions.length > 0 ? chalk.red(`+${g.inclusions.length}`) : chalk.green('clean')
  const line = ` ${chalk.bold(g.file)} ${gemColor(g.gemType)} ${conditionColor(g.condition)} ${g.clarityGrade} ${g.cutGrade} ${g.colorGrade} clarity:${scoreColor(g.clarity)} brilliance:${scoreColor(g.brilliance)} cut:${scoreColor(g.cutQuality)} ${inc}`

  if (!verbose) return line
  const details = [line]
  details.push(`    carat:${scoreColor(g.caratWeight)} facet:${scoreColor(g.facetPrecision)} hardness:${scoreColor(g.hardness)} luster:${scoreColor(g.luster)} q:${scoreColor(g.qualityScore)}`)
  if (g.inclusions.length > 0) {
    const bySev = g.inclusions.slice(0, 5).map(i => `${i.type}:${i.severity}`)
    details.push(`    inclusions: ${bySev.join(', ')}${g.inclusions.length > 5 ? ' ...' : ''}`)
  }
  return details.join('\n')
}

// ─── Display Formatting ──────────────────────────────────────────────────────

function formatDisplay(d: GemDisplay, verbose: boolean): string {
  const line = `  ${chalk.bold(d.directory)} ${displayColor(d.displayGrade)} quality:${scoreColor(d.displayQuality)} flawless:${d.flawlessCount} damaged:${d.damagedCount} inclusions:${d.totalInclusions}`
  if (!verbose) return line
  const details = [line]
  details.push(`    clarity:${scoreColor(d.avgClarity)} brilliance:${scoreColor(d.avgBrilliance)} cut:${scoreColor(d.avgCutQuality)} carat:${scoreColor(d.avgCaratWeight)} gem:${d.dominantGemType}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format magnifying lens result as a table
 * @example
 * formatMagnifyingLensTable(result, false) // string
 */
export function formatMagnifyingLensTable(result: MagnifyingLensResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n💎 Magnifying Lens - Code Detail Scrutiny\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🔍 Gemstone Inspections'))
  if (result.gems.length === 0) {
    lines.push(chalk.dim('  No files inspected.'))
  } else {
    const display = verbose ? result.gems : result.gems.slice(0, 15)
    for (const g of display) {
      lines.push(formatGem(g, verbose))
    }
    if (!verbose && result.gems.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.gems.length - 15} more`))
    }
  }
  lines.push('')

  if (result.displays.length > 0) {
    lines.push(chalk.bold('🏛️ Gem Displays'))
    for (const d of result.displays) {
      lines.push(formatDisplay(d, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Statistics'))
  const s = result.stats
  lines.push(`  Grade: ${gradeColor(s.gemologistGrade)} | Brilliance: ${scoreColor(s.overallBrilliance)} | Flawless: ${chalk.rgb(255, 215, 0)(String(s.flawlessGems))} | Diamond: ${chalk.cyan(String(s.diamondFiles))} | Glass: ${chalk.dim(String(s.glassFiles))} | Inclusions: ${s.totalInclusions}`)
  lines.push(`  Finest: ${chalk.green(s.finestGem)} | Worst: ${chalk.red(s.worstGem)} | Heaviest: ${chalk.blue(s.heaviestGem)} | Brilliant: ${chalk.yellow(s.mostBrilliant)}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format magnifying lens result as JSON
 * @example
 * formatMagnifyingLensJson(result) // string
 */
export function formatMagnifyingLensJson(result: MagnifyingLensResult): string {
  return JSON.stringify(result, null, 2)
}
