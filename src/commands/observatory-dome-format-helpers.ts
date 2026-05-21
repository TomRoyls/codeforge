import chalk from 'chalk'
import type { ObservatoryDomeResult, CelestialBody, Constellation, ObservatoryDomeStats, CosmicMap } from './observatory-dome-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function spectralColor(s: string): string {
  switch (s) {
    case 'O': return chalk.rgb(157, 120, 255)(s)
    case 'B': return chalk.rgb(140, 160, 255)(s)
    case 'A': return chalk.rgb(200, 210, 255)(s)
    case 'F': return chalk.rgb(255, 255, 200)(s)
    case 'G': return chalk.rgb(255, 240, 150)(s)
    case 'K': return chalk.rgb(255, 200, 100)(s)
    case 'M': return chalk.rgb(255, 150, 100)(s)
    default: return chalk.dim(s)
  }
}

function bodyTypeColor(b: string): string {
  switch (b) {
    case 'star': return chalk.rgb(255, 215, 0)(b)
    case 'planet': return chalk.blue(b)
    case 'moon': return chalk.gray(b)
    case 'asteroid': return chalk.dim(b)
    case 'comet': return chalk.cyan(b)
    case 'dwarf-planet': return chalk.rgb(180, 130, 100)(b)
    case 'black-hole': return chalk.rgb(80, 0, 80)(b)
    case 'neutron-star': return chalk.magenta(b)
    case 'pulsar': return chalk.rgb(255, 100, 100)(b)
    default: return chalk.dim(b)
  }
}

function stabilityColor(s: string): string {
  switch (s) {
    case 'stable': return chalk.green(s)
    case 'variable': return chalk.yellow(s)
    case 'eruptive': return chalk.rgb(255, 165, 0)(s)
    case 'cataclysmic': return chalk.red(s)
    case 'supernova': return chalk.rgb(255, 69, 0)(s)
    default: return chalk.dim(s)
  }
}

function ageColor(a: string): string {
  switch (a) {
    case 'protostar': return chalk.cyan(a)
    case 'main-sequence': return chalk.green(a)
    case 'red-giant': return chalk.red(a)
    case 'white-dwarf': return chalk.white(a)
    case 'black-dwarf': return chalk.dim(a)
    case 'neutron-star': return chalk.magenta(a)
    default: return chalk.dim(a)
  }
}

function healthColor(h: string): string {
  switch (h) {
    case 'vibrant': return chalk.rgb(255, 215, 0)(h)
    case 'stable': return chalk.green(h)
    case 'aging': return chalk.yellow(h)
    case 'dying': return chalk.rgb(255, 165, 0)(h)
    case 'dead': return chalk.red(h)
    default: return chalk.dim(h)
  }
}

