import chalk from 'chalk'
import type { StarModule, Constellation, ConstellationChartResult } from './constellation-chart-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function spectralColor(t: string): string {
  switch (t) {
    case 'O-blue': return chalk.rgb(100, 149, 237)(t)
    case 'B-blue-white': return chalk.rgb(173, 216, 230)(t)
    case 'A-white': return chalk.white(t)
    case 'F-yellow-white': return chalk.rgb(255, 255, 224)(t)
    case 'G-yellow': return chalk.yellow(t)
    case 'K-orange': return chalk.rgb(255, 165, 0)(t)
    case 'M-red': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function constellationTypeColor(t: string): string {
  switch (t) {
    case 'zodiac': return chalk.rgb(255, 215, 0)(t)
    case 'major': return chalk.green(t)
    case 'minor': return chalk.blue(t)
    case 'asterism': return chalk.cyan(t)
    case 'cloud': return chalk.yellow(t)
    case 'void': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'brilliant': return chalk.rgb(255, 215, 0)(c)
    case 'bright': return chalk.green(c)
    case 'visible': return chalk.blue(c)
    case 'dim': return chalk.yellow(c)
    case 'faint': return chalk.rgb(255, 165, 0)(c)
    case 'invisible': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'chief-astronomer': return chalk.rgb(255, 215, 0)(g)
    case 'astronomer': return chalk.green(g)
    case 'stargazer': return chalk.blue(g)
    case 'navigator': return chalk.cyan(g)
    case 'lost': return chalk.yellow(g)
    case 'blind': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Star Formatting ─────────────────────────────────────────────────────────

function formatStar(s: StarModule, verbose: boolean): string {
  const flags: string[] = []
  if (s.isBinary) flags.push('binary')
  if (s.isCluster) flags.push('cluster')
  if (s.isVariable) flags.push('variable')
  if (s.isSupergiant) flags.push('supergiant')
  if (s.isDwarf) flags.push('dwarf')
  if (s.isNeutron) flags.push('neutron')
  if (s.isDark) flags.push('dark')

  const flagStr = flags.length > 0 ? chalk.dim(`[${flags.join(',')}]`) : ''

  const line = ` ${spectralColor(s.spectralType)} ${chalk.bold(s.file)} mag:${scoreColor(s.magnitude)} bright:${scoreColor(s.brightness)} lum:${scoreColor(s.luminosity)} temp:${scoreColor(s.temperature)} conn:${scoreColor(s.connectionStrength)} ${flagStr}`

  if (!verbose) return line

  const details = [line]
  details.push(`    quality:${scoreColor(s.qualityScore)} age:${scoreColor(s.age)} dist:${scoreColor(s.distance)} connections:${s.connections.length} ${s.binaryPartner ? 'partner:' + s.binaryPartner : ''}`)
  return details.join('\n')
}

// ─── Constellation Formatting ────────────────────────────────────────────────

function formatConstellation(c: Constellation): string {
  return `  ${chalk.bold(c.name)} ${constellationTypeColor(c.constellationType)} ${conditionColor(c.condition)} stars:${c.stars.length} coherence:${scoreColor(c.coherence)} mythology:${scoreColor(c.mythologyClarity)} conn:${c.connectionCount} bright:${scoreColor(c.avgBrightness)} ${c.hasCore ? chalk.green('core:' + c.coreStar) : chalk.red('no-core')} ${c.isBound ? chalk.green('bound') : c.isLoose ? chalk.red('loose') : chalk.yellow('moderate')}`
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format constellation chart result as a table
 * @example
 * formatConstellationChartTable(result, false) // string
 */
export function formatConstellationChartTable(result: ConstellationChartResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n✨  Constellation Chart - Module Relationship/Pattern Mapping\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('⭐ Star Modules'))
  if (result.stars.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.stars : result.stars.slice(0, 15)
    for (const s of display) {
      lines.push(formatStar(s, verbose))
    }
    if (!verbose && result.stars.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.stars.length - 15} more`))
    }
  }
  lines.push('')

  if (result.constellations.length > 0) {
    lines.push(chalk.bold('🌌 Constellations'))
    for (const c of result.constellations) {
      lines.push(formatConstellation(c))
    }
    lines.push('')
  }

  const sky = result.sky
  lines.push(chalk.bold('🌠 Sky Overview'))
  lines.push(`  Brightness:${scoreColor(sky.avgBrightness)} Coherence:${scoreColor(sky.avgCoherence)} ConnectionStr:${scoreColor(sky.avgConnectionStrength)} Connections:${sky.totalConnections} Clear:${sky.isClear ? chalk.green('YES') : chalk.red('NO')} Clarity:${scoreColor(sky.overallClarity)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.astronomerGrade)} | Clarity: ${scoreColor(s.overallClarity)} | Files: ${s.totalFiles} | Constellations: ${s.totalConstellations}`)
  lines.push(`  Supergiants:${s.supergiantCount} Dwarfs:${s.dwarfCount} Neutrons:${s.neutronCount} Dark:${s.darkCount} Binary:${s.binaryCount} Cluster:${s.clusterCount} Variable:${s.variableCount}`)
  lines.push(`  AvgMag:${scoreColor(s.avgMagnitude)} AvgBright:${scoreColor(s.avgBrightness)} AvgLum:${scoreColor(s.avgLuminosity)} AvgTemp:${scoreColor(s.avgTemperature)} AvgAge:${scoreColor(s.avgAge)}`)
  lines.push(`  Zodiac:${s.zodiacConstellations} Major:${s.majorConstellations} Minor:${s.minorConstellations} Cloud:${s.cloudConstellations} Void:${s.voidConstellations}`)
  lines.push(`  Brilliant:${s.brilliantConstellations} Invisible:${s.invisibleConstellations} TotalConn:${s.totalConnections}`)
  lines.push(`  Brightest:${chalk.green(s.brightestStar)} | MostConnected:${chalk.cyan(s.mostConnected)} | MostCoherent:${chalk.blue(s.mostCoherent)}`)
  lines.push(`  BestMythology:${chalk.rgb(255, 215, 0)(s.bestMythology)} | DarkestRegion:${chalk.red(s.darkestRegion)}`)

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
 * Format constellation chart result as JSON
 * @example
 * formatConstellationChartJson(result) // string
 */
export function formatConstellationChartJson(result: ConstellationChartResult): string {
  return JSON.stringify(result, null, 2)
}
