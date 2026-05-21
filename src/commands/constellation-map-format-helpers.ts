import chalk from 'chalk'
import type { ConstellationMapResult, StarNode, ConstellationGroup, GalacticStructure } from './constellation-map-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function spectralColor(sc: string): string {
  switch (sc) {
    case 'O': return chalk.rgb(100, 149, 237)(sc)
    case 'B': return chalk.rgb(135, 206, 250)(sc)
    case 'A': return chalk.white(sc)
    case 'F': return chalk.rgb(255, 255, 224)(sc)
    case 'G': return chalk.rgb(255, 215, 0)(sc)
    case 'K': return chalk.rgb(255, 165, 0)(sc)
    case 'M': return chalk.rgb(255, 69, 0)(sc)
    default: return chalk.dim(sc)
  }
}

function starTypeColor(st: string): string {
  switch (st) {
    case 'supergiant': return chalk.rgb(255, 215, 0)(st)
    case 'giant': return chalk.rgb(255, 165, 0)(st)
    case 'dwarf': return chalk.cyan(st)
    case 'neutron': return chalk.magenta(st)
    case 'white-dwarf': return chalk.white(st)
    case 'brown-dwarf': return chalk.rgb(139, 90, 43)(st)
    default: return chalk.dim(st)
  }
}

function healthColor(h: string): string {
  switch (h) {
    case 'vibrant': return chalk.green(h)
    case 'healthy': return chalk.blue(h)
    case 'stable': return chalk.yellow(h)
    case 'fading': return chalk.rgb(255, 165, 0)(h)
    case 'dim': return chalk.rgb(255, 69, 0)(h)
    case 'dark': return chalk.rgb(139, 0, 0)(h)
    default: return chalk.dim(h)
  }
}

function patternColor(p: string): string {
  switch (p) {
    case 'star': return chalk.rgb(255, 215, 0)(p)
    case 'mesh': return chalk.green(p)
    case 'tree': return chalk.blue(p)
    case 'chain': return chalk.yellow(p)
    case 'ring': return chalk.magenta(p)
    case 'bus': return chalk.cyan(p)
    case 'isolated': return chalk.dim(p)
    default: return chalk.dim(p)
  }
}

function structureColor(s: string): string {
  switch (s) {
    case 'spiral': return chalk.rgb(255, 215, 0)(s)
    case 'elliptical': return chalk.green(s)
    case 'cluster': return chalk.blue(s)
    case 'irregular': return chalk.rgb(255, 165, 0)(s)
    case 'void': return chalk.rgb(139, 0, 0)(s)
    default: return chalk.dim(s)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-astronomer': return chalk.rgb(255, 215, 0)(g)
    case 'astronomer': return chalk.green(g)
    case 'navigator': return chalk.blue(g)
    case 'stargazer': return chalk.yellow(g)
    case 'lost': return chalk.rgb(255, 165, 0)(g)
    case 'blind': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Star Formatting ─────────────────────────────────────────────────────────

function formatStar(s: StarNode, verbose: boolean): string {
  const markers: string[] = []
  if (s.isNexus) markers.push(chalk.rgb(255, 215, 0)('NX'))
  if (s.isOrphan) markers.push(chalk.dim('OR'))
  if (s.isBridge) markers.push(chalk.cyan('BR'))
  if (s.isHub) markers.push(chalk.blue('HB'))
  const marker = markers.length > 0 ? markers.join(',') : ' '

  const line = ` ${marker} ${chalk.bold(s.file)} ${spectralColor(s.spectralClass)} ${starTypeColor(s.starType)} bright:${scoreColor(s.brightness)} lum:${scoreColor(s.luminosity)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    mag:${s.magnitude} dist:${s.distance} pos:(${s.position.x},${s.position.y}) imports:${s.imports.length} importedBy:${s.importedBy.length}`)
  if (s.connections.length > 0) {
    const connTypes = s.connections.map(c => `${c.from}->${c.to}(${c.type})`)
    details.push(`    conns: ${connTypes.join(', ')}`)
  }
  return details.join('\n')
}

// ─── Constellation Formatting ────────────────────────────────────────────────

function formatConstellation(c: ConstellationGroup, verbose: boolean): string {
  const line = `  ${chalk.bold(c.mythologicalName)} (${c.name}) ${patternColor(c.pattern)} ${healthColor(c.health)} stars:${c.starCount} bright:${scoreColor(c.avgBrightness)} coherence:${scoreColor(c.coherence)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    internal:${c.internalConnections} external:${c.externalConnections} bridges:${c.bridgeCount} density:${c.density} cycles:${c.cycleCount}`)
  details.push(`    brightest:${chalk.green(c.brightestStar)} hub:${chalk.blue(c.hubStar)}`)
  return details.join('\n')
}

// ─── Galaxy Formatting ───────────────────────────────────────────────────────

function formatGalaxy(g: GalacticStructure): string {
  return [
    `  Stars: ${g.totalStars} | Connections: ${g.totalConnections} | Constellations: ${g.totalConstellations} | Brightness: ${scoreColor(g.avgBrightness)} | Coherence: ${scoreColor(Math.round(g.avgCoherence * 100))}`,
    `  Bridges: ${g.totalBridges} | Cycles: ${chalk.red(String(g.totalCycles))} | Nexus: ${chalk.rgb(255, 215, 0)(String(g.nexusCount))} | Orphans: ${chalk.dim(String(g.orphanCount))} | Hubs: ${chalk.blue(String(g.hubCount))} | InterRatio: ${g.interConstellationRatio}`,
    `  Connectivity: ${scoreColor(g.connectivity)} | WellStructured: ${g.isWellStructured ? chalk.green('yes') : chalk.red('no')} | Structure: ${structureColor(g.structureType)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format constellation map result as a table
 * @example
 * formatConstellationMapTable(result, false) // string
 */
export function formatConstellationMapTable(result: ConstellationMapResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌟 Constellation Map - Code Dependency Sky Chart\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('⭐ Stars'))
  if (result.stars.length === 0) {
    lines.push(chalk.dim('  No stars detected.'))
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
    lines.push(chalk.bold('🔭 Constellations'))
    for (const c of result.constellations) {
      lines.push(formatConstellation(c, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('🌌 Galactic Structure'))
  lines.push(formatGalaxy(result.galaxy))
  lines.push('')

  lines.push(chalk.bold('📊 Statistics'))
  const s = result.stats
  lines.push(`  Grade: ${gradeColor(s.cartographerGrade)} | Brightest: ${chalk.green(s.brightestStar)} | Dimmest: ${chalk.red(s.dimmestStar)}`)
  lines.push(`  Biggest: ${chalk.blue(s.biggestConstellation)} | Hub: ${chalk.cyan(s.mostConnected)} | Isolated: ${chalk.dim(s.mostIsolated)} | Bridged: ${chalk.magenta(s.mostBridged)}`)
  lines.push(`  Supergiants: ${chalk.rgb(255, 215, 0)(String(s.supergiantCount))} | Dwarfs: ${chalk.rgb(139, 90, 43)(String(s.dwarfCount))} | AvgStrength: ${scoreColor(s.avgConnectionStrength)}`)

  if (s.cycleWarning.length > 0) {
    lines.push('')
    lines.push(chalk.bold(chalk.red('⚠  Cycle Warnings')))
    for (const f of s.cycleWarning) {
      lines.push(`  ${chalk.red(f)}`)
    }
  }

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
 * Format constellation map result as JSON
 * @example
 * formatConstellationMapJson(result) // string
 */
export function formatConstellationMapJson(result: ConstellationMapResult): string {
  return JSON.stringify(result, null, 2)
}