function galaxyColor(g: string): string {
  switch (g) {
    case 'spiral': return chalk.rgb(255, 215, 0)(g)
    case 'elliptical': return chalk.green(g)
    case 'irregular': return chalk.red(g)
    case 'lenticular': return chalk.blue(g)
    case 'dwarf': return chalk.dim(g)
    case 'void': return chalk.gray(g)
    default: return chalk.dim(g)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'hubble': return chalk.rgb(255, 215, 0)(g)
    case 'ground-telescope': return chalk.green(g)
    case 'binoculars': return chalk.blue(g)
    case 'naked-eye': return chalk.yellow(g)
    case 'blind': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function classificationColor(c: string): string {
  switch (c) {
    case 'observable': return chalk.green(c)
    case 'detectable': return chalk.blue(c)
    case 'theoretical': return chalk.yellow(c)
    case 'hidden': return chalk.dim(c)
    default: return chalk.dim(c)
  }
}

// ─── Body Formatting ─────────────────────────────────────────────────────────

function formatBody(b: CelestialBody, verbose: boolean): string {
  const markers: string[] = []
  if (b.isBlackHole) markers.push(chalk.rgb(80, 0, 80)('BH'))
  if (b.isSupernova) markers.push(chalk.rgb(255, 69, 0)('SN'))
  if (b.isNebula) markers.push(chalk.cyan('NE'))
  if (b.isDarkMatter) markers.push(chalk.gray('DM'))
  if (b.isPulsar) markers.push(chalk.rgb(255, 100, 100)('PS'))
  if (b.habitableZone) markers.push(chalk.green('HZ'))
  if (b.isBinarySystem) markers.push(chalk.blue('BS'))
  const marker = markers.length > 0 ? markers.join(',') : ' '

  const line = ` ${marker} ${chalk.bold(b.name)} ${spectralColor(b.spectralType)} ${bodyTypeColor(b.bodyType)} lum:${scoreColor(b.luminosity)} mag:${scoreColor(b.magnitude)} mass:${scoreColor(b.mass)} temp:${scoreColor(b.temperature)} ${stabilityColor(b.stability)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    grav:${scoreColor(b.gravity)} dist:${scoreColor(b.distance)} orbital:${scoreColor(b.orbitalPeriod)} age:${ageColor(b.age)} ${classificationColor(b.classification)}`)
  details.push(`    influences:${b.influences.length} influencedBy:${b.influencedBy.length} satellites:${b.satellites.length} companions:${b.companions.length}`)
  if (b.observationNotes.length > 0) {
    details.push(`    notes:${b.observationNotes.length}`)
  }
  return details.join('\n')
}

// ─── Constellation Formatting ────────────────────────────────────────────────

function formatConstellation(c: Constellation, verbose: boolean): string {
  const line = `  ${chalk.bold(c.name)} ${healthColor(c.health)} bodies:${c.bodies.length} lum:${scoreColor(c.avgLuminosity)} mass:${scoreColor(c.totalMass)} ${c.dominantBodyType}`

  if (!verbose) return line
  const details = [line]
  details.push(`    stars:${c.starCount} planets:${c.planetCount} BH:${c.blackHoleCount} nebula:${c.nebulaCount} binary:${c.binarySystemCount} formation:${c.formation}`)
  details.push(`    center:${c.gravitationalCenter} dense:${c.isDense} sparse:${c.isSparse} spectral:${c.dominantSpectralType}`)
  return details.join('\n')
}

// ─── Cosmic Map Formatting ───────────────────────────────────────────────────

function formatCosmicMap(cm: CosmicMap): string {
  return [
    `  Luminosity: ${scoreColor(cm.totalLuminosity)} | Mass: ${scoreColor(cm.totalMass)} | Distance: ${scoreColor(cm.avgDistance)} | Magnitude: ${scoreColor(cm.avgMagnitude)}`,
    `  Black Holes: ${chalk.rgb(80, 0, 80)(String(cm.blackHoles))} | Supernovae: ${chalk.rgb(255, 69, 0)(String(cm.supernovae))} | Nebulae: ${chalk.cyan(String(cm.nebulae))} | Dark Matter: ${chalk.gray(String(cm.darkMatter))}`,
    `  Pulsars: ${chalk.rgb(255, 100, 100)(String(cm.pulsars))} | Binary: ${chalk.blue(String(cm.binarySystems))} | Habitable: ${chalk.green(String(cm.habitableBodies))} | Background: ${scoreColor(cm.cosmicBackground)}`,
  ].join('\n')
}

// ─── Stats Formatting ────────────────────────────────────────────────────────

function formatStats(stats: ObservatoryDomeStats): string {
  return [
    `  Files: ${stats.totalFiles} | Constellations: ${stats.totalConstellations} | Stars: ${chalk.rgb(255, 215, 0)(String(stats.stars))} | Planets: ${chalk.blue(String(stats.planets))} | Moons: ${chalk.gray(String(stats.moons))}`,
    `  Black Holes: ${chalk.rgb(80, 0, 80)(String(stats.blackHoles))} | Supernovae: ${chalk.rgb(255, 69, 0)(String(stats.supernovae))} | Nebulae: ${chalk.cyan(String(stats.nebulae))} | Dark Matter: ${chalk.gray(String(stats.darkMatter))} | Pulsars: ${chalk.rgb(255, 100, 100)(String(stats.pulsars))}`,
    `  Avg Lum: ${scoreColor(stats.avgLuminosity)} | Avg Mag: ${scoreColor(stats.avgMagnitude)} | Avg Dist: ${scoreColor(stats.avgDistance)} | Avg Temp: ${scoreColor(stats.avgTemperature)}`,
    `  Brightest: ${chalk.green(stats.brightestBody)} | Dimmest: ${chalk.red(stats.dimmestBody)} | Heaviest: ${chalk.yellow(stats.heaviestBody)}`,
    `  Influential: ${chalk.magenta(stats.mostInfluential)} | Center: ${chalk.rgb(255, 215, 0)(stats.gravitationalCenter)}`,
    `  Galaxy: ${galaxyColor(stats.galaxyType)} | Grade: ${gradeColor(stats.observationGrade)} | Background: ${scoreColor(stats.cosmicBackground)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format observatory dome result as a table
 * @example
 * formatObservatoryDomeTable(result, false) // string
 */
export function formatObservatoryDomeTable(result: ObservatoryDomeResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🔭 Observatory Dome - Celestial Code Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🌟 Celestial Bodies'))
  if (result.bodies.length === 0) {
    lines.push(chalk.dim('  No celestial bodies detected.'))
  } else {
    const display = verbose ? result.bodies : result.bodies.slice(0, 15)
    for (const b of display) {
      lines.push(formatBody(b, verbose))
    }
    if (!verbose && result.bodies.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.bodies.length - 15} more`))
    }
  }
  lines.push('')

  if (result.constellations.length > 0) {
    lines.push(chalk.bold('✨ Constellations'))
    for (const c of result.constellations) {
      lines.push(formatConstellation(c, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('🌌 Cosmic Map'))
  lines.push(formatCosmicMap(result.cosmicMap))

  lines.push('')
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
 * Format observatory dome result as JSON
 * @example
 * formatObservatoryDomeJson(result) // string
 */
export function formatObservatoryDomeJson(result: ObservatoryDomeResult): string {
  return JSON.stringify(result, null, 2)
}
