import chalk from 'chalk'
import type { StarlightResult, StellarFile, StarlightStats } from './starlight-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function spectralColor(t: string): string {
  if (t === 'O') return chalk.rgb(155, 176, 255)(t)
  if (t === 'B') return chalk.rgb(170, 191, 255)(t)
  if (t === 'A') return chalk.rgb(202, 215, 255)(t)
  if (t === 'F') return chalk.rgb(248, 247, 255)(t)
  if (t === 'G') return chalk.rgb(255, 244, 234)(t)
  if (t === 'K') return chalk.rgb(255, 210, 161)(t)
  return chalk.rgb(255, 160, 100)(t)
}

function classificationColor(c: string): string {
  if (c === 'supergiant') return chalk.rgb(155, 176, 255)(c)
  if (c === 'giant') return chalk.blue(c)
  if (c === 'main-sequence') return chalk.green(c)
  if (c === 'neutron-star') return chalk.magenta(c)
  if (c === 'dwarf') return chalk.yellow(c)
  if (c === 'white-dwarf') return chalk.cyan(c)
  return chalk.dim(c)
}

function clarityColor(o: string): string {
  if (o === 'blinding') return chalk.rgb(155, 176, 255)(o)
  if (o === 'bright') return chalk.green(o)
  if (o === 'clear') return chalk.cyan(o)
  if (o === 'dim') return chalk.yellow(o)
  return chalk.red(o)
}

function nebulaColor(t: string): string {
  if (t === 'emission') return chalk.magenta(t)
  if (t === 'reflection') return chalk.blue(t)
  if (t === 'dark') return chalk.dim(t)
  return chalk.cyan(t)
}

// ─── Stellar File Formatting ───────────────────────────────────────────────

function formatStellarFile(f: StellarFile): string {
  const markers: string[] = []
  if (f.isVariable) markers.push(chalk.yellow('variable'))
  if (f.isBinary) markers.push(chalk.magenta('binary'))
  const markerStr = markers.length > 0 ? ` ${markers.join(',')}` : ''

  return `  ${chalk.bold(f.file)} ${spectralColor(f.spectralType)} lum:${scoreColor(f.luminosity)} bright:${scoreColor(f.brightness)} temp:${scoreColor(f.temperature)} ${classificationColor(f.classification)}${markerStr}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: StarlightStats): string {
  return [
    `  Clarity: ${clarityColor(stats.overallClarity)} | Sky Brightness: ${scoreColor(stats.skyBrightness)} | Luminosity: ${scoreColor(stats.avgLuminosity)}`,
    `  Brightness: ${scoreColor(stats.avgBrightness)} | Temperature: ${scoreColor(stats.avgTemperature)} | Files: ${stats.totalFiles}`,
    `  Supergiants: ${chalk.blue(String(stats.supergiants))} | Main Sequence: ${chalk.green(String(stats.mainSequence))} | Dwarfs: ${chalk.yellow(String(stats.dwarfs))} | Black Dwarfs: ${chalk.dim(String(stats.blackDwarfs))}`,
    `  Variable Stars: ${chalk.yellow(String(stats.variableStars))} | Binary Systems: ${chalk.magenta(String(stats.binarySystems))} | Nebulae: ${stats.totalNebulae} (Dark: ${stats.darkNebulae})`,
    `  Brightest: ${chalk.green(stats.brightestFile || 'N/A')} | Dimmest: ${chalk.red(stats.dimmestFile || 'N/A')}`,
  ].join('\n')
}

// ─── Spectral Distribution ─────────────────────────────────────────────────

function formatSpectralDistribution(dist: Record<string, number>): string {
  const types = ['O', 'B', 'A', 'F', 'G', 'K', 'M']
  const max = Math.max(1, ...Object.values(dist))
  return types.map(t => {
    const count = dist[t] || 0
    const bar = '█'.repeat(Math.round((count / max) * 20))
    return `  ${spectralColor(t)} ${bar} ${count}`
  }).join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format starlight result as a table
 * @example
 * formatStarlightTable(result, false) // string
 */
export function formatStarlightTable(result: StarlightResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n✨ Starlight - Code Luminosity Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🌟 Stellar Files'))
  if (result.files.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.files : result.files.slice(0, 15)
    for (const f of display) {
      lines.push(formatStellarFile(f))
    }
    if (!verbose && result.files.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.files.length - 15} more`))
    }
  }
  lines.push('')

  if (result.nebulae.length > 0) {
    lines.push(chalk.bold('🌫️ Nebulae'))
    const display = verbose ? result.nebulae : result.nebulae.slice(0, 8)
    for (const n of display) {
      lines.push(`  ${chalk.cyan(n.name)} ${nebulaColor(n.type)} density:${scoreColor(n.density)} files:${n.files.length} ${chalk.dim(n.description)}`)
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Spectral Distribution'))
  lines.push(formatSpectralDistribution(result.stats.spectralDistribution))
  lines.push('')

  lines.push(chalk.bold('📈 Statistics'))
  lines.push(formatStats(result.stats))

  if (verbose && result.stats.hertzsprungRussell.length > 0) {
    lines.push('')
    lines.push(chalk.bold('🔭 H-R Diagram (temperature → luminosity)'))
    for (const pt of result.stats.hertzsprungRussell) {
      const tempBar = '░'.repeat(Math.round(pt.x / 5))
      const lumBar = '▓'.repeat(Math.round(pt.y / 5))
      lines.push(`  ${chalk.dim(pt.file)} ${tempBar}${lumBar}`)
    }
  }

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

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format starlight result as JSON
 * @example
 * formatStarlightJson(result) // string
 */
export function formatStarlightJson(result: StarlightResult): string {
  return JSON.stringify(result, null, 2)
}
