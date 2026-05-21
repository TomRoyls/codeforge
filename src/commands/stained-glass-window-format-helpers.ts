import chalk from 'chalk'
import type { StainedGlassWindowResult, WindowPane, WindowBay } from './stained-glass-window-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function glassColor(t: string): string {
  switch (t) {
    case 'transparent': return chalk.rgb(200, 230, 255)(t)
    case 'cathedral': return chalk.rgb(100, 150, 255)(t)
    case 'rippled': return chalk.cyan(t)
    case 'seedy': return chalk.yellow(t)
    case 'streaky': return chalk.magenta(t)
    case 'opaque': return chalk.gray(t)
    default: return chalk.dim(t)
  }
}

function illuminationColor(i: string): string {
  switch (i) {
    case 'brilliant': return chalk.rgb(255, 255, 200)(i)
    case 'bright': return chalk.green(i)
    case 'moderate': return chalk.blue(i)
    case 'dim': return chalk.yellow(i)
    case 'dark': return chalk.rgb(255, 165, 0)(i)
    case 'opaque': return chalk.red(i)
    default: return chalk.dim(i)
  }
}

function bayCondColor(c: string): string {
  switch (c) {
    case 'radiant': return chalk.rgb(255, 215, 0)(c)
    case 'bright': return chalk.green(c)
    case 'lit': return chalk.blue(c)
    case 'dim': return chalk.yellow(c)
    case 'dark': return chalk.rgb(255, 165, 0)(c)
    case 'black': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-glazier': return chalk.rgb(255, 215, 0)(g)
    case 'glazier': return chalk.green(g)
    case 'artisan': return chalk.blue(g)
    case 'apprentice': return chalk.cyan(g)
    case 'hobbyist': return chalk.yellow(g)
    case 'vandal': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Pane Formatting ─────────────────────────────────────────────────────────

function formatPane(p: WindowPane, verbose: boolean): string {
  const line = ` ${illuminationColor(p.illumination)} ${glassColor(p.glass.type)} ${chalk.bold(p.file)} q:${scoreColor(p.qualityScore)} lum:${scoreColor(p.luminosity)} tx:${scoreColor(p.lightTransmission)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    clarity:${scoreColor(p.glassClarity)} color:${scoreColor(p.colorIntensity)} frame:${scoreColor(p.frameSupport)} lead:${scoreColor(p.leadingQuality)} opacity:${scoreColor(p.opacity)}`)
  details.push(`    glass:${p.glass.condition} frame:${p.frame.material} bubbles:${p.glass.bubbleCount} striations:${p.glass.striationCount}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format stained glass window result as a table
 * @example
 * formatStainedGlassWindowTable(result, false) // string
 */
export function formatStainedGlassWindowTable(result: StainedGlassWindowResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🪟 Stained Glass Window - Code Transparency Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🔲 Window Panes'))
  if (result.panes.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.panes : result.panes.slice(0, 15)
    for (const p of display) {
      lines.push(formatPane(p, verbose))
    }
    if (!verbose && result.panes.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.panes.length - 15} more`))
    }
  }
  lines.push('')

  if (result.bays.length > 0) {
    lines.push(chalk.bold('🏛️ Window Bays'))
    for (const b of result.bays) {
      lines.push(`  ${chalk.bold(b.directory)} ${bayCondColor(b.condition)} illum:${scoreColor(b.bayIllumination)} panes:${b.panes.length} type:${b.bayType}`)
    }
    lines.push('')
  }

  const c = result.cathedral
  lines.push(chalk.bold('⛪ Cathedral'))
  lines.push(`  Transmission: ${scoreColor(c.totalLightTransmission)} | Clarity: ${scoreColor(c.avgGlassClarity)} | Luminosity: ${scoreColor(c.avgLuminosity)} | Frame: ${scoreColor(c.avgFrameIntegrity)} | Leading: ${scoreColor(c.avgLeadingQuality)}`)
  lines.push(`  Well-lit: ${c.isWellIlluminated ? chalk.green('YES') : chalk.yellow('NO')} | Gaps: ${c.totalGaps} | Cracks: ${c.totalCracks}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.glazierGrade)} | Files: ${s.totalFiles} | Bays: ${s.totalBays} | Luminosity: ${scoreColor(s.overallLuminosity)}`)
  lines.push(`  Brilliant:${s.brilliantPanes} Bright:${s.brightPanes} Dim:${s.dimPanes} Dark:${s.darkPanes} Opaque:${s.opaquePanes}`)
  lines.push(`  Cathedral:${s.cathedralGlass} Transparent:${s.transparentGlass} Pristine:${s.pristineCount} Cracked:${s.crackedCount} Broken:${s.brokenCount}`)
  lines.push(`  Bubbles:${s.totalBubbles} Striations:${s.totalStriations} Inclusions:${s.totalInclusions} Gaps:${s.totalGaps} Overlaps:${s.totalOverlaps} Loose:${s.totalLooseJoints}`)
  lines.push(`  Brightest: ${chalk.green(s.brightestPane)} | Darkest: ${chalk.red(s.darkestPane)} | BestFrame: ${chalk.blue(s.bestFramed)} | BestLed: ${chalk.cyan(s.bestLed)}`)

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
 * Format stained glass window result as JSON
 * @example
 * formatStainedGlassWindowJson(result) // string
 */
export function formatStainedGlassWindowJson(result: StainedGlassWindowResult): string {
  return JSON.stringify(result, null, 2)
}
